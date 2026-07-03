CREATE TABLE IF NOT EXISTS operations (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Прочее',
    plan_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    fact_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    kind VARCHAR(20) NOT NULL DEFAULT 'expense',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    pay_date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    counterparty VARCHAR(255) NOT NULL DEFAULT '—',
    type VARCHAR(10) NOT NULL DEFAULT 'in',
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Запланировано',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Briefcase',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '',
    fixed NUMERIC(14,2) NOT NULL DEFAULT 0,
    bonus NUMERIC(14,2) NOT NULL DEFAULT 0,
    kpi INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS traffic_sources (
    id SERIAL PRIMARY KEY,
    src VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Globe',
    leads INTEGER NOT NULL DEFAULT 0,
    calls INTEGER NOT NULL DEFAULT 0,
    consult INTEGER NOT NULL DEFAULT 0,
    sales INTEGER NOT NULL DEFAULT 0,
    cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO operations (label, category, plan_amount, fact_amount, kind, sort_order) VALUES
('Выручка от продаж', 'Доходы', 4500000, 4820000, 'income', 1),
('Прочие доходы', 'Доходы', 300000, 210000, 'income', 2),
('Себестоимость продаж', 'Расходы', 1800000, 1920000, 'expense', 3),
('ФОТ и зарплата', 'Расходы', 1600000, 1580000, 'expense', 4),
('Реклама и маркетинг', 'Расходы', 900000, 1120000, 'expense', 5),
('Аренда и офис', 'Расходы', 350000, 350000, 'expense', 6),
('Налоги и сборы', 'Расходы', 420000, 430000, 'expense', 7);

INSERT INTO payments (pay_date, name, counterparty, type, amount, status) VALUES
('2026-07-05', 'Оплата по договору', 'ООО «СтройТех»', 'in', 620000, 'Ожидается'),
('2026-07-07', 'Аренда офиса', 'БЦ «Меркурий»', 'out', 350000, 'Запланировано'),
('2026-07-10', 'Зарплата за июнь', 'Сотрудники', 'out', 1580000, 'Запланировано'),
('2026-07-12', 'Оплата услуг', 'ИП Иванов', 'in', 145000, 'Ожидается'),
('2026-07-15', 'Налог на прибыль', 'ФНС', 'out', 430000, 'Запланировано'),
('2026-07-20', 'Оплата по договору', 'ООО «Альфа»', 'in', 890000, 'Ожидается'),
('2026-07-25', 'НДС к уплате', 'ФНС', 'out', 210000, 'Запланировано'),
('2026-07-28', 'Оплата по договору', 'ООО «Бета»', 'in', 540000, 'Ожидается');

INSERT INTO departments (name, icon) VALUES
('Отдел продаж', 'Briefcase'),
('Маркетинг', 'Megaphone'),
('Производство', 'Factory');

INSERT INTO employees (department_id, name, role, fixed, bonus, kpi) VALUES
(1, 'Смирнов Игорь', 'Руководитель', 120000, 180000, 112),
(1, 'Кузнецова Анна', 'Менеджер', 80000, 140000, 108),
(1, 'Попов Дмитрий', 'Менеджер', 80000, 95000, 92),
(2, 'Волкова Мария', 'Директор', 140000, 90000, 98),
(2, 'Соколов Павел', 'Таргетолог', 90000, 60000, 94),
(3, 'Морозов Артём', 'Начальник цеха', 130000, 70000, 105),
(3, 'Лебедев Сергей', 'Мастер', 95000, 45000, 99);

INSERT INTO traffic_sources (src, icon, leads, calls, consult, sales, cost) VALUES
('Яндекс Директ', 'Search', 340, 42, 180, 68, 620000),
('VK Реклама', 'Users', 210, 55, 96, 31, 280000),
('Telegram Ads', 'Send', 128, 18, 71, 22, 140000),
('SEO / Органика', 'Globe', 190, 12, 110, 44, 80000);