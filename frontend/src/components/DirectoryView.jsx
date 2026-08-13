import React from 'react';
import { LayoutGrid, List as ListIcon, Table as TableIcon } from 'lucide-react';

export function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 h-fit">
      <button
        onClick={() => setViewMode('card')}
        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
          viewMode === 'card' 
            ? 'bg-brandMint text-corporateNavy shadow-md font-bold' 
            : 'text-slate-500 hover:text-white hover:bg-slate-900'
        }`}
        title="Card Grid View"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
          viewMode === 'list' 
            ? 'bg-brandMint text-corporateNavy shadow-md font-bold' 
            : 'text-slate-500 hover:text-white hover:bg-slate-900'
        }`}
        title="Detailed List View"
      >
        <ListIcon size={18} />
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
          viewMode === 'table' 
            ? 'bg-brandMint text-corporateNavy shadow-md font-bold' 
            : 'text-slate-500 hover:text-white hover:bg-slate-900'
        }`}
        title="Compact Table View"
      >
        <TableIcon size={18} />
      </button>
    </div>
  );
}

export function DirectoryView({
  items,
  viewMode,
  columns,
  renderCard,
  renderList,
  renderTableRow,
  emptyMessage
}) {
  
  if (!items || items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <p className="text-slate-500 font-mono">{emptyMessage || 'No items found.'}</p>
      </div>
    );
  }

  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => renderCard(item, index))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {items.map((item, index) => renderList(item, index))}
      </div>
    );
  }

  // Fallback to table view
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {items.map((item, index) => renderTableRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
