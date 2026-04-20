# StadiumFlow

StadiumFlow is a Next.js venue operations dashboard for live events. It combines real-time crowd telemetry, route recommendations, and an AI assistant so attendees and venue teams can make faster decisions during high-traffic entry windows.

## Features

- Live gate wait times and status monitoring
- Zone heatmap for crowd pressure across the venue
- Gemini-powered venue assistant for routing and support questions
- Firebase-backed live state with local fallback behavior
- Google Maps embeds and directions for gate navigation

## Problem Statement Alignment

StadiumFlow addresses venue management during large live events by improving:

- Scalability through real-time crowd state handling across gates and zones
- Analytics through live wait times, congestion levels, and alert visibility
- Realtime decision-making with continuously updated venue telemetry
- Attendee flow through route guidance and gate recommendations
- Operations visibility for staff coordinating entry and crowd distribution

## Google Services Used

- Gemini API via `@google/genai` for the in-app assistant
- Firebase Realtime Database for live venue telemetry
- Google Maps Platform for map embeds and directions
- Google Cloud Run deployment support through the provided container setup

## Accessibility

- Root document uses `lang="en"`
- Responsive viewport metadata is defined in the app layout
- High-contrast UI choices are used throughout the interface
- Venue assistant content includes accessibility guidance for elevators and seating

## Testing

The repository includes an automated test file in `__tests__/app.test.js` and a working `npm test` command using Node's built-in test runner.

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_rtdb_url
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key
```
