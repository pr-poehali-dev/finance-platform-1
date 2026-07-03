import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  fmt,
  pnl,
  kpis,
  cashflow,
  payments as basePayments,
  departments,
  traffic,
} from '@/lib/finance-data';
import { exportToCsv, exportToPdf } from '@/lib/export';

const nav = [
  { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
  { id: 'finance', label: 'Расходы и доходы', icon: 'ArrowLeftRight' },
  { id: 'calendar', label: 'Платёжный календарь', icon: 'CalendarDays' },
  { id: 'salary', label: 'Зарплата', icon: 'Users' },
  { id: 'traffic', label: 'Аналитика трафика', icon: 'TrendingUp' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

const subtitles: Record<string, string> = {
  dashboard: 'Отчётный период: июнь 2026',
  finance: 'Отчёт о прибылях и убытках (P&L) · план и факт',
  calendar: 'Июль 2026',
  salary: 'Мотивация по отделам и сотрудникам',
  traffic: 'Июнь 2026',
  settings: 'Параметры платформы',
};

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function CashChart() {
  const w = 640;
  const h = 240;
  const pad = 28;
  const max = Math.max(...cashflow.map((d) => Math.max(d.income, d.expense)));
  const step = (w - pad * 2) / (cashflow.length - 1);
  const x = (i: number) => pad + i * step;
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = (key: 'income' | 'expense') =>
    cashflow.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[key])}`).join(' ');
  const area = (key: 'income' | 'expense') =>
    `${line(key)} L${x(cashflow.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 240 }}>
      <defs>
        <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
          <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(217 71% 23%)" stopOpacity={0.2} />
          <stop offset="100%" stopColor="hsl(217 71% 23%)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={h - pad - g * (h - pad * 2)}
          y2={h - pad - g * (h - pad * 2)}
          stroke="hsl(214 25% 92%)"
          strokeDasharray="3 3"
        />
      ))}
      <path d={area('expense')} fill="url(#exp)" />
      <path d={area('income')} fill="url(#inc)" />
      <path d={line('expense')} fill="none" stroke="hsl(217 71% 23%)" strokeWidth={2} />
      <path d={line('income')} fill="none" stroke="hsl(199 89% 48%)" strokeWidth={2.5} />
      {cashflow.map((d, i) => (
        <g key={d.month}>
          <circle cx={x(i)} cy={y(d.income)} r={2.5} fill="hsl(199 89% 48%)" />
          <text x={x(i)} y={h - 8} textAnchor="middle" fontSize={11} fill="#64748b">
            {d.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
                <Icon name={k.icon} size={16} className="text-primary" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-semibold tnum">
              {k.display ?? fmt(k.value)}
            </div>
            <div
              className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
                k.up ? 'text-success' : 'text-destructive'
              }`}
            >
              <Icon name={k.up ? 'ArrowUpRight' : 'ArrowDownRight'} size={14} />
              {k.delta} к прошлому месяцу
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Движение денежных средств</h2>
              <p className="text-xs text-muted-foreground">Последние 12 месяцев, тыс ₽</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Доходы
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary/40" /> Расходы
              </span>
            </div>
          </div>
          <CashChart />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Ключевые итоги месяца</h2>
          <div className="space-y-3.5">
            {[
              { l: 'Выручка', v: 4820000 },
              { l: 'Валовая прибыль', v: 2900000 },
              { l: 'EBITDA', v: 1195000 },
            ].map((r) => (
              <div key={r.l} className="flex justify-between items-center pb-3.5 border-b border-border">
                <span className="text-sm text-muted-foreground">{r.l}</span>
                <span className="font-semibold tnum">{fmt(r.v)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium">Чистая прибыль</span>
              <span className="text-lg font-bold text-success tnum">{fmt(765000)}</span>
            </div>
            <div className="mt-2 p-3 bg-secondary rounded-md text-xs text-muted-foreground flex gap-2">
              <Icon name="TrendingUp" size={16} className="shrink-0 text-success" />
              План по прибыли перевыполнен на 39%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PnlView() {
  return (
    <Section title="Отчёт о прибылях и убытках" desc="План и факт по всем статьям за июнь 2026">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground bg-secondary/50">
            <th className="text-left font-medium px-6 py-3">Показатель</th>
            <th className="text-right font-medium px-6 py-3">План</th>
            <th className="text-right font-medium px-6 py-3">Факт</th>
            <th className="text-right font-medium px-6 py-3">Отклонение</th>
            <th className="text-right font-medium px-6 py-3">% вып.</th>
          </tr>
        </thead>
        <tbody>
          {pnl.map((r) => {
            const diff = r.fact - r.plan;
            const pct = Math.round((r.fact / r.plan) * 100);
            const positive = r.kind === 'expense' ? diff <= 0 : diff >= 0;
            return (
              <tr
                key={r.key}
                className={`border-t border-border ${
                  r.kind === 'result' ? 'bg-secondary/40' : 'hover:bg-secondary/20'
                }`}
              >
                <td className={`px-6 py-3 ${r.bold ? 'font-semibold' : 'pl-10 text-muted-foreground'}`}>
                  {r.label}
                </td>
                <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(r.plan)}</td>
                <td className={`px-6 py-3 text-right tnum ${r.bold ? 'font-semibold' : ''}`}>
                  {fmt(r.fact)}
                </td>
                <td className={`px-6 py-3 text-right tnum font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
                  {diff > 0 ? '+' : ''}{fmt(diff)}
                </td>
                <td className="px-6 py-3 text-right tnum text-muted-foreground">{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}

function CalendarView() {
  let balance = 2400000;
  const rows = basePayments.map((p) => {
    if (p.amount > 0) balance += p.type === 'in' ? p.amount : -p.amount;
    return { ...p, balance };
  });
  const totalIn = basePayments.filter((p) => p.type === 'in').reduce((s, p) => s + p.amount, 0);
  const totalOut = basePayments.filter((p) => p.type === 'out').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Поступления за месяц</span>
          <div className="mt-2 text-2xl font-semibold text-success tnum">{fmt(totalIn)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Списания за месяц</span>
          <div className="mt-2 text-2xl font-semibold text-destructive tnum">{fmt(totalOut)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Остаток на конец</span>
          <div className="mt-2 text-2xl font-semibold text-primary tnum">{fmt(balance)}</div>
        </div>
      </section>
      <Section title="Платёжный календарь на июль" desc="Поступления, списания и прогноз остатка на счёте">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground bg-secondary/50">
              <th className="text-left font-medium px-6 py-3">Дата</th>
              <th className="text-left font-medium px-6 py-3">Операция</th>
              <th className="text-left font-medium px-6 py-3">Контрагент</th>
              <th className="text-right font-medium px-6 py-3">Сумма</th>
              <th className="text-right font-medium px-6 py-3">Остаток</th>
              <th className="text-left font-medium px-6 py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter((r) => r.amount > 0).map((p, i) => (
              <tr key={i} className="border-t border-border hover:bg-secondary/20">
                <td className="px-6 py-3 tnum text-muted-foreground">{p.date}</td>
                <td className="px-6 py-3 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.type === 'in' ? 'bg-success' : 'bg-primary/40'}`} />
                  {p.name}
                </td>
                <td className="px-6 py-3 text-muted-foreground">{p.counterparty}</td>
                <td className={`px-6 py-3 text-right tnum font-medium ${p.type === 'in' ? 'text-success' : 'text-destructive'}`}>
                  {p.type === 'in' ? '+' : '−'}{fmt(p.amount)}
                </td>
                <td className="px-6 py-3 text-right tnum">{fmt(p.balance)}</td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    p.status === 'Оплачено' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function SalaryView() {
  const all = departments.flatMap((d) => d.employees);
  const fund = all.reduce((s, e) => s + e.fixed + e.bonus, 0);
  const avgKpi = Math.round(all.reduce((s, e) => s + e.kpi, 0) / all.length);
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Фонд оплаты труда</span>
          <div className="mt-2 text-2xl font-semibold tnum">{fmt(fund)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Сотрудников</span>
          <div className="mt-2 text-2xl font-semibold tnum">{all.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <span className="text-sm text-muted-foreground">Средний KPI</span>
          <div className="mt-2 text-2xl font-semibold tnum text-success">{avgKpi}%</div>
        </div>
      </section>
      {departments.map((d) => (
        <Section
          key={d.name}
          title={d.name}
          desc={`${d.employees.length} сотрудников · оклад + премия по KPI`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground bg-secondary/50">
                <th className="text-left font-medium px-6 py-3">Сотрудник</th>
                <th className="text-left font-medium px-6 py-3">Должность</th>
                <th className="text-right font-medium px-6 py-3">Оклад</th>
                <th className="text-right font-medium px-6 py-3">Премия</th>
                <th className="text-right font-medium px-6 py-3">К выплате</th>
                <th className="text-right font-medium px-6 py-3">KPI</th>
              </tr>
            </thead>
            <tbody>
              {d.employees.map((e) => (
                <tr key={e.name} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-6 py-3 font-medium">{e.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{e.role}</td>
                  <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(e.fixed)}</td>
                  <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(e.bonus)}</td>
                  <td className="px-6 py-3 text-right tnum font-medium">{fmt(e.fixed + e.bonus)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tnum ${
                      e.kpi >= 100 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>{e.kpi}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ))}
    </div>
  );
}

function TrafficView() {
  return (
    <Section title="Аналитика рекламного трафика" desc="Конверсии и стоимость договора по источникам">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground bg-secondary/50">
            <th className="text-left font-medium px-6 py-3">Источник</th>
            <th className="text-right font-medium px-6 py-3">Лиды</th>
            <th className="text-right font-medium px-6 py-3">Недозвоны</th>
            <th className="text-right font-medium px-6 py-3">Консультации</th>
            <th className="text-right font-medium px-6 py-3">Продажи</th>
            <th className="text-right font-medium px-6 py-3">Конверсия</th>
            <th className="text-right font-medium px-6 py-3">Цена договора</th>
          </tr>
        </thead>
        <tbody>
          {traffic.map((t) => {
            const conv = ((t.sales / t.leads) * 100).toFixed(1);
            const cpa = t.cost / t.sales;
            return (
              <tr key={t.src} className="border-t border-border hover:bg-secondary/20">
                <td className="px-6 py-3 font-medium flex items-center gap-2">
                  <Icon name={t.icon} size={16} className="text-primary" />
                  {t.src}
                </td>
                <td className="px-6 py-3 text-right tnum">{t.leads}</td>
                <td className="px-6 py-3 text-right tnum text-muted-foreground">{t.calls}</td>
                <td className="px-6 py-3 text-right tnum text-muted-foreground">{t.consult}</td>
                <td className="px-6 py-3 text-right tnum font-medium">{t.sales}</td>
                <td className="px-6 py-3 text-right">
                  <span className="inline-block px-2 py-0.5 rounded bg-success/10 text-success text-xs font-medium tnum">
                    {conv}%
                  </span>
                </td>
                <td className="px-6 py-3 text-right tnum font-medium">{fmt(cpa)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Section>
  );
}

function SettingsView() {
  return (
    <section className="bg-card border border-border rounded-lg p-6 max-w-xl space-y-6">
      <div>
        <h2 className="font-semibold mb-1">Общие настройки</h2>
        <p className="text-xs text-muted-foreground">Параметры компании и отображения показателей</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label className="text-sm">Название компании</Label>
          <Input defaultValue="ООО «Финолог»" className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">ИНН</Label>
            <Input defaultValue="7701234567" className="mt-1.5" />
          </div>
          <div>
            <Label className="text-sm">Ставка НДС</Label>
            <Input defaultValue="20%" className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label className="text-sm">Целевая прибыль в месяц</Label>
          <Input defaultValue="1 300 000" className="mt-1.5" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <div className="text-sm font-medium">Уведомления о просрочках</div>
            <div className="text-xs text-muted-foreground">Email и push-уведомления</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Автовыгрузка в 1С</div>
            <div className="text-xs text-muted-foreground">Синхронизация с бухгалтерией</div>
          </div>
          <Switch />
        </div>
        <Button
          onClick={() => toast.success('Настройки сохранены')}
          className="bg-accent hover:bg-accent/90 gap-2"
        >
          <Icon name="Save" size={16} /> Сохранить
        </Button>
      </div>
    </section>
  );
}

export default function Index() {
  const [active, setActive] = useState('dashboard');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', type: 'in' });

  const exportData = (): { headers: string[]; rows: string[][]; title: string } => {
    switch (active) {
      case 'calendar':
        return {
          title: 'Платёжный календарь',
          headers: ['Дата', 'Операция', 'Контрагент', 'Тип', 'Сумма'],
          rows: basePayments.filter((p) => p.amount > 0).map((p) => [
            p.date, p.name, p.counterparty, p.type === 'in' ? 'Поступление' : 'Списание', fmt(p.amount),
          ]),
        };
      case 'salary':
        return {
          title: 'Расчёт зарплаты',
          headers: ['Отдел', 'Сотрудник', 'Должность', 'Оклад', 'Премия', 'KPI'],
          rows: departments.flatMap((d) =>
            d.employees.map((e) => [d.name, e.name, e.role, fmt(e.fixed), fmt(e.bonus), `${e.kpi}%`])
          ),
        };
      case 'traffic':
        return {
          title: 'Аналитика трафика',
          headers: ['Источник', 'Лиды', 'Продажи', 'Конверсия', 'Цена договора'],
          rows: traffic.map((t) => [
            t.src, String(t.leads), String(t.sales),
            `${((t.sales / t.leads) * 100).toFixed(1)}%`, fmt(t.cost / t.sales),
          ]),
        };
      default:
        return {
          title: 'Отчёт о прибылях и убытках',
          headers: ['Показатель', 'План', 'Факт', 'Отклонение'],
          rows: pnl.map((r) => [r.label, fmt(r.plan), fmt(r.fact), fmt(r.fact - r.plan)]),
        };
    }
  };

  const handleExcel = () => {
    const { title, headers, rows } = exportData();
    exportToCsv(title, headers, rows);
    toast.success('Файл Excel выгружен');
  };
  const handlePdf = () => {
    const { title, headers, rows } = exportData();
    exportToPdf(title, headers, rows);
  };
  const handleAdd = () => {
    if (!form.name || !form.amount) {
      toast.error('Заполните название и сумму');
      return;
    }
    toast.success(`Операция «${form.name}» на ${fmt(Number(form.amount))} добавлена`);
    setForm({ name: '', amount: '', type: 'in' });
    setAddOpen(false);
  };

  const renderContent = () => {
    switch (active) {
      case 'finance': return <PnlView />;
      case 'calendar': return <CalendarView />;
      case 'salary': return <SalaryView />;
      case 'traffic': return <TrafficView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <aside className="w-64 shrink-0 bg-primary text-primary-foreground flex flex-col fixed h-screen">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
            <Icon name="BarChart3" size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-none">Финолог</div>
            <div className="text-[11px] text-white/50 mt-1">Финучёт для бизнеса</div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active === n.id ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            АК
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium">Алексей К.</div>
            <div className="text-[11px] text-white/50">Финансовый директор</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold">{nav.find((n) => n.id === active)?.label}</h1>
            <p className="text-xs text-muted-foreground">{subtitles[active]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExcel}>
              <Icon name="FileSpreadsheet" size={16} /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePdf}>
              <Icon name="FileText" size={16} /> PDF
            </Button>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={() => setAddOpen(true)}>
              <Icon name="Plus" size={16} /> Добавить
            </Button>
          </div>
        </header>

        <div key={active} className="p-8 animate-fade-in">{renderContent()}</div>
      </main>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая операция</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Название</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например: Оплата от клиента"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm">Сумма, ₽</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === 'in' ? 'default' : 'outline'}
                className={`flex-1 ${form.type === 'in' ? 'bg-success hover:bg-success/90' : ''}`}
                onClick={() => setForm({ ...form, type: 'in' })}
              >
                Доход
              </Button>
              <Button
                type="button"
                variant={form.type === 'out' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setForm({ ...form, type: 'out' })}
              >
                Расход
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handleAdd}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}