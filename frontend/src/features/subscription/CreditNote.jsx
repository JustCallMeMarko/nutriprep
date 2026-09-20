function CreditStar() {
  return (
    <svg width="13" height="13" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="black"
      />
    </svg>
  );
}

export function CreditNote({ text }) {
  return (
    <div className="mx-auto flex h-[45px] w-full max-w-[441px] items-center gap-3 rounded-lg border-2 border-[#DDDDDD] bg-[rgba(221,221,221,0.5)] px-4">
      <CreditStar />
      <span className="text-[11px] font-medium leading-[13px] text-black">{text}</span>
    </div>
  );
}