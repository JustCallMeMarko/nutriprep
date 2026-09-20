import { Link } from "react-router-dom";

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="white"
      />
    </svg>
  );
}

export function CreditBalance({ credits, topUpTo = "/plans" }) {
  return (
    <div className="flex h-[39px] w-[268px] items-center gap-2 rounded-full border-[1.5px] border-[rgba(174,174,178,0.5)] bg-[#FFFEFE] px-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black">
        <StarIcon />
      </span>
      <p className="flex-1 text-[12px] font-medium leading-[15px] text-black">
        Your balance: <span className="font-bold">{credits} credits</span>
      </p>
      <Link
        to={topUpTo}
        className="pr-2 text-[11px] font-extrabold leading-[13px] text-[#306FE6] hover:underline"
      >
        Top up
      </Link>
    </div>
  );
}