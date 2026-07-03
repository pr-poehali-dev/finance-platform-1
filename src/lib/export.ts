export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const escape = (v: string | number) => {
    const s = String(v).replace(/"/g, '""');
    return /[",;\n]/.test(s) ? `"${s}"` : s;
  };
  const bom = '\uFEFF';
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(';'))
    .join('\n');
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPdf(title: string, headers: string[], rows: string[][]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const thead = headers.map((h) => `<th>${h}</th>`).join('');
  const tbody = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('');
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:'IBM Plex Sans',Arial,sans-serif;padding:40px;color:#1e293b}
      h1{font-size:20px;margin:0 0 4px}
      .sub{color:#64748b;font-size:12px;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{text-align:left;background:#f1f5f9;padding:10px;border-bottom:2px solid #cbd5e1}
      td{padding:9px 10px;border-bottom:1px solid #e2e8f0}
      td:not(:first-child),th:not(:first-child){text-align:right}
    </style></head>
    <body>
      <h1>${title}</h1>
      <div class="sub">Финолог · Финучёт для бизнеса · сформировано ${new Date().toLocaleDateString('ru-RU')}</div>
      <table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
      <script>window.onload=()=>{window.print()}</script>
    </body></html>
  `);
  win.document.close();
}
