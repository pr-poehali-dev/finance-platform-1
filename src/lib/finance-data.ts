export const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

export const fmtShort = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' млн ₽';
  if (Math.abs(n) >= 1_000) return Math.round(n / 1_000) + ' тыс ₽';
  return n + ' ₽';
};

export type PnlRow = {
  key: string;
  label: string;
  plan: number;
  fact: number;
  kind: 'income' | 'expense' | 'result';
  bold?: boolean;
};

export const pnl: PnlRow[] = [
  { key: 'revenue', label: 'Выручка', plan: 4500000, fact: 4820000, kind: 'income', bold: true },
  { key: 'cogs', label: 'Себестоимость продаж', plan: 1800000, fact: 1920000, kind: 'expense' },
  { key: 'gross', label: 'Валовая прибыль', plan: 2700000, fact: 2900000, kind: 'result', bold: true },
  { key: 'salary', label: 'ФОТ и зарплата', plan: 1600000, fact: 1580000, kind: 'expense' },
  { key: 'marketing', label: 'Реклама и маркетинг', plan: 900000, fact: 1120000, kind: 'expense' },
  { key: 'rent', label: 'Аренда и офис', plan: 350000, fact: 350000, kind: 'expense' },
  { key: 'other', label: 'Прочие расходы', plan: 180000, fact: 165000, kind: 'expense' },
  { key: 'ebitda', label: 'EBITDA', plan: 970000, fact: 1195000, kind: 'result', bold: true },
  { key: 'tax', label: 'Налоги и сборы', plan: 420000, fact: 430000, kind: 'expense' },
  { key: 'net', label: 'Чистая прибыль', plan: 550000, fact: 765000, kind: 'result', bold: true },
];

export const kpis = [
  { label: 'Выручка', value: 4820000, delta: '+12,4%', up: true, icon: 'Wallet' },
  { label: 'Чистая прибыль', value: 765000, delta: '+39,1%', up: true, icon: 'PiggyBank' },
  { label: 'Рентабельность', value: 0, display: '15,9%', delta: '+3,1 п.п.', up: true, icon: 'Percent' },
  { label: 'ROI рекламы', value: 0, display: '312%', delta: '+21%', up: true, icon: 'Target' },
];

export const cashflow = [
  { month: 'Июл', income: 3200, expense: 2800 },
  { month: 'Авг', income: 4100, expense: 3000 },
  { month: 'Сен', income: 3800, expense: 3400 },
  { month: 'Окт', income: 4500, expense: 3300 },
  { month: 'Ноя', income: 5200, expense: 4000 },
  { month: 'Дек', income: 4800, expense: 3800 },
  { month: 'Янв', income: 5500, expense: 4200 },
  { month: 'Фев', income: 6100, expense: 4500 },
  { month: 'Мар', income: 5800, expense: 4300 },
  { month: 'Апр', income: 6400, expense: 4800 },
  { month: 'Май', income: 7000, expense: 5000 },
  { month: 'Июн', income: 7600, expense: 5400 },
];

export type Payment = {
  date: string;
  day: number;
  name: string;
  counterparty: string;
  type: 'in' | 'out';
  amount: number;
  status: 'Оплачено' | 'Ожидается' | 'Запланировано';
};

export const payments: Payment[] = [
  { date: '01.07.2026', day: 1, name: 'Остаток на начало', counterparty: '—', type: 'in', amount: 0, status: 'Оплачено' },
  { date: '05.07.2026', day: 5, name: 'Оплата по договору', counterparty: 'ООО «СтройТех»', type: 'in', amount: 620000, status: 'Ожидается' },
  { date: '07.07.2026', day: 7, name: 'Аренда офиса', counterparty: 'БЦ «Меркурий»', type: 'out', amount: 350000, status: 'Запланировано' },
  { date: '10.07.2026', day: 10, name: 'Зарплата за июнь', counterparty: 'Сотрудники', type: 'out', amount: 1580000, status: 'Запланировано' },
  { date: '12.07.2026', day: 12, name: 'Оплата услуг', counterparty: 'ИП Иванов', type: 'in', amount: 145000, status: 'Ожидается' },
  { date: '15.07.2026', day: 15, name: 'Налог на прибыль', counterparty: 'ФНС', type: 'out', amount: 430000, status: 'Запланировано' },
  { date: '18.07.2026', day: 18, name: 'Реклама Яндекс', counterparty: 'Яндекс', type: 'out', amount: 280000, status: 'Запланировано' },
  { date: '20.07.2026', day: 20, name: 'Оплата по договору', counterparty: 'ООО «Альфа»', type: 'in', amount: 890000, status: 'Ожидается' },
  { date: '25.07.2026', day: 25, name: 'НДС к уплате', counterparty: 'ФНС', type: 'out', amount: 210000, status: 'Запланировано' },
  { date: '28.07.2026', day: 28, name: 'Оплата по договору', counterparty: 'ООО «Бета»', type: 'in', amount: 540000, status: 'Ожидается' },
];

export type Employee = {
  name: string;
  role: string;
  fixed: number;
  bonus: number;
  kpi: number;
};

export type Department = {
  name: string;
  icon: string;
  employees: Employee[];
};

export const departments: Department[] = [
  {
    name: 'Отдел продаж',
    icon: 'Briefcase',
    employees: [
      { name: 'Смирнов Игорь', role: 'Руководитель', fixed: 120000, bonus: 180000, kpi: 112 },
      { name: 'Кузнецова Анна', role: 'Менеджер', fixed: 80000, bonus: 140000, kpi: 108 },
      { name: 'Попов Дмитрий', role: 'Менеджер', fixed: 80000, bonus: 95000, kpi: 92 },
    ],
  },
  {
    name: 'Маркетинг',
    icon: 'Megaphone',
    employees: [
      { name: 'Волкова Мария', role: 'Директор', fixed: 140000, bonus: 90000, kpi: 98 },
      { name: 'Соколов Павел', role: 'Таргетолог', fixed: 90000, bonus: 60000, kpi: 94 },
    ],
  },
  {
    name: 'Производство',
    icon: 'Factory',
    employees: [
      { name: 'Морозов Артём', role: 'Начальник цеха', fixed: 130000, bonus: 70000, kpi: 105 },
      { name: 'Лебедев Сергей', role: 'Мастер', fixed: 95000, bonus: 45000, kpi: 99 },
    ],
  },
];

export const traffic = [
  { src: 'Яндекс Директ', leads: 340, calls: 42, consult: 180, sales: 68, cost: 620000, icon: 'Search' },
  { src: 'VK Реклама', leads: 210, calls: 55, consult: 96, sales: 31, cost: 280000, icon: 'Users' },
  { src: 'Telegram Ads', leads: 128, calls: 18, consult: 71, sales: 22, cost: 140000, icon: 'Send' },
  { src: 'SEO / Органика', leads: 190, calls: 12, consult: 110, sales: 44, cost: 80000, icon: 'Globe' },
];
