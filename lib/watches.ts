export interface Watch {
  id: string;
  name: string;
  price: number;
  tier: string;
  image: string;
  stock: number;
}

export const watches: Watch[] = [
  // Tier 1 — Ultra Luxury
  { id: '1', name: 'Royal Chronograph X1', price: 118000, tier: 'Ultra Luxury', image: '/featured-watch.png', stock: 2 },
  { id: '2', name: 'Platinum Eclipse Tourbillon', price: 96500, tier: 'Ultra Luxury', image: '/featured-watch.png', stock: 1 },
  { id: '3', name: 'Diamond Sovereign Edition', price: 85000, tier: 'Ultra Luxury', image: '/featured-watch.png', stock: 3 },
  { id: '4', name: 'Midnight Skeleton Master', price: 72000, tier: 'Ultra Luxury', image: '/featured-watch.png', stock: 2 },
  { id: '5', name: 'Heritage Grand Complication', price: 64000, tier: 'Ultra Luxury', image: '/featured-watch.png', stock: 1 },

  // Tier 2 — High-End Luxury
  { id: '6', name: 'Ocean Master Diver Pro', price: 22500, tier: 'High-End Luxury', image: '/featured-watch.png', stock: 5 },
  { id: '7', name: 'Titanium Chrono Elite', price: 19800, tier: 'High-End Luxury', image: '/featured-watch.png', stock: 4 },
  { id: '8', name: 'Classic Gold Heritage', price: 17400, tier: 'High-End Luxury', image: '/featured-watch.png', stock: 6 },
  { id: '9', name: 'GMT Traveler Prestige', price: 15900, tier: 'High-End Luxury', image: '/featured-watch.png', stock: 3 },
  { id: '10', name: 'Black Ceramic Phantom', price: 13800, tier: 'High-End Luxury', image: '/featured-watch.png', stock: 2 },

  // Tier 3 — Mid-Tier Luxury
  { id: '11', name: 'Automatic Prestige Silver', price: 9500, tier: 'Mid-Tier Luxury', image: '/featured-watch.png', stock: 8 },
  { id: '12', name: 'Minimalist Gold Series', price: 8200, tier: 'Mid-Tier Luxury', image: '/featured-watch.png', stock: 10 },
  { id: '13', name: 'Urban Steel Chrono', price: 7400, tier: 'Mid-Tier Luxury', image: '/featured-watch.png', stock: 7 },
  { id: '14', name: 'Sapphire Edition Classic', price: 6900, tier: 'Mid-Tier Luxury', image: '/featured-watch.png', stock: 5 },
  { id: '15', name: 'Midnight Leather Automatic', price: 5800, tier: 'Mid-Tier Luxury', image: '/featured-watch.png', stock: 12 },

  // Tier 4 — Affordable Luxury
  { id: '16', name: 'Essential Chronograph', price: 3900, tier: 'Affordable Luxury', image: '/featured-watch.png', stock: 15 },
  { id: '17', name: 'Classic Dress Watch', price: 3200, tier: 'Affordable Luxury', image: '/featured-watch.png', stock: 20 },
  { id: '18', name: 'Modern Steel Automatic', price: 2800, tier: 'Affordable Luxury', image: '/featured-watch.png', stock: 18 },
  { id: '19', name: 'Slim Black Edition', price: 2200, tier: 'Affordable Luxury', image: '/featured-watch.png', stock: 25 },
  { id: '20', name: 'Starter Luxury Quartz', price: 1750, tier: 'Affordable Luxury', image: '/featured-watch.png', stock: 30 },
];
