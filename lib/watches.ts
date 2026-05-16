export interface Watch {
  id: string;
  name: string;
  price: number;
  price_idr?: number;
  tier: string;
  image: string;
  stock: number;
  description?: string;
  weight?: number;
}

// This static array is now deprecated in favor of real-time Supabase fetching.
// We keep the interface for type safety across the application.
export const watches: Watch[] = [];
