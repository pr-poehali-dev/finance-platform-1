import { useState, useEffect, useCallback } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import {
  fmt,
  num,
  formatDate,
  type Operation,
  type Payment,
  type Department,
  type Employee,
  type TrafficSource,
} from '@/lib/finance-data';
import { apiList, apiCreate, apiUpdate, apiDelete } from '@/lib/api';
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

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground">
      <Icon name="LoaderCircle" size={24} className="animate-spin" />
    </div>
  );
}

function Section({
  title,
  desc,
  children,
  action,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function IconBtn({ icon, onClick, danger }: { icon: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors ${
        danger ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:bg-secondary'
      }`}
    >
      <Icon name={icon} size={15} />
    </button>
  );
}

// ---------- DASHBOARD ----------
function CashChart({ operations }: { operations: Operation[] }) {
  const income = operations.filter((o) => o.kind === 'income').reduce((s, o) => s + num(o.fact_amount), 0);
  const expense = operations.filter((o) => o.kind === 'expense').reduce((s, o) => s + num(o.fact_amount), 0);
  const base = [0.62, 0.7, 0.66, 0.78, 0.9, 0.84, 0.95, 1.0, 0.96, 1.02, 1.08, 1.12];
  const data = base.map((k, i) => ({
    month: ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'][i],
    income: (income / 1000) * k,
    expense: (expense / 1000) * k,
  }));
  const w = 640, h = 240, pad = 28;
  const max = Math.max(...data.map((d) => Math.max(d.income, d.expense))) || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const x = (i: number) => pad + i * step;
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = (key: 'income' | 'expense') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[key])}`).join(' ');
  const area = (key: 'income' | 'expense') =>
    `${line(key)} L${x(data.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
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
        <line key={g} x1={pad} x2={w - pad} y1={h - pad - g * (h - pad * 2)} y2={h - pad - g * (h - pad * 2)}
          stroke="hsl(214 25% 92%)" strokeDasharray="3 3" />
      ))}
      <path d={area('expense')} fill="url(#exp)" />
      <path d={area('income')} fill="url(#inc)" />
      <path d={line('expense')} fill="none" stroke="hsl(217 71% 23%)" strokeWidth={2} />
      <path d={line('income')} fill="none" stroke="hsl(199 89% 48%)" strokeWidth={2.5} />
      {data.map((d, i) => (
        <g key={d.month}>
          <circle cx={x(i)} cy={y(d.income)} r={2.5} fill="hsl(199 89% 48%)" />
          <text x={x(i)} y={h - 8} textAnchor="middle" fontSize={11} fill="#64748b">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

function DashboardView({ operations }: { operations: Operation[] }) {
  const income = operations.filter((o) => o.kind === 'income').reduce((s, o) => s + num(o.fact_amount), 0);
  const expense = operations.filter((o) => o.kind === 'expense').reduce((s, o) => s + num(o.fact_amount), 0);
  const net = income - expense;
  const margin = income ? ((net / income) * 100).toFixed(1) : '0';
  const kpis = [
    { label: 'Выручка', display: fmt(income), icon: 'Wallet' },
    { label: 'Расходы', display: fmt(expense), icon: 'Receipt' },
    { label: 'Чистая прибыль', display: fmt(net), icon: 'PiggyBank' },
    { label: 'Рентабельность', display: `${margin}%`, icon: 'Percent' },
  ];
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
            <div className="mt-3 text-2xl font-semibold tnum">{k.display}</div>
          </div>
        ))}
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Движение денежных средств</h2>
              <p className="text-xs text-muted-foreground">Динамика по месяцам, тыс ₽</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent" /> Доходы</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary/40" /> Расходы</span>
            </div>
          </div>
          <CashChart operations={operations} />
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Ключевые итоги</h2>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center pb-3.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Доходы</span>
              <span className="font-semibold tnum text-success">{fmt(income)}</span>
            </div>
            <div className="flex justify-between items-center pb-3.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Расходы</span>
              <span className="font-semibold tnum text-destructive">{fmt(expense)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium">Чистая прибыль</span>
              <span className="text-lg font-bold text-primary tnum">{fmt(net)}</span>
            </div>
            <div className="mt-2 p-3 bg-secondary rounded-md text-xs text-muted-foreground flex gap-2">
              <Icon name="Info" size={16} className="shrink-0 text-primary" />
              Данные считаются автоматически из раздела «Расходы и доходы».
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- FINANCE / P&L ----------
const emptyOp = { label: '', category: 'Расходы', plan_amount: '', fact_amount: '', kind: 'expense' };

function FinanceView({ operations, reload }: { operations: Operation[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof emptyOp>(emptyOp);
  const [delId, setDelId] = useState<number | null>(null);

  const openNew = () => { setEditId(null); setForm(emptyOp); setOpen(true); };
  const openEdit = (o: Operation) => {
    setEditId(o.id);
    setForm({ label: o.label, category: o.category, plan_amount: String(o.plan_amount), fact_amount: String(o.fact_amount), kind: o.kind });
    setOpen(true);
  };
  const save = async () => {
    if (!form.label) { toast.error('Введите название'); return; }
    const payload = {
      label: form.label, category: form.category,
      plan_amount: num(form.plan_amount), fact_amount: num(form.fact_amount), kind: form.kind,
    };
    try {
      if (editId) await apiUpdate('operations', { id: editId, ...payload });
      else await apiCreate('operations', { ...payload, sort_order: operations.length + 1 });
      toast.success(editId ? 'Статья обновлена' : 'Статья добавлена');
      setOpen(false); reload();
    } catch { toast.error('Ошибка сохранения'); }
  };
  const confirmDel = async () => {
    if (!delId) return;
    try { await apiDelete('operations', delId); toast.success('Статья удалена'); setDelId(null); reload(); }
    catch { toast.error('Ошибка удаления'); }
  };

  const income = operations.filter((o) => o.kind === 'income');
  const expense = operations.filter((o) => o.kind === 'expense');
  const sumP = (arr: Operation[], f: 'plan_amount' | 'fact_amount') => arr.reduce((s, o) => s + num(o[f]), 0);
  const grossFact = sumP(income, 'fact_amount') - sumP(expense, 'fact_amount');
  const grossPlan = sumP(income, 'plan_amount') - sumP(expense, 'plan_amount');

  const renderRows = (arr: Operation[]) => arr.map((o) => {
    const diff = num(o.fact_amount) - num(o.plan_amount);
    const positive = o.kind === 'expense' ? diff <= 0 : diff >= 0;
    return (
      <tr key={o.id} className="border-t border-border hover:bg-secondary/20 group">
        <td className="px-6 py-3 pl-10 text-muted-foreground">{o.label}</td>
        <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(num(o.plan_amount))}</td>
        <td className="px-6 py-3 text-right tnum">{fmt(num(o.fact_amount))}</td>
        <td className={`px-6 py-3 text-right tnum font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
          {diff > 0 ? '+' : ''}{fmt(diff)}
        </td>
        <td className="px-6 py-3 text-right">
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconBtn icon="Pencil" onClick={() => openEdit(o)} />
            <IconBtn icon="Trash2" danger onClick={() => setDelId(o.id)} />
          </div>
        </td>
      </tr>
    );
  });

  return (
    <>
      <Section
        title="Отчёт о прибылях и убытках"
        desc="План и факт по всем статьям · всё считается автоматически"
        action={<Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={openNew}><Icon name="Plus" size={16} /> Статья</Button>}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground bg-secondary/50">
              <th className="text-left font-medium px-6 py-3">Показатель</th>
              <th className="text-right font-medium px-6 py-3">План</th>
              <th className="text-right font-medium px-6 py-3">Факт</th>
              <th className="text-right font-medium px-6 py-3">Отклонение</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-secondary/40 border-t border-border"><td className="px-6 py-2.5 font-semibold" colSpan={5}>Доходы</td></tr>
            {renderRows(income)}
            <tr className="bg-secondary/40 border-t border-border"><td className="px-6 py-2.5 font-semibold" colSpan={5}>Расходы</td></tr>
            {renderRows(expense)}
            <tr className="border-t-2 border-primary/20 bg-secondary/60">
              <td className="px-6 py-3.5 font-bold">Чистая прибыль</td>
              <td className="px-6 py-3.5 text-right tnum font-semibold text-muted-foreground">{fmt(grossPlan)}</td>
              <td className="px-6 py-3.5 text-right tnum font-bold text-success">{fmt(grossFact)}</td>
              <td className="px-6 py-3.5 text-right tnum font-medium">{grossFact - grossPlan >= 0 ? '+' : ''}{fmt(grossFact - grossPlan)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Редактировать статью' : 'Новая статья'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-sm">Название</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Например: Выручка от продаж" className="mt-1.5" /></div>
            <div className="flex gap-2">
              <Button type="button" variant={form.kind === 'income' ? 'default' : 'outline'} className={`flex-1 ${form.kind === 'income' ? 'bg-success hover:bg-success/90' : ''}`} onClick={() => setForm({ ...form, kind: 'income', category: 'Доходы' })}>Доход</Button>
              <Button type="button" variant={form.kind === 'expense' ? 'default' : 'outline'} className="flex-1" onClick={() => setForm({ ...form, kind: 'expense', category: 'Расходы' })}>Расход</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm">План, ₽</Label><Input type="number" value={form.plan_amount} onChange={(e) => setForm({ ...form, plan_amount: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Факт, ₽</Label><Input type="number" value={form.fact_amount} onChange={(e) => setForm({ ...form, fact_amount: e.target.value })} className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog open={delId !== null} onCancel={() => setDelId(null)} onConfirm={confirmDel} />
    </>
  );
}

// ---------- CALENDAR ----------
const emptyPay = { name: '', counterparty: '', pay_date: '', type: 'in', amount: '', status: 'Запланировано' };

function CalendarView({ payments, reload }: { payments: Payment[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof emptyPay>(emptyPay);
  const [delId, setDelId] = useState<number | null>(null);

  const openNew = () => { setEditId(null); setForm({ ...emptyPay, pay_date: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (p: Payment) => {
    setEditId(p.id);
    setForm({ name: p.name, counterparty: p.counterparty, pay_date: p.pay_date.slice(0, 10), type: p.type, amount: String(p.amount), status: p.status });
    setOpen(true);
  };
  const save = async () => {
    if (!form.name || !form.amount) { toast.error('Заполните название и сумму'); return; }
    const payload = { name: form.name, counterparty: form.counterparty || '—', pay_date: form.pay_date, type: form.type, amount: num(form.amount), status: form.status };
    try {
      if (editId) await apiUpdate('payments', { id: editId, ...payload });
      else await apiCreate('payments', payload);
      toast.success(editId ? 'Платёж обновлён' : 'Платёж добавлен'); setOpen(false); reload();
    } catch { toast.error('Ошибка сохранения'); }
  };
  const confirmDel = async () => {
    if (!delId) return;
    try { await apiDelete('payments', delId); toast.success('Платёж удалён'); setDelId(null); reload(); }
    catch { toast.error('Ошибка удаления'); }
  };
  const togglePaid = async (p: Payment) => {
    try { await apiUpdate('payments', { id: p.id, status: p.status === 'Оплачено' ? 'Запланировано' : 'Оплачено' }); reload(); }
    catch { toast.error('Ошибка'); }
  };

  const sorted = [...payments].sort((a, b) => a.pay_date.localeCompare(b.pay_date));
  let balance = 2400000;
  const rows = sorted.map((p) => { balance += p.type === 'in' ? num(p.amount) : -num(p.amount); return { ...p, balance }; });
  const totalIn = payments.filter((p) => p.type === 'in').reduce((s, p) => s + num(p.amount), 0);
  const totalOut = payments.filter((p) => p.type === 'out').reduce((s, p) => s + num(p.amount), 0);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Поступления</span><div className="mt-2 text-2xl font-semibold text-success tnum">{fmt(totalIn)}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Списания</span><div className="mt-2 text-2xl font-semibold text-destructive tnum">{fmt(totalOut)}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Остаток на конец</span><div className="mt-2 text-2xl font-semibold text-primary tnum">{fmt(balance)}</div></div>
      </section>
      <Section
        title="Платёжный календарь"
        desc="Клик по статусу отмечает оплату · остаток считается автоматически"
        action={<Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={openNew}><Icon name="Plus" size={16} /> Платёж</Button>}
      >
        {rows.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Платежей пока нет. Добавьте первый.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground bg-secondary/50">
                <th className="text-left font-medium px-6 py-3">Дата</th>
                <th className="text-left font-medium px-6 py-3">Операция</th>
                <th className="text-left font-medium px-6 py-3">Контрагент</th>
                <th className="text-right font-medium px-6 py-3">Сумма</th>
                <th className="text-right font-medium px-6 py-3">Остаток</th>
                <th className="text-left font-medium px-6 py-3">Статус</th>
                <th className="px-6 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/20 group">
                  <td className="px-6 py-3 tnum text-muted-foreground">{formatDate(p.pay_date)}</td>
                  <td className="px-6 py-3 flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${p.type === 'in' ? 'bg-success' : 'bg-primary/40'}`} />{p.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.counterparty}</td>
                  <td className={`px-6 py-3 text-right tnum font-medium ${p.type === 'in' ? 'text-success' : 'text-destructive'}`}>{p.type === 'in' ? '+' : '−'}{fmt(num(p.amount))}</td>
                  <td className="px-6 py-3 text-right tnum">{fmt(p.balance)}</td>
                  <td className="px-6 py-3">
                    <button type="button" onClick={() => togglePaid(p)} className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${p.status === 'Оплачено' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'}`}>{p.status}</button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconBtn icon="Pencil" onClick={() => openEdit(p)} />
                      <IconBtn icon="Trash2" danger onClick={() => setDelId(p.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Редактировать платёж' : 'Новый платёж'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-sm">Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Оплата по договору" className="mt-1.5" /></div>
            <div><Label className="text-sm">Контрагент</Label><Input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} placeholder="ООО «Компания»" className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm">Дата</Label><Input type="date" value={form.pay_date} onChange={(e) => setForm({ ...form, pay_date: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Сумма, ₽</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant={form.type === 'in' ? 'default' : 'outline'} className={`flex-1 ${form.type === 'in' ? 'bg-success hover:bg-success/90' : ''}`} onClick={() => setForm({ ...form, type: 'in' })}>Поступление</Button>
              <Button type="button" variant={form.type === 'out' ? 'default' : 'outline'} className="flex-1" onClick={() => setForm({ ...form, type: 'out' })}>Списание</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={delId !== null} onCancel={() => setDelId(null)} onConfirm={confirmDel} />
    </div>
  );
}

// ---------- SALARY ----------
const emptyEmp = { name: '', role: '', fixed: '', bonus: '', kpi: '100' };

function SalaryView({ departments, employees, reload }: { departments: Department[]; employees: Employee[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deptId, setDeptId] = useState<number>(0);
  const [form, setForm] = useState<typeof emptyEmp>(emptyEmp);
  const [delId, setDelId] = useState<number | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', icon: 'Briefcase' });

  const openNew = (dId: number) => { setEditId(null); setDeptId(dId); setForm(emptyEmp); setOpen(true); };
  const openEdit = (e: Employee) => { setEditId(e.id); setDeptId(e.department_id); setForm({ name: e.name, role: e.role, fixed: String(e.fixed), bonus: String(e.bonus), kpi: String(e.kpi) }); setOpen(true); };
  const save = async () => {
    if (!form.name) { toast.error('Введите имя'); return; }
    const payload = { department_id: deptId, name: form.name, role: form.role, fixed: num(form.fixed), bonus: num(form.bonus), kpi: num(form.kpi) };
    try {
      if (editId) await apiUpdate('employees', { id: editId, ...payload });
      else await apiCreate('employees', payload);
      toast.success(editId ? 'Сотрудник обновлён' : 'Сотрудник добавлен'); setOpen(false); reload();
    } catch { toast.error('Ошибка сохранения'); }
  };
  const confirmDel = async () => {
    if (!delId) return;
    try { await apiDelete('employees', delId); toast.success('Сотрудник удалён'); setDelId(null); reload(); }
    catch { toast.error('Ошибка удаления'); }
  };
  const addDept = async () => {
    if (!deptForm.name) { toast.error('Введите название'); return; }
    try { await apiCreate('departments', deptForm); toast.success('Отдел добавлен'); setDeptOpen(false); setDeptForm({ name: '', icon: 'Briefcase' }); reload(); }
    catch { toast.error('Ошибка'); }
  };

  const all = employees;
  const fund = all.reduce((s, e) => s + num(e.fixed) + num(e.bonus), 0);
  const avgKpi = all.length ? Math.round(all.reduce((s, e) => s + num(e.kpi), 0) / all.length) : 0;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Фонд оплаты труда</span><div className="mt-2 text-2xl font-semibold tnum">{fmt(fund)}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Сотрудников</span><div className="mt-2 text-2xl font-semibold tnum">{all.length}</div></div>
        <div className="bg-card border border-border rounded-lg p-5"><span className="text-sm text-muted-foreground">Средний KPI</span><div className="mt-2 text-2xl font-semibold tnum text-success">{avgKpi}%</div></div>
      </section>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setDeptOpen(true)}><Icon name="FolderPlus" size={16} /> Добавить отдел</Button>
      </div>
      {departments.map((d) => {
        const emps = employees.filter((e) => e.department_id === d.id);
        return (
          <Section key={d.id} title={d.name} desc={`${emps.length} сотрудников · оклад + премия по KPI`}
            action={<Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={() => openNew(d.id)}><Icon name="Plus" size={16} /> Сотрудник</Button>}>
            {emps.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">В отделе пока нет сотрудников.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground bg-secondary/50">
                    <th className="text-left font-medium px-6 py-3">Сотрудник</th>
                    <th className="text-left font-medium px-6 py-3">Должность</th>
                    <th className="text-right font-medium px-6 py-3">Оклад</th>
                    <th className="text-right font-medium px-6 py-3">Премия</th>
                    <th className="text-right font-medium px-6 py-3">К выплате</th>
                    <th className="text-right font-medium px-6 py-3">KPI</th>
                    <th className="px-6 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {emps.map((e) => (
                    <tr key={e.id} className="border-t border-border hover:bg-secondary/20 group">
                      <td className="px-6 py-3 font-medium">{e.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{e.role}</td>
                      <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(num(e.fixed))}</td>
                      <td className="px-6 py-3 text-right tnum text-muted-foreground">{fmt(num(e.bonus))}</td>
                      <td className="px-6 py-3 text-right tnum font-medium">{fmt(num(e.fixed) + num(e.bonus))}</td>
                      <td className="px-6 py-3 text-right"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium tnum ${num(e.kpi) >= 100 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{num(e.kpi)}%</span></td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconBtn icon="Pencil" onClick={() => openEdit(e)} />
                          <IconBtn icon="Trash2" danger onClick={() => setDelId(e.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Редактировать сотрудника' : 'Новый сотрудник'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-sm">Имя</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Иванов Иван" className="mt-1.5" /></div>
            <div><Label className="text-sm">Должность</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Менеджер" className="mt-1.5" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm">Оклад</Label><Input type="number" value={form.fixed} onChange={(e) => setForm({ ...form, fixed: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Премия</Label><Input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">KPI %</Label><Input type="number" value={form.kpi} onChange={(e) => setForm({ ...form, kpi: e.target.value })} className="mt-1.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deptOpen} onOpenChange={setDeptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Новый отдел</DialogTitle></DialogHeader>
          <div className="py-2"><Label className="text-sm">Название отдела</Label><Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Финансовый отдел" className="mt-1.5" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={addDept}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={delId !== null} onCancel={() => setDelId(null)} onConfirm={confirmDel} />
    </div>
  );
}

// ---------- TRAFFIC ----------
const emptyTraffic = { src: '', leads: '', calls: '', consult: '', sales: '', cost: '' };

function TrafficView({ traffic, reload }: { traffic: TrafficSource[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<typeof emptyTraffic>(emptyTraffic);
  const [delId, setDelId] = useState<number | null>(null);

  const openNew = () => { setEditId(null); setForm(emptyTraffic); setOpen(true); };
  const openEdit = (t: TrafficSource) => { setEditId(t.id); setForm({ src: t.src, leads: String(t.leads), calls: String(t.calls), consult: String(t.consult), sales: String(t.sales), cost: String(t.cost) }); setOpen(true); };
  const save = async () => {
    if (!form.src) { toast.error('Введите источник'); return; }
    const payload = { src: form.src, icon: 'Globe', leads: num(form.leads), calls: num(form.calls), consult: num(form.consult), sales: num(form.sales), cost: num(form.cost) };
    try {
      if (editId) await apiUpdate('traffic', { id: editId, ...payload });
      else await apiCreate('traffic', payload);
      toast.success(editId ? 'Источник обновлён' : 'Источник добавлен'); setOpen(false); reload();
    } catch { toast.error('Ошибка сохранения'); }
  };
  const confirmDel = async () => {
    if (!delId) return;
    try { await apiDelete('traffic', delId); toast.success('Источник удалён'); setDelId(null); reload(); }
    catch { toast.error('Ошибка удаления'); }
  };

  return (
    <>
      <Section title="Аналитика рекламного трафика" desc="Конверсии и стоимость договора по источникам"
        action={<Button size="sm" className="gap-2 bg-accent hover:bg-accent/90" onClick={openNew}><Icon name="Plus" size={16} /> Источник</Button>}>
        {traffic.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">Источников пока нет.</div>
        ) : (
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
                <th className="px-6 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {traffic.map((t) => {
                const conv = num(t.leads) ? ((num(t.sales) / num(t.leads)) * 100).toFixed(1) : '0';
                const cpa = num(t.sales) ? num(t.cost) / num(t.sales) : 0;
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-secondary/20 group">
                    <td className="px-6 py-3 font-medium flex items-center gap-2"><Icon name={t.icon} size={16} className="text-primary" />{t.src}</td>
                    <td className="px-6 py-3 text-right tnum">{num(t.leads)}</td>
                    <td className="px-6 py-3 text-right tnum text-muted-foreground">{num(t.calls)}</td>
                    <td className="px-6 py-3 text-right tnum text-muted-foreground">{num(t.consult)}</td>
                    <td className="px-6 py-3 text-right tnum font-medium">{num(t.sales)}</td>
                    <td className="px-6 py-3 text-right"><span className="inline-block px-2 py-0.5 rounded bg-success/10 text-success text-xs font-medium tnum">{conv}%</span></td>
                    <td className="px-6 py-3 text-right tnum font-medium">{fmt(cpa)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn icon="Pencil" onClick={() => openEdit(t)} />
                        <IconBtn icon="Trash2" danger onClick={() => setDelId(t.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Редактировать источник' : 'Новый источник'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="text-sm">Источник</Label><Input value={form.src} onChange={(e) => setForm({ ...form, src: e.target.value })} placeholder="Яндекс Директ" className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-sm">Лиды</Label><Input type="number" value={form.leads} onChange={(e) => setForm({ ...form, leads: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Недозвоны</Label><Input type="number" value={form.calls} onChange={(e) => setForm({ ...form, calls: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Консультации</Label><Input type="number" value={form.consult} onChange={(e) => setForm({ ...form, consult: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Продажи</Label><Input type="number" value={form.sales} onChange={(e) => setForm({ ...form, sales: e.target.value })} className="mt-1.5" /></div>
            </div>
            <div><Label className="text-sm">Затраты, ₽</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="mt-1.5" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeleteDialog open={delId !== null} onCancel={() => setDelId(null)} onConfirm={confirmDel} />
    </>
  );
}

// ---------- SETTINGS ----------
function SettingsView() {
  return (
    <section className="bg-card border border-border rounded-lg p-6 max-w-xl space-y-6">
      <div><h2 className="font-semibold mb-1">Общие настройки</h2><p className="text-xs text-muted-foreground">Параметры компании и отображения показателей</p></div>
      <div className="space-y-4">
        <div><Label className="text-sm">Название компании</Label><Input defaultValue="ООО «Финолог»" className="mt-1.5" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-sm">ИНН</Label><Input defaultValue="7701234567" className="mt-1.5" /></div>
          <div><Label className="text-sm">Ставка НДС</Label><Input defaultValue="20%" className="mt-1.5" /></div>
        </div>
        <div><Label className="text-sm">Целевая прибыль в месяц</Label><Input defaultValue="1 300 000" className="mt-1.5" /></div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div><div className="text-sm font-medium">Уведомления о просрочках</div><div className="text-xs text-muted-foreground">Email и push-уведомления</div></div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div><div className="text-sm font-medium">Автовыгрузка в 1С</div><div className="text-xs text-muted-foreground">Синхронизация с бухгалтерией</div></div>
          <Switch />
        </div>
        <Button onClick={() => toast.success('Настройки сохранены')} className="bg-accent hover:bg-accent/90 gap-2"><Icon name="Save" size={16} /> Сохранить</Button>
      </div>
    </section>
  );
}

function DeleteDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
          <AlertDialogDescription>Это действие нельзя отменить. Запись будет удалена из базы данных.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Index() {
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [traffic, setTraffic] = useState<TrafficSource[]>([]);

  const reload = useCallback(async () => {
    try {
      const [ops, pays, deps, emps, tr] = await Promise.all([
        apiList<Operation>('operations'),
        apiList<Payment>('payments'),
        apiList<Department>('departments'),
        apiList<Employee>('employees'),
        apiList<TrafficSource>('traffic'),
      ]);
      setOperations(ops); setPayments(pays); setDepartments(deps); setEmployees(emps); setTraffic(tr);
    } catch { toast.error('Не удалось загрузить данные'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const exportData = () => {
    switch (active) {
      case 'calendar':
        return { title: 'Платёжный календарь', headers: ['Дата', 'Операция', 'Контрагент', 'Тип', 'Сумма'],
          rows: payments.map((p) => [formatDate(p.pay_date), p.name, p.counterparty, p.type === 'in' ? 'Поступление' : 'Списание', fmt(num(p.amount))]) };
      case 'salary':
        return { title: 'Расчёт зарплаты', headers: ['Отдел', 'Сотрудник', 'Должность', 'Оклад', 'Премия', 'KPI'],
          rows: employees.map((e) => [departments.find((d) => d.id === e.department_id)?.name || '', e.name, e.role, fmt(num(e.fixed)), fmt(num(e.bonus)), `${num(e.kpi)}%`]) };
      case 'traffic':
        return { title: 'Аналитика трафика', headers: ['Источник', 'Лиды', 'Продажи', 'Конверсия', 'Цена договора'],
          rows: traffic.map((t) => [t.src, String(num(t.leads)), String(num(t.sales)), `${num(t.leads) ? ((num(t.sales) / num(t.leads)) * 100).toFixed(1) : 0}%`, fmt(num(t.sales) ? num(t.cost) / num(t.sales) : 0)]) };
      default:
        return { title: 'Отчёт о прибылях и убытках', headers: ['Показатель', 'План', 'Факт', 'Отклонение'],
          rows: operations.map((o) => [o.label, fmt(num(o.plan_amount)), fmt(num(o.fact_amount)), fmt(num(o.fact_amount) - num(o.plan_amount))]) };
    }
  };
  const handleExcel = () => { const d = exportData(); exportToCsv(d.title, d.headers, d.rows); toast.success('Файл Excel выгружен'); };
  const handlePdf = () => { const d = exportData(); exportToPdf(d.title, d.headers, d.rows); };

  const renderContent = () => {
    if (loading) return <Spinner />;
    switch (active) {
      case 'finance': return <FinanceView operations={operations} reload={reload} />;
      case 'calendar': return <CalendarView payments={payments} reload={reload} />;
      case 'salary': return <SalaryView departments={departments} employees={employees} reload={reload} />;
      case 'traffic': return <TrafficView traffic={traffic} reload={reload} />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView operations={operations} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <aside className="w-64 shrink-0 bg-primary text-primary-foreground flex flex-col fixed h-screen">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center"><Icon name="BarChart3" size={20} className="text-white" /></div>
          <div><div className="font-semibold text-[15px] leading-none">Финолог</div><div className="text-[11px] text-white/50 mt-1">Финучёт для бизнеса</div></div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((n) => (
            <button key={n.id} type="button" onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active === n.id ? 'bg-accent text-white font-medium' : 'text-white/70 hover:bg-white/10'}`}>
              <Icon name={n.icon} size={18} />{n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">АК</div>
          <div className="text-sm leading-tight"><div className="font-medium">Алексей К.</div><div className="text-[11px] text-white/50">Финансовый директор</div></div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold">{nav.find((n) => n.id === active)?.label}</h1>
            <p className="text-xs text-muted-foreground">{subtitles[active]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExcel}><Icon name="FileSpreadsheet" size={16} /> Excel</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePdf}><Icon name="FileText" size={16} /> PDF</Button>
          </div>
        </header>
        <div key={active} className="p-8 animate-fade-in">{renderContent()}</div>
      </main>
    </div>
  );
}
