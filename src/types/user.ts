export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'premium' | 'support' | 'user';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  subscription_status: 'active' | 'inactive' | 'trial';
  subscription_expires_at: string | null;
} 