import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  transform: postgres.camel,
  // Ensure we use the right ssl config for Supabase if needed, but default is fine.
  ssl: 'require',
});

export default sql;
