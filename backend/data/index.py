import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

ENTITIES = {
    'operations': {
        'table': 'operations',
        'fields': ['label', 'category', 'plan_amount', 'fact_amount', 'kind', 'sort_order'],
        'order': 'sort_order ASC, id ASC',
    },
    'payments': {
        'table': 'payments',
        'fields': ['pay_date', 'name', 'counterparty', 'type', 'amount', 'status'],
        'order': 'pay_date ASC, id ASC',
    },
    'departments': {
        'table': 'departments',
        'fields': ['name', 'icon'],
        'order': 'id ASC',
    },
    'employees': {
        'table': 'employees',
        'fields': ['department_id', 'name', 'role', 'fixed', 'bonus', 'kpi'],
        'order': 'id ASC',
    },
    'traffic': {
        'table': 'traffic_sources',
        'fields': ['src', 'icon', 'leads', 'calls', 'consult', 'sales', 'cost'],
        'order': 'id ASC',
    },
}


def to_json(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    return str(obj)


def handler(event: dict, context) -> dict:
    '''Универсальный CRUD для всех разделов финансовой платформы: операции, платежи, отделы, сотрудники, трафик'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    entity = params.get('entity', 'operations')
    if entity not in ENTITIES:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'unknown entity'})}

    cfg = ENTITIES[entity]
    table = cfg['table']
    fields = cfg['fields']

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            cur.execute(f"SELECT * FROM {table} ORDER BY {cfg['order']}")
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps([dict(r) for r in rows], default=to_json)}

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            cols = [f for f in fields if f in body]
            vals = [body[f] for f in cols]
            placeholders = ','.join(['%s'] * len(cols))
            col_names = ','.join(cols)
            cur.execute(
                f"INSERT INTO {table} ({col_names}) VALUES ({placeholders}) RETURNING *",
                vals
            )
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps(dict(cur.fetchone()), default=to_json)}

        if method == 'PUT':
            rid = body.get('id')
            if not rid:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
            cols = [f for f in fields if f in body]
            sets = ','.join([f"{c}=%s" for c in cols])
            vals = [body[c] for c in cols] + [rid]
            cur.execute(f"UPDATE {table} SET {sets} WHERE id=%s RETURNING *", vals)
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps(dict(cur.fetchone()), default=to_json)}

        if method == 'DELETE':
            rid = params.get('id') or body.get('id')
            if not rid:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
            if entity == 'departments':
                cur.execute("DELETE FROM employees WHERE department_id=%s", (int(rid),))
            cur.execute(f"DELETE FROM {table} WHERE id=%s", (int(rid),))
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'method not allowed'})}
    finally:
        cur.close()
        conn.close()
