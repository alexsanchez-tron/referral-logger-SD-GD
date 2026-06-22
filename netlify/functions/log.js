exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appkeBNtp0aZWNYH3';
  const table  = 'Responses';

  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AIRTABLE_TOKEN not set' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const fields = {
    'Source':    body.source   || '',
    'Channel':   body.channel  || '',
    'Logged At': body.loggedAt || '',
    'Date':      body.date     || '',
  };

  if (body.driver) fields['Driver'] = body.driver;

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
    return { statusCode: 200, body: JSON.stringify({ id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
