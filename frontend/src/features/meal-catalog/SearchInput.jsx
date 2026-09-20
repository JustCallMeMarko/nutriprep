import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search meals..." }) {
  return (
    <div className="relative w-[282px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[39px] w-full rounded-[5px] border border-border-subtle bg-surface pl-4 pr-11 text-[13px] font-medium leading-4 text-text-primary outline-none placeholder:text-text-primary/50 focus:border-brand"
      />
      <Search
        size={20}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black opacity-50"
      />
    </div>
  );
}