export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductForm {
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
}

export interface Order {
  orderId: number;
  userId: number;
  productIds: number[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: string;
  notes?: string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderForm {
  productIds: number[];
  shippingAddress?: string;
  notes?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  visibility: number;
  units: string;
}

export interface ForecastItem {
  date: string;
  temperature: number;
  description: string;
  icon: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
