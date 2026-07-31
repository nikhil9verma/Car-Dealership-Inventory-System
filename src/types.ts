export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER' | string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  variant?: string;
  year?: number;
  vin?: string;
  engineType?: string;
  engineDisplacement?: string;
  horsepower?: number;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  seatingCapacity?: number;
  drivetrain?: string;
  status?: 'Available' | 'Reserved' | 'Sold' | string;
  condition?: 'New' | 'Used' | 'Certified Pre-Owned' | string;
  images?: string | string[]; // stringified JSON array or array
  tags?: string | string[];   // stringified JSON array or array
  listedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFilters {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  fuelType?: string;
  condition?: string;
  year?: string;
  sortBy?: string;
  tag?: string;
}

export interface Inquiry {
  id?: string;
  vehicleId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  type: 'Test Drive' | 'Price Quote' | 'General Inquiry';
  preferredDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface AdminStats {
  totalInventoryCount: number;
  totalUnitsInStock: number;
  carsSoldThisMonth: number;
  avgDaysOnLot: number;
  totalRevenue: number;
  outOfStockCount: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}
