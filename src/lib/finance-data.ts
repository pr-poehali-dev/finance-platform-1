export const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

export type Operation = {
  id: number;
  label: string;
  category: string;
  plan_amount: number;
  fact_amount: number;
  kind: 'income' | 'expense';
  sort_order: number;
};

export type Payment = {
  id: number;
  pay_date: string;
  name: string;
  counterparty: string;
  type: 'in' | 'out';
  amount: number;
  status: string;
};

export type Department = {
  id: number;
  name: string;
  icon: string;
};

export type Employee = {
  id: number;
  department_id: number;
  name: string;
  role: string;
  fixed: number;
  bonus: number;
  kpi: number;
};

export type TrafficSource = {
  id: number;
  src: string;
  icon: string;
  leads: number;
  calls: number;
  consult: number;
  sales: number;
  cost: number;
};

export const num = (v: unknown) => Number(v) || 0;

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU');
};
