import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, {
  transform: postgres.camel,
  // Crucial for Vercel Serverless + Supabase pooler
  max: 1,
  prepare: false,
  ssl: 'require',
});

export default sql;
