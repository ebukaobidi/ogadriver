import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxButtons = 5; // show up to 5 page numbers
  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex justify-center items-center mt-8 space-x-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
      >
        ← Prev
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${page === currentPage ? 'bg-brandMint text-corporateNavy' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
      >
        Next →
      </button>
    </nav>
  );
};

export default Pagination;
