export const exportToExcel = (data, headers, mapper, filename) => {
  if (!data || !data.length) return;
  
  // Basic CSV export as a fallback for Excel
  const headerKeys = headers ? headers.map(h => h.key || h) : Object.keys(data[0]);
  const headerLabels = headers ? headers.map(h => h.label || h) : headerKeys;
  
  const csvContent = [
    headerLabels.join(','),
    ...data.map(row => {
      return headerKeys.map(key => {
        let val = mapper ? mapper(row, key) : row[key];
        // Handle undefined, null, or objects
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename || 'export'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (elementId, filename) => {
  // Simple print fallback
  window.print();
};
