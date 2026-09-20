export function ProfileBanner({ preference, onChangeProfile }) {
  return (
    <div className="flex items-center justify-between rounded-[5px] border-2 border-[#DDDDDD] bg-[rgba(221,221,221,0.5)] px-3 py-2">
      <p className="text-[11px] font-medium leading-[13px] text-black">
        Based on your profile, we&apos;re showing {preference} plans first.
      </p>
      <button
        type="button"
        onClick={onChangeProfile}
        className="text-[11px] font-bold leading-[13px] text-[#306FE6] hover:underline"
      >
        Change in profile
      </button>
    </div>
  );
}