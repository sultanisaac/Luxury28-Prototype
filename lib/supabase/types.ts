export type UserRole = 'admin' | 'staff' | 'customer'

export type OrderStatus =
  | 'Pending'
  | 'Paid'
  | 'Processing'
  | 'Packaging'
  | 'Shipped'
  | 'Delivered'
  | 'Refunded'
  | 'Cancelled'

export type ProductStatus = 'active' | 'inactive' | 'archived'
export type AuthenticityStatus = 'verified' | 'pending' | 'rejected'

export interface User {
  id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  stock_quantity: number
  status: ProductStatus
  weight: number | null
  dimensions: { length: number; width: number; height: number } | null
  images: string[]
  created_at: string
  updated_at: string
}

export interface AuthenticityRecord {
  id: string
  product_id: string
  serial_number: string
  status: AuthenticityStatus
  created_at: string
}

export interface ShippingAddress {
  id: string
  user_id: string
  label: string
  recipient_name: string
  phone: string
  street_address: string
  city: string
  province: string
  postal_code: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  shipping_address_id: string | null
  status: OrderStatus
  total_amount: number
  shipping_cost: number
  tracking_number: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface OrderNote {
  id: string
  order_id: string
  author_id: string
  note_text: string
  created_at: string
}

export interface Cart {
  user_id: string
  items: CartItem[]
  updated_at: string
}

export interface CartItem {
  product_id: string
  quantity: number
  unit_price: number
}

export interface AuditLog {
  id: string
  user_id: string | null
  role: UserRole | null
  action_type: string
  resource: string
  resource_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type TicketCategory = 'Refund' | 'Complaint' | 'General' | 'Other'
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

export interface Ticket {
  id: string
  user_id: string
  subject: string
  category: TicketCategory
  status: TicketStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal_note: boolean
  created_at: string
  users?: {
    first_name: string | null
    last_name: string | null
    email: string
    role: string
  }
}
