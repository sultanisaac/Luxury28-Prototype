const BITESHIP_API_KEY = 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTHV4dXJ5MjgtUHJvdG90eXBlIiwidXNlcklkIjoiNmEwODc4NDM5YWUwN2RmYjMzMGUxNTg5IiwiaWF0IjoxNzc4OTQyMzE1fQ.HbpBrSJnir1iEYMl1lh0quDUQt5AEkk02r87sSdxLCY';
const WAREHOUSE_AREA_ID = 'IDNP32IDNC88IDND6981IDZ26111';

async function testBiteship() {
  console.log('Testing Biteship API...');
  
  try {
    // 1. Test Area Search
    console.log('\n--- Testing Area Search (Postal 12430) ---');
    const areaRes = await fetch(`https://api.biteship.com/v1/maps/areas?countries=ID&input=12430&type=single`, {
      headers: { 'Authorization': BITESHIP_API_KEY, 'Content-Type': 'application/json' }
    });
    const areaData = await areaRes.json();
    console.log('Area Result:', JSON.stringify(areaData, null, 2));

    if (areaData.areas && areaData.areas.length > 0) {
      const destAreaId = areaData.areas[0].id;
      console.log('\n--- Testing Rates Fetch ---');
      const ratesRes = await fetch(`https://api.biteship.com/v1/rates/couriers`, {
        method: 'POST',
        headers: { 'Authorization': BITESHIP_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_area_id: WAREHOUSE_AREA_ID,
          destination_area_id: destAreaId,
          couriers: 'jne,jnt,sicepat,anteraja,ninja,paxel',
          items: [{
            name: 'Test Watch',
            value: 1000000,
            weight: 500,
            quantity: 1
          }]
        })
      });
      const ratesData = await ratesRes.json();
      console.log('Rates Result:', JSON.stringify(ratesData, null, 2));
    }
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testBiteship();
