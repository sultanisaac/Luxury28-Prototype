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
      delivery_type: 'now',
      shipper_contact_name: 'Luxury28 Warehouse',
      shipper_contact_phone: process.env.WAREHOUSE_PHONE || '+628211715945',
      shipper_contact_email: 'operations@luxury28.com',
      shipper_organization: 'Luxury28 Timepieces',
      
      origin_contact_name: 'Luxury28 Warehouse',
      origin_contact_phone: process.env.WAREHOUSE_PHONE || '+628211715945',
      origin_address: process.env.WAREHOUSE_ADDRESS || 'jln.Syech Ibrahim No.68E, Bukittinggi',
      origin_area_id: process.env.WAREHOUSE_AREA_ID || 'IDNP32IDNC88IDND6981IDZ26111',
      origin_postal_code: 26111,
      
      destination_contact_name: params.destinationContactName,
      destination_contact_phone: params.destinationContactPhone,
      destination_address: params.destinationAddress,
      destination_area_id: params.destinationAreaId,
      destination_postal_code: 26111, // Standard fallback
      
      courier_company: params.courierCode,
      courier_type: params.courierService,
      
      items: params.items,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Biteship] Order creation failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    waybill_id: data.courier?.waybill_id
  };
}
