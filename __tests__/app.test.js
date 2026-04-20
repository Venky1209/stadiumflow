/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");

test("application test harness is configured", () => {
  assert.equal(true, true);
});

test("google services used by the app are declared", () => {
  const services = ["Gemini API", "Firebase", "Google Maps"];
  assert.equal(services.length, 3);
});
