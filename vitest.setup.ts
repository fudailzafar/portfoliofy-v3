// Placeholder env vars for route handlers that check for their presence
// before doing real network/DB work. Individual tests mock the calls that
// would actually use these values.
process.env.VERCEL_API_TOKEN ??= 'test-token';
process.env.VERCEL_PROJECT_ID ??= 'test-project';
