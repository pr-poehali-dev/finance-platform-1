const API = 'https://functions.poehali.dev/90b161aa-9a91-4ba3-95df-7e3f0de1e67d';

export type Entity =
  | 'operations'
  | 'payments'
  | 'departments'
  | 'employees'
  | 'traffic';

export async function apiList<T>(entity: Entity): Promise<T[]> {
  const res = await fetch(`${API}?entity=${entity}`);
  if (!res.ok) throw new Error('load failed');
  return res.json();
}

export async function apiCreate<T>(entity: Entity, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}?entity=${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('create failed');
  return res.json();
}

export async function apiUpdate<T>(entity: Entity, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}?entity=${entity}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('update failed');
  return res.json();
}

export async function apiDelete(entity: Entity, id: number): Promise<void> {
  const res = await fetch(`${API}?entity=${entity}&id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('delete failed');
}
