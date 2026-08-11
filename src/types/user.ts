export type UserRole = 'parent' | 'student' | 'mentor' | 'admin' | 'unknown';

export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  account_status?: 'active' | 'pending' | 'suspended';
  avatar_url?: string;
}

export interface SessionTokens {
  access_token: string;
  refresh_token: string;
}
