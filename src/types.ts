export type Role = 'admin' | 'employee';
export type LoanStatus = 'waiting' | 'monthly' | 'paid' | 'excluded';

export interface Session {
  sessionId: string;
  token: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: Role;
  };
}

export interface Loan {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  amount: number;
  notes: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  registeredBy: string;
  registeredByName: string;
}

export interface DeletedLoan extends Loan {
  deletionReason: string;
  deletedAt: string;
  deletedBy: string;
  deletedByName: string;
}

export interface Stats {
  total: number;
  waiting: number;
  monthly: number;
  paid: number;
  excluded: number;
  deleted: number;
}

export interface Settings {
  defaultLoanAmount: number;
}

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export const statusLabels: Record<LoanStatus, string> = {
  waiting: 'قائمة الانتظار',
  monthly: 'مشمول بالحصة الشهرية',
  paid: 'تم الصرف',
  excluded: 'مستبعد',
};

export function formatMoney(value: number) {
  return `${new Intl.NumberFormat('ar-IQ').format(value || 0)} د.ع`;
}

export function formatDateTime(value: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ar-IQ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
