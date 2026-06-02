async function testRest() {
  const url = 'https://rilahxwfndaponzgoruc.supabase.co/rest/v1/users?select=username,custom_domain&limit=1';
  const key = 'sb_publishable_Z-FZIIKZ2pls-T3w7H_KPw_J1CgsB8p'; // User provided this as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRest();
