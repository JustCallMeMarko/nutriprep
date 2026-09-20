import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search meals..." }) {
  return (
    <div className="relative w-[282px]">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[39px] w-full rounded-[5px] border-[1.5px] border-[rgba(174,174,178,0.5)] bg-[#FFFEFE] pl-4 pr-11 text-[13px] font-medium leading-4 text-black outline-none placeholder:text-black/50 focus:border-[#306FE6]"
      />
      <Search
        size={20}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black opacity-50"
      />
    </div>
  );
}