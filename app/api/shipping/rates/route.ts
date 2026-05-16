import { NextRequest, NextResponse } from 'next/server';
import { searchBiteshipArea, getBiteshipRates, ShippingItem } from '@/lib/biteship';

// Luxury28 warehouse origin — override via environment variable
const WAREHOUSE_AREA_ID = process.env.WAREHOUSE_AREA_ID || 'IDNP1CGKOTA1800JKT000ORD';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postalCode, city, productName, productValue, quantity } = body as {
      postalCode: string;
      city: string;
      productName: string;
      productValue: number;
      quantity: number;
    };

    if (!postalCode && !city) {
      return NextResponse.json({ error: 'postalCode or city is required' }, { status: 400 });
    }

    // ── 1. Search for destination area ID ──────────────────────────────────
    const searchQuery = postalCode || city;
    const areas = await searchBiteshipArea(searchQuery);

    if (!areas || areas.length === 0) {
      return NextResponse.json(
        { error: `No shipping area found for: ${searchQuery}. Please verify the postal code.` },
        { status: 404 }
      );
    }

    const destinationAreaId = areas[0].id;

    // ── 2. Build package details (luxury watch dimensions) ─────────────────
    const items: ShippingItem[] = [
      {
        name: productName || 'Luxury Watch',
        description: 'Certified luxury timepiece with box and papers',
        value: productValue,
        length: 20,   // cm — watch box
        width: 15,    // cm
        height: 12,   // cm
        weight: 600,  // grams — watch + box + papers
        quantity: quantity || 1,
      },
    ];

    // ── 3. Fetch courier rates from Biteship ──────────────────────────────
    const ratesResponse = await getBiteshipRates(WAREHOUSE_AREA_ID, destinationAreaId, items);

    if (!ratesResponse.success || !ratesResponse.pricing?.length) {
      return NextResponse.json(
        { error: 'No shipping rates available for this destination.' },
        { status: 404 }
      );
    }

    // ── 4. Return rates + destination area ID for checkout ─────────────────
    return NextResponse.json({
      success: true,
      destinationAreaId,
      rates: ratesResponse.pricing.map((rate) => ({
        courierCode: rate.courier_code,
        courierName: rate.courier_name,
        serviceCode: rate.courier_service_code,
        serviceName: rate.courier_service_name,
        duration: rate.duration,
        price: rate.price,
      })),
    });
  } catch (error) {
    console.error('[Shipping Rates API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates. Please try again.' },
      { status: 500 }
    );
  }
}
