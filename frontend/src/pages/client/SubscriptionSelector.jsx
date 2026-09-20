import { subscriptionTiers, subscriptionFaqs } from "@/lib/subscriptionTiers";
import { TierCard } from "@/components/TierCard";
import { CreditNote } from "@/features/subscription/CreditNote";
import { SubscriptionFaq } from "@/features/subscription/SubscriptionFaq";

export default function SubscriptionSelector() {
  const handleChooseTier = (tier) => {
    // TODO: wire to actual subscription/payment flow — separate ticket
    console.log("Chose tier:", tier.name);
  };

  return (
    <div className="min-h-screen bg-white pb-24" style={{ fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div className="border-b border-black/10 px-6 pb-8 pt-8">
        <div className="mx-auto flex max-w-[700px] flex-col items-center gap-2 text-center">
          <p className="text-[13px] font-bold leading-4 text-[#306FE6]">Subscription</p>
          <h1 className="text-[24px] font-extrabold leading-[29px] text-black">
            Pick a Subscription Plan
          </h1>
          <p className="max-w-[500px] text-[16px] font-medium leading-5 text-black/50">
            Top up once a month, then spend your credits on any meal in the catalog plans and à la carte.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[900px] flex-col gap-12 px-6 pt-8">
        <CreditNote text="Meals cost 4-9 credits each, based on ingredients and portion size." />

        <div className="flex flex-col items-stretch gap-6 md:flex-row">
          {subscriptionTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} onChoose={handleChooseTier} />
          ))}
        </div>

        <SubscriptionFaq faqs={subscriptionFaqs} />
      </div>
    </div>
  );
}