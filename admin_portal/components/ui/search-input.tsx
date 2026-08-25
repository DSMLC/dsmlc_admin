"use client";

import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9a9a]"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[44px] w-full rounded-full border border-[#262626] bg-[#141414] py-2 pl-10 pr-4 text-sm font-light text-[#f2f2f2] placeholder:text-[#9a9a9a] outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}
