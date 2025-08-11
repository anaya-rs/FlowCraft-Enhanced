import React from "react";

interface SearchFilterProps {
  filters: {
    query: string;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    status?: string;
  };
  onChange: (filters: any) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ filters, onChange }) => {
  return (
    <div className="glass-card-dark p-4 flex flex-col md:flex-row gap-4 items-center animate-fade-in">
      <input
        type="text"
        placeholder="Search..."
        value={filters.query}
        onChange={e => onChange({ ...filters, query: e.target.value })}
        className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white placeholder:text-gray-400 focus:border-primary w-full md:w-48"
      />
      <input
        type="date"
        value={filters.dateFrom || ""}
        onChange={e => onChange({ ...filters, dateFrom: e.target.value })}
        className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary w-full md:w-36"
      />
      <input
        type="date"
        value={filters.dateTo || ""}
        onChange={e => onChange({ ...filters, dateTo: e.target.value })}
        className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary w-full md:w-36"
      />
      <select
        value={filters.type || ""}
        onChange={e => onChange({ ...filters, type: e.target.value })}
        className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary w-full md:w-32"
      >
        <option value="">All Types</option>
        <option value="pdf">PDF</option>
        <option value="image">Image</option>
      </select>
      <select
        value={filters.status || ""}
        onChange={e => onChange({ ...filters, status: e.target.value })}
        className="px-3 py-2 rounded bg-white/10 border border-white/10 text-white focus:border-primary w-full md:w-32"
      >
        <option value="">All Status</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>
    </div>
  );
};

export default SearchFilter;
