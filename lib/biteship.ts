// lib/biteship.ts — Biteship REST API wrapper (Indonesian multi-courier aggregator)
// Supports: JNE, J&T Express, SiCepat, Anteraja, Paxel, Ninja Xpress, GoSend, Grab Express

const BITESHIP_BASE_URL = 'https://api.biteship.com';

function getAuthHeader(): string {
  const key = process.env.BITESHIP_API_KEY;
  if (!key) throw new Error('BITESHIP_API_KEY is not set in environment variables.');
  return key;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BiteshipArea {
  id: string;
  name: string;
  postal_code: string;
  administrative_division_level_1_name: string; // Province
  administrative_division_level_2_name: string; // City/Regency
  administrative_division_level_3_name: string; // District
  country_code: string;
}

export interface ShippingItem {
  name: string;
  description: string;
  value: number;    // IDR value (for insurance)
  length: number;   // cm
  width: number;    // cm
  height: number;   // cm
  weight: number;   // grams
  quantity: number;
}

export interface CourierRate {
  courier_code: string;         // e.g. "jne"
  courier_name: string;         // e.g. "JNE"
  courier_service_code: string; // e.g. "reg"
  courier_service_name: string; // e.g. "Regular"
  tier: string;
  description: string;
  duration: string;             // e.g. "2-3 days"
  price: number;                // IDR
  type: string;
}

export interface ShippingRatesResponse {
  success: boolean;
  pricing: CourierRate[];
}

// ─── Area Search ──────────────────────────────────────────────────────────────

/**
 * Search Biteship areas by postal code or city name.
 * Use postal code for most accurate results.
 */
export async function searchBiteshipArea(query: string): Promise<BiteshipArea[]> {
  const res = await fetch(
    `${BITESHIP_BASE_URL}/v1/maps/areas?countries=ID&input=${encodeURIComponent(query)}&type=single`,
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Biteship] Area search failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.areas || [];
}

// ─── Shipping Rates ───────────────────────────────────────────────────────────

/**
 * Get real-time shipping rates from all supported Indonesian couriers.
 * @param originAreaId   - Biteship area ID for Luxury28 warehouse (Jakarta)
 * @param destAreaId     - Biteship area ID for customer's address
 * @param items          - Package contents for insurance calculation
 */
export async function getBiteshipRates(
  originAreaId: string,
  destAreaId: string,
  items: ShippingItem[]
): Promise<ShippingRatesResponse> {
  const res = await fetch(`${BITESHIP_BASE_URL}/v1/rates/couriers`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin_area_id: originAreaId,
      destination_area_id: destAreaId,
      couriers: 'jne,jnt,sicepat,anteraja,ninja,paxel',
      items,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Biteship] Rates fetch failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

// ─── Create Shipment Order ────────────────────────────────────────────────────

/**
 * Book a courier pickup with Biteship after order is paid.
 * Returns a waybill ID (resi) and tracking info.
 */
export async function createBiteshipOrder(params: {
  referenceId: string;          // Our internal order ID
  destinationContactName: string;
  destinationContactPhone: string;
  destinationAddress: string;
  destinationAreaId: string;
  courierCode: string;          // e.g. "jne"
  courierService: string;       // e.g. "reg"
  items: ShippingItem[];
  itemValue: number;            // Total IDR value for insurance
}) {
  const res = await fetch(`${BITESHIP_BASE_URL}/v1/orders`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference_id: params.referenceId,
      shipper: {
        name: 'Luxury28',
        phone: process.env.WAREHOUSE_PHONE || '+622112345678',
        email: 'operations@luxury28.com',
        organization: 'Luxury28 Timepieces',
      },
      origin: {
        contact_name: 'Luxury28 Warehouse',
        contact_phone: process.env.WAREHOUSE_PHONE || '+622112345678',
        address: process.env.WAREHOUSE_ADDRESS || 'Jl. Sudirman No. 1, Jakarta Pusat',
        area_id: process.env.WAREHOUSE_AREA_ID || 'IDNP1CGKOTA1800JKT000ORD',
      },
      destination: {
        contact_name: params.destinationContactName,
        contact_phone: params.destinationContactPhone,
        address: params.destinationAddress,
        area_id: params.destinationAreaId,
      },
      courier: {
        company: params.courierCode,
        type: params.courierService,
        insurance: {
          amount: params.itemValue,
          apply: true, // Always insure luxury watches
        },
      },
      items: params.items,
      delivery: {
        note: 'FRAGILE - Luxury timepiece. Handle with extreme care.',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Biteship] Order creation failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}
