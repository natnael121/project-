export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  photo: string;
  category: string;
  available: boolean;
  preparation_time: number;
  ingredients: string;
  allergens: string;
  popularity_score: number;
  views: number;
  orders: number;
  last_updated: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  timestamp: string;
}

export interface Analytics {
  tableNumber: string;
  itemViews: Record<string, number>;
  itemOrders: Record<string, number>;
  waiterCalls: number;
  billRequests: number;
  totalSpent: number;
  orderCount: number;
  sessionStart: string;
}

export interface TableStats {
  tableNumber: string;
  orders: number;
  totalSpent: number;
  waiterCalls: number;
  billRequests: number;
  lastActivity: string;
}

export interface AppSettings {
  language: 'en' | 'am';
  orderType: 'dine-in' | 'takeaway';
}

export interface OrderFeedback {
  orderId: string;
  tableNumber: string;
  rating: number;
  comment: string;
  timestamp: string;
}