import { useState } from "react";
import { subscriptionTiers, subscriptionFaqs } from "@/lib/subscriptionTiers";
import { TierCard } from "@/components/TierCard";
import { CreditNote } from "@/features/subscription/CreditNote";
import { SubscriptionFaq } from "@/features/subscription/SubscriptionFaq";
import { useApi } from "@/utils/api";
import { useApiResource } from "@/hooks/useApiResource";

export default function SubscriptionSelector() {
  const [actionState, setActionState] = useState({ status: "idle", message: "" });
  const { makeRequest } = useApi();
  const { data: subscription, loading, error, reload } = useApiResource("/user/subscriptions");

  const handleChooseTier = async (tier) => {
    setActionState({ status: "loading", message: "Saving your subscription..." });
    try {
      await makeRequest("/user/subscriptions", {
        method: "POST",
        body: JSON.stringify({ tier_id: tier.id }),
      });
      await reload();
      setActionState({ status: "success", message: `${tier.name} subscription is now active.` });
    } catch (requestError) {
      setActionState({ status: "error", message: requestError.message });
    }
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

        {loading ? (
          <p className="text-sm text-slate-500">Loading your subscription...</p>
        ) : error ? (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>Unable to load your subscription.</span>
            <button type="button" onClick={() => reload()} className="font-bold underline">Try again</button>
          </div>
        ) : subscription ? (
          <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Active plan: <strong>{subscription.tierName}</strong> with {subscription.credits} credits.
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">No active subscription yet.</div>
        )}

        {actionState.status !== "idle" && (
          <div className={actionState.status === "error" ? "rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" : "rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700"}>
            {actionState.status === "loading" ? "Saving..." : actionState.message}
          </div>
        )}

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