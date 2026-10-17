// Placeholder env vars so route handlers get past their config checks;
// tests mock the actual network and DB calls.
process.env.VERCEL_API_TOKEN ??= 'test-token';
process.env.VERCEL_PROJECT_ID ??= 'test-project';
