import type { PaymentMethod, User } from '@/types';

export const currentUser: User = {
  id: 'usr-1',
  name: 'Branner Ramírez',
  email: 'branner@easyparking.app',
  phone: '+57 310 254 8890',
  isOwner: true,
  memberSince: '2025-11',
};

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm-1', kind: 'nequi', label: 'Nequi', detail: '••• ••• 8890' },
  { id: 'pm-2', kind: 'tarjeta', label: 'Visa', detail: '•••• 4821' },
  { id: 'pm-3', kind: 'daviplata', label: 'Daviplata', detail: '••• ••• 8890' },
  { id: 'pm-4', kind: 'pse', label: 'PSE', detail: 'Bancolombia' },
];
