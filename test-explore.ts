import sql from './lib/server/db';

async function test() {
  try {
    const q = 'fuda';
    const query = `%${q}%`;
    const rows = await sql`
      SELECT 
        u.username,
        u.image as user_image,
        u.custom_image,
        -- Attempt to parse the JSON string literal if needed
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'name' as parsed_name,
        ((r.resume_data#>>'{}')::jsonb)->'header'->>'shortAbout' as parsed_short_about,
        r.resume_data->'header'->>'name' as direct_name,
        r.updated_at
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
      LIMIT 10
    `;
    console.log('Results:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

test();
