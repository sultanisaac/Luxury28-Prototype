// scratch/test-biteship.js
const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  if (line.includes('=')) {
    const [key, ...val] = line.split('=');
    env[key.trim()] = val.join('=').trim();
  }
}

const BITESHIP_BASE_URL = 'https://api.biteship.com';

async function run() {
  const apiKey = env.BITESHIP_API_KEY;
  console.log('API Key:', apiKey ? 'FOUND' : 'MISSING');
  if (!apiKey) return;

  const uniqueRefId = 'test-order-' + Date.now();
  console.log('Using reference_id:', uniqueRefId);

  try {
    const response = await fetch(`${BITESHIP_BASE_URL}/v1/orders`, {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_id: uniqueRefId,
        shipper: {
          name: 'Luxury28',
          phone: '+628211715945',
          email: 'operations@luxury28.com',
          organization: 'Luxury28 Timepieces',
        },
        origin: {
          contact_name: 'Luxury28 Warehouse',
          contact_phone: '+628211715945',
          address: 'jln.Syech Ibrahim No.68E, Bukittinggi',
          area_id: 'IDNP32IDNC88IDND6981IDZ26111',
        },
        destination: {
          contact_name: 'bani',
          contact_phone: '+123456',
          address: 'syech ibrahim no.72 E, bukittinggi, sumatera barat 26111',
          area_id: 'IDNP32IDNC88IDND6981IDZ26111', // Bukittinggi area ID
        },
        courier: {
          company: 'jne',
          type: 'reg',
          insurance: {
            amount: 1000000, // 1 Million IDR
            apply: true,
          },
        },
        items: [
          {
            name: 'Vacheron Constantin Overseas Dual Time',
            description: 'Luxury Timepiece',
            value: 1000000,
            length: 20,
            width: 15,
            height: 12,
            weight: 600,
            quantity: 1,
          }
        ],
        delivery: {
          note: 'FRAGILE - Luxury timepiece. Handle with extreme care.',
        },
      }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
