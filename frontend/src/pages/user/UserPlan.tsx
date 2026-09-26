import { SubscriptionFaq } from '@/components/SubscriptionFaq'
import { PricingTable } from '@clerk/react'

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

export function CreditNote({ }) {
  return (
    <div className="mx-auto flex h-11.25 w-full max-w-110.25 mt-2 items-center gap-3 rounded-lg border-2 border-[#DDDDDD] bg-[rgba(221,221,221,0.5)] px-4">
      <CreditStar />
      <span className="text-[11px] font-medium leading-3.25 text-black">Meals cost 4-9 credits each, based on ingredients and portion size.</span>
    </div>
  );
}

export default function UserPlan() {
  const subscriptionFaqs = [
    {
      id: "how-credits-work",
      question: "How do credits work?",
      answer:
        "Every meal in the catalog is tagged with a credit cost, usually 4-9 credits depending on ingredients and portion size. Subscribe to a tier, and your credits are deducted each time you order.",
    },
    {
      id: "unused-credits",
      question: "What happens to unused credits?",
      answer:
        "Unused credits roll over as long as your subscription stays active, but they expire based on your purchase date.",
    },
    {
      id: "switch-tiers",
      question: "Can I switch tiers later?",
      answer:
        "Yes. You can upgrade or downgrade anytime from your profile, changes apply on your next billing cycle.",
    },
  ];
  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="border-b border-black/10 px-6 pb-8">
        <div className="mx-auto flex max-w-175 flex-col items-center gap-2 text-center">
          <p className="text-[13px] font-bold leading-4 text-[#306FE6] uppercase">Subscription</p>
          <h1 className="text-3xl font-bold text-foreground">
            Pick a Subscription Plan
          </h1>
          <p className="max-w-125 text-[16px] font-medium leading-5 text-black/50">
            Top up once a month, then spend your credits on any meal in the catalog plans and à la carte.
          </p>
        </div>
        <CreditNote />
      </div>
      <PricingTable />
      <SubscriptionFaq faqs={subscriptionFaqs} />
    </div>
  )
}
