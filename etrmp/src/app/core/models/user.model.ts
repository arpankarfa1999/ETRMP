export type UserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;   // only used for mock login, never displayed
  role: UserRole;
  department: string;
  status: 'Active' | 'Inactive';
}
