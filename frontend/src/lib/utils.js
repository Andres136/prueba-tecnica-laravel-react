export function cls(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function normalizeLaravelPagination(res) {
  // Acepta:
  // - { data: { data:[], current_page,last_page,total } }
  // - { data:[], current_page,last_page,total }
  // - arrays directos
  const root = res?.data ?? res;

  if (Array.isArray(root)) {
    return { rows: root, current: 1, last: 1, total: root.length };
  }

  const rows = root?.data ?? root?.rows ?? [];
  const current = root?.current_page ?? root?.meta?.current_page ?? 1;
  const last = root?.last_page ?? root?.meta?.last_page ?? 1;
  const total = root?.total ?? root?.meta?.total ?? (Array.isArray(rows) ? rows.length : 0);

  return { rows: Array.isArray(rows) ? rows : [], current, last, total };
}
