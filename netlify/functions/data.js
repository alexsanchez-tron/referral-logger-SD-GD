exports.handler = async function(event) {
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appkeBNtp0aZWNYH3';
  const table  = 'Responses';

  if (!token) return { statusCode: 500, body: JSON.stringify({ error: 'AIRTABLE_TOKEN not set' }) };

  try {
    let allRecords = [];
    let offset = null;

    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
      url.searchParams.set('pageSize', '100');
      url.searchParams.set('sort[0][field]', 'Logged At');
      url.searchParams.set('sort[0][direction]', 'desc');
      if (offset) url.searchParams.set('offset', offset);

      const res  = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };

      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: allRecords })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
