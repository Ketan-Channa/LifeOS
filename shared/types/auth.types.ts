export interface User {
  id: string;
  name: string;
  age?: number | null;
  dob?: string | null;
  sex?: string | null;
  bloodGroup?: string | null;
  email: string;
  phone?: string | null;
  securityQuestion?: string | null;
  avatarUrl?: string | null;
  timezone: string;
  currentPlan: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface SubscriptionPlan {
  id: 'FREE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  name: string;
  price: number;
  durationMonths: number;
  durationLabel: string;
  badge?: string;
  features: string[];
}

export interface PaymentPayload {
  planId: 'FREE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'QR';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  bankName?: string;
}
