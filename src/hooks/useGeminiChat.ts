'use client';

import { useState, useCallback } from 'react';
import type { ChatMessage, VenueState } from '@/types/venue';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAX_RETRIES = 3;

function buildSystemPrompt(venueState: VenueState): string {
  return `You are StadiumFlow AI, a friendly venue assistant for ${venueState.stadiumName}, a ${venueState.capacity.toLocaleString()}-seat stadium.

PERSONALITY: Warm, concise, confident. Like a knowledgeable friend who works at the venue.

RULES:
- Answer in 1-3 sentences. Be concise and helpful.
- Always cite specific gate names and exact wait times from the live data below.
- Never invent data not in the context.
- If a gate is closed, do NOT recommend it.
- If a gate has "alert" status, warn the user about it.
- Suggest the fastest route or shortest wait based on the user's context.
- Be friendly and proactive — suggest alternatives when queues are long.

VENUE KNOWLEDGE (answer these even without live data):
- Restrooms: Located inside each gate entrance, additional facilities at Sections 101, 118, 201, 218
- Food & Drinks: Main concourse has concession stands every 2 sections. Premium dining at Club Level (Sections 200-220)
- Parking: Lots A-K surround the venue. Lot A is closest to North gates, Lot K to South gates
- First Aid: Medical stations at Gates A and D, plus Section 112
- Guest Services: Main desk at Gate A entrance, satellite desks at Gates C and F
- Lost & Found: Guest Services desk at Gate A
- ATMs: Located near Gates A, C, E, and G
- Smoking Areas: Designated areas outside Gates B and F only
- Accessibility: Elevator access at Gates A and D. Wheelchair seating in all sections, companion seats available
- Family Zone: Section 105-108 is alcohol-free family section

LIVE VENUE STATE (updated ${new Date(venueState.lastUpdated).toLocaleTimeString()}):
${JSON.stringify(
  {
    gates: Object.values(venueState.gates).map((g) => ({
      name: g.name,
      status: g.status,
      waitMinutes: g.waitMinutes,
      crowdLevel: g.crowdLevel,
      zone: g.zone,
    })),
    zones: Object.values(venueState.zones).map((z) => ({
      name: z.name,
      crowdPercent: z.crowdPercent,
    })),
    activeAlerts: venueState.activeAlerts?.map((a) => a.message) || [],
  },
  null,
  2
)}`;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response;

    // Retry on 503 (overloaded) and 429 (rate limit)
    if ((response.status === 503 || response.status === 429) && attempt < retries - 1) {
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    throw new Error(`Gemini API error: ${response.status}`);
  }

  throw new Error('Gemini API: max retries exceeded');
}

export function useGeminiChat(venueState: VenueState | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!venueState) return;

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        setError('Gemini API key not configured.');
        return;
      }

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const systemPrompt = buildSystemPrompt(venueState);

        const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              ...messages.map((m) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
              { role: 'user', parts: [{ text: userMessage }] },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
              topP: 0.9,
            },
          }),
        });

        const data = await response.json();
        const assistantText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that request.';

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-resp`,
          role: 'assistant',
          content: assistantText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        // Don't show error UI — just use the smart fallback silently
        setError(null);

        const fallbackMsg: ChatMessage = {
          id: `msg-${Date.now()}-fallback`,
          role: 'assistant',
          content: generateFallbackResponse(userMessage, venueState),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [venueState, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}

function generateFallbackResponse(query: string, state: VenueState): string {
  const openGates = Object.values(state.gates).filter((g) => g.status === 'open');
  const sorted = [...openGates].sort((a, b) => a.waitMinutes - b.waitMinutes);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const q = query.toLowerCase();

  // Restrooms & Bathrooms
  if (q.includes('bathroom') || q.includes('restroom') || q.includes('toilet') || q.includes('washroom')) {
    return `Restrooms are located inside each gate entrance, with additional facilities at Sections 101, 118, 201, and 218. For quickest access, enter through ${best?.name} (${best?.waitMinutes} min wait) — restrooms are right past the turnstiles.`;
  }

  // Food & Drinks
  if (q.includes('food') || q.includes('eat') || q.includes('drink') || q.includes('concession') || q.includes('hungry') || q.includes('beer') || q.includes('snack')) {
    return `Concession stands are located every 2 sections along the main concourse. For premium dining, head to Club Level (Sections 200-220). Enter via ${best?.name} for the fastest access — only ${best?.waitMinutes} min wait right now.`;
  }

  // Parking
  if (q.includes('parking') || q.includes('car') || q.includes('lot') || q.includes('drive')) {
    return `Parking Lots A-K surround the venue. Lot A is closest to North gates, Lot K to South. If you're parked in Lot A, use the North gates. Currently, ${best?.name} has the shortest wait at ${best?.waitMinutes} min.`;
  }

  // Medical / First Aid
  if (q.includes('medical') || q.includes('first aid') || q.includes('doctor') || q.includes('nurse') || q.includes('hurt') || q.includes('emergency')) {
    return `Medical stations are located at Gates A and D, plus Section 112. If this is urgent, alert any nearby staff member immediately — they carry radios to dispatch medical teams.`;
  }

  // Accessibility
  if (q.includes('wheelchair') || q.includes('accessible') || q.includes('disability') || q.includes('elevator') || q.includes('ada')) {
    return `Elevator access is available at Gates A and D. Wheelchair seating is in all sections with companion seats available. Guest Services at Gate A can assist with any accessibility needs.`;
  }

  // Lost & Found
  if (q.includes('lost') || q.includes('found') || q.includes('missing')) {
    return `Lost & Found is located at the Guest Services desk at Gate A entrance. They're open during the event and up to 2 hours after. You can also ask any staff member to radio Guest Services.`;
  }

  // ATM / Money
  if (q.includes('atm') || q.includes('cash') || q.includes('money') || q.includes('withdraw')) {
    return `ATMs are located near Gates A, C, E, and G. Most concession stands and vendors also accept contactless payments and credit cards.`;
  }

  // Smoking
  if (q.includes('smok') || q.includes('vape') || q.includes('cigarette')) {
    return `Smoking is only permitted in designated areas outside Gates B and F. Please note: re-entry policies apply — keep your ticket handy when stepping out.`;
  }

  // Family
  if (q.includes('family') || q.includes('kid') || q.includes('child') || q.includes('children')) {
    return `The Family Zone is in Sections 105-108 — it's an alcohol-free area perfect for families. Enter via ${best?.name} for the shortest wait (${best?.waitMinutes} min). Family restrooms are available at Section 108.`;
  }

  // Amenities / Map / Help
  if (q.includes('amenities') || q.includes('map') || q.includes('layout') || q.includes('where') || q.includes('find')) {
    return `Here's a quick guide: Restrooms at every gate + Sections 101, 118. Food stands every 2 sections. Medical at Gates A/D. ATMs at Gates A, C, E, G. Guest Services at Gate A. What specifically are you looking for?`;
  }

  // Shortest / Fastest
  if (q.includes('shortest') || q.includes('fastest') || q.includes('quickest') || q.includes('best') || q.includes('optimal')) {
    return `${best?.name} has the shortest wait at ${best?.waitMinutes} min. Avoid ${worst?.name} which currently has ${worst?.waitMinutes} min. I'd recommend going now — crowds tend to build.`;
  }

  // Exit / Leave
  if (q.includes('exit') || q.includes('leave') || q.includes('go home') || q.includes('end')) {
    return `For the fastest exit, use ${best?.name} (currently ${best?.waitMinutes} min). Pro tip: leave 5 minutes before the final whistle to beat the rush, or wait 15 minutes after for crowds to thin.`;
  }

  // Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q === 'hi' || q === 'hello') {
    return `Hey! Welcome to ${state.stadiumName}. Right now, ${best?.name} has the shortest wait at just ${best?.waitMinutes} min. I can help with gate routing, restrooms, food, parking, or anything else — just ask!`;
  }

  // Default — actually helpful
  return `Right now, ${best?.name} is your best bet at ${best?.waitMinutes} min. ${sorted.length > 1 ? `${sorted[1]?.name} is also good at ${sorted[1]?.waitMinutes} min.` : ''} I can also help with restrooms, food stands, parking, medical, accessibility, and more — just ask!`;
}
