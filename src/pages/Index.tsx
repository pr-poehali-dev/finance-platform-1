import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const fmt = (n: number) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' \u20bd';

const nav = [
  { id: 'dashboard', label: '\u0414\u0430\u0448\u0431\u043e\u0440\u0434', icon: 'LayoutDashboard' },
  { id: 'finance', label: '\u0420\u0430\u0441\u0445\u043e\u0434\u044b \u0438 \u0434\u043e\u0445\u043e\u0434\u044b', icon: 'ArrowLeftRight' },
  { id: 'calendar', label: '\u041f\u043b\u0430\u0442\u0451\u0436\u043d\u044b\u0439 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c', icon: 'CalendarDays' },
  { id: 'salary', label: '\u0417\u0430\u0440\u043f\u043b\u0430\u0442\u0430', icon: 'Users' },
  { id: 'traffic', label: '\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0442\u0440\u0430\u0444\u0438\u043a\u0430', icon: 'TrendingUp' },
  { id: 'settings', label: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438', icon: 'Settings' },
];

const kpis = [
  { label: '\u0412\u044b\u0440\u0443\u0447\u043a\u0430', value: 4820000, delta: '+12,4%', up: true, icon: 'Wallet' },
  { label: '\u0427\u0438\u0441\u0442\u0430\u044f \u043f\u0440\u0438\u0431\u044b\u043b\u044c', value: 1340000, delta: '+8,1%', up: true, icon: 'PiggyBank' },
  { label: '\u0420\u0430\u0441\u0445\u043e\u0434\u044b', value: 3480000, delta: '+4,7%', up: false, icon: 'Receipt' },
  { label: 'ROI \u0440\u0435\u043a\u043b\u0430\u043c\u044b', value: 0, display: '312%', delta: '+21%', up: true, icon: 'Target' },
];

const finance = [
  { cat: '\u0412\u044b\u0440\u0443\u0447\u043a\u0430 \u043e\u0442 \u043f\u0440\u043e\u0434\u0430\u0436', plan: 4500000, fact: 4820000, type: 'in' },
  { cat: '\u041f\u0440\u043e\u0447\u0438\u0435 \u0434\u043e\u0445\u043e\u0434\u044b', plan: 300000, fact: 210000, type: 'in' },
  { cat: '\u0424\u041e\u0422 \u0438 \u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430', plan: 1600000, fact: 1580000, type: 'out' },
  { cat: '\u0420\u0435\u043a\u043b\u0430\u043c\u0430 \u0438 \u043c\u0430\u0440\u043a\u0435\u0442\u0438\u043d\u0433', plan: 900000, fact: 1120000, type: 'out' },
  { cat: '\u0410\u0440\u0435\u043d\u0434\u0430 \u0438 \u043e\u0444\u0438\u0441', plan: 350000, fact: 350000, type: 'out' },
  { cat: '\u041d\u0430\u043b\u043e\u0433\u0438 \u0438 \u0441\u0431\u043e\u0440\u044b', plan: 420000, fact: 430000, type: 'out' },
];

const traffic = [
  { src: 'Yandex \u0414\u0438\u0440\u0435\u043a\u0442', leads: 340, calls: 42, consult: 180, sales: 68, cost: 620000 },
  { src: 'VK \u0420\u0435\u043a\u043b\u0430\u043c\u0430', leads: 210, calls: 55, consult: 96, sales: 31, cost: 280000 },
  { src: 'Telegram Ads', leads: 128, calls: 18, consult: 71, sales: 22, cost: 140000 },
  { src: 'SEO / \u041e\u0440\u0433\u0430\u043d\u0438\u043a\u0430', leads: 190, calls: 12, consult: 110, sales: 44, cost: 80000 },
];

function Sparkbars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color}`}
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState('dashboard');
  const totalIn = finance.filter((f) => f.type === 'in').reduce((s, f) => s + f.fact, 0);
  const totalOut = finance.filter((f) => f.type === 'out').reduce((s, f) => s + f.fact, 0);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-primary text-primary-foreground flex flex-col fixed h-screen">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center">
            <Icon name="BarChart3" size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[15px] leading-none">\u0424\u0438\u043d\u043e\u043b\u043e\u0433</div>
            <div className="text-[11px] text-white/50 mt-1">\u0424\u0438\u043d\u0443\u0447\u0451\u0442 \u0434\u043b\u044f \u0431\u0438\u0437\u043d\u0435\u0441\u0430</div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active === n.id
                  ? 'bg-accent text-white font-medium'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            \u0410\u041a
          </div>
          <div className="text-sm leading-tight">
            <div className="font-medium">\u0410\u043b\u0435\u043a\u0441\u0435\u0439 \u041a.</div>
            <div className="text-[11px] text-white/50">\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0439 \u0434\u0438\u0440\u0435\u043a\u0442\u043e\u0440</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-semibold">
              {nav.find((n) => n.id === active)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">\u041e\u0442\u0447\u0451\u0442\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434: \u0438\u044e\u043d\u044c 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="FileSpreadsheet" size={16} /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="FileText" size={16} /> PDF
            </Button>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90">
              <Icon name="Plus" size={16} /> \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c
            </Button>
          </div>
        </header>

        <div className="p-8 space-y-8 animate-fade-in">
          {/* KPI cards */}
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
                  {k.delta} \u043a \u043f\u0440\u043e\u0448\u043b\u043e\u043c\u0443 \u043c\u0435\u0441\u044f\u0446\u0443
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Cashflow chart */}
            <div className="xl:col-span-2 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold">\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u0434\u0435\u043d\u0435\u0436\u043d\u044b\u0445 \u0441\u0440\u0435\u0434\u0441\u0442\u0432</h2>
                  <p className="text-xs text-muted-foreground">\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 12 \u043c\u0435\u0441\u044f\u0446\u0435\u0432</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-accent" /> \u0414\u043e\u0445\u043e\u0434\u044b
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/30" /> \u0420\u0430\u0441\u0445\u043e\u0434\u044b
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">\u0414\u043e\u0445\u043e\u0434\u044b</div>
                  <Sparkbars
                    data={[32, 41, 38, 45, 52, 48, 55, 61, 58, 64, 70, 76]}
                    color="bg-accent"
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">\u0420\u0430\u0441\u0445\u043e\u0434\u044b</div>
                  <Sparkbars
                    data={[28, 30, 34, 33, 40, 38, 42, 45, 43, 48, 50, 54]}
                    color="bg-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Balance summary */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-semibold mb-4">\u0418\u0442\u043e\u0433 \u043c\u0435\u0441\u044f\u0446\u0430</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground">\u041f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u044f</span>
                  <span className="font-semibold text-success tnum">{fmt(totalIn)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-sm text-muted-foreground">\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u044f</span>
                  <span className="font-semibold text-destructive tnum">{fmt(totalOut)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-medium">\u0427\u0438\u0441\u0442\u044b\u0439 \u043f\u043e\u0442\u043e\u043a</span>
                  <span className="text-lg font-bold text-primary tnum">
                    {fmt(totalIn - totalOut)}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-secondary rounded-md text-xs text-muted-foreground flex gap-2">
                  <Icon name="Info" size={16} className="shrink-0 text-primary" />
                  \u041f\u043b\u0430\u043d \u043f\u043e \u043f\u0440\u0438\u0431\u044b\u043b\u0438 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d \u043d\u0430 106% \u043e\u0442 \u0446\u0435\u043b\u0435\u0432\u043e\u0433\u043e \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044f.
                </div>
              </div>
            </div>
          </div>

          {/* Finance plan/fact table */}
          <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">\u0420\u0430\u0441\u0445\u043e\u0434\u044b \u0438 \u0434\u043e\u0445\u043e\u0434\u044b \u2014 \u043f\u043b\u0430\u043d / \u0444\u0430\u043a\u0442</h2>
              <span className="text-xs text-muted-foreground">\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u044f\u0447\u0435\u0439\u043a\u0443 \u0434\u043b\u044f \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-secondary/50">
                  <th className="text-left font-medium px-6 py-3">\u0421\u0442\u0430\u0442\u044c\u044f</th>
                  <th className="text-right font-medium px-6 py-3">\u041f\u043b\u0430\u043d</th>
                  <th className="text-right font-medium px-6 py-3">\u0424\u0430\u043a\u0442</th>
                  <th className="text-right font-medium px-6 py-3">\u041e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0435</th>
                  <th className="text-left font-medium px-6 py-3 w-40">\u0412\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435</th>
                </tr>
              </thead>
              <tbody>
                {finance.map((f) => {
                  const diff = f.fact - f.plan;
                  const pct = Math.min((f.fact / f.plan) * 100, 100);
                  const good = f.type === 'in' ? diff >= 0 : diff <= 0;
                  return (
                    <tr key={f.cat} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-6 py-3.5">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              f.type === 'in' ? 'bg-success' : 'bg-primary/40'
                            }`}
                          />
                          {f.cat}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right tnum text-muted-foreground">
                        {fmt(f.plan)}
                      </td>
                      <td className="px-6 py-3.5 text-right tnum font-medium">{fmt(f.fact)}</td>
                      <td
                        className={`px-6 py-3.5 text-right tnum font-medium ${
                          good ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {diff > 0 ? '+' : ''}
                        {fmt(diff)}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              f.type === 'in' ? 'bg-success' : 'bg-accent'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Traffic analytics */}
          <section className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold">\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u043e\u0433\u043e \u0442\u0440\u0430\u0444\u0438\u043a\u0430</h2>
                <p className="text-xs text-muted-foreground">\u041a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u0438 \u0438 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u044c \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430 \u043f\u043e \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0430\u043c</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Icon name="Filter" size={16} /> \u0424\u0438\u043b\u044c\u0442\u0440
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-secondary/50">
                  <th className="text-left font-medium px-6 py-3">\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a</th>
                  <th className="text-right font-medium px-6 py-3">\u041b\u0438\u0434\u044b</th>
                  <th className="text-right font-medium px-6 py-3">\u041d\u0435\u0434\u043e\u0437\u0432\u043e\u043d\u044b</th>
                  <th className="text-right font-medium px-6 py-3">\u041a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u0438</th>
                  <th className="text-right font-medium px-6 py-3">\u041f\u0440\u043e\u0434\u0430\u0436\u0438</th>
                  <th className="text-right font-medium px-6 py-3">\u041a\u043e\u043d\u0432\u0435\u0440\u0441\u0438\u044f</th>
                  <th className="text-right font-medium px-6 py-3">\u0426\u0435\u043d\u0430 \u0434\u043e\u0433\u043e\u0432\u043e\u0440\u0430</th>
                </tr>
              </thead>
              <tbody>
                {traffic.map((t) => {
                  const conv = ((t.sales / t.leads) * 100).toFixed(1);
                  const cpa = t.cost / t.sales;
                  return (
                    <tr key={t.src} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-6 py-3.5 font-medium">{t.src}</td>
                      <td className="px-6 py-3.5 text-right tnum">{t.leads}</td>
                      <td className="px-6 py-3.5 text-right tnum text-muted-foreground">
                        {t.calls}
                      </td>
                      <td className="px-6 py-3.5 text-right tnum text-muted-foreground">
                        {t.consult}
                      </td>
                      <td className="px-6 py-3.5 text-right tnum font-medium">{t.sales}</td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-success/10 text-success text-xs font-medium tnum">
                          {conv}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right tnum font-medium">{fmt(cpa)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
