export const subscriptionTiers = [
  {
    id: "bronze",
    name: "Bronze",
    tagline: "Perfect for light meal planning and trying things out.",
    price: "₱1,500",
    credits: 25,
    mealsInfo: "3-4 meals a week",
    billing: "Billed monthly. Cancel Anytime",
    highlighted: false,
    badge: null,
    features: [
      "Access to all Regular diet meals",
      "Standard delivery windows",
      "Credits valid for 30 days",
      "Basic macro tracking",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    tagline: "For regular preppers who want variety without the guesswork.",
    price: "₱2,500",
    credits: 40,
    mealsInfo: "5-6 meals a week",
    billing: "Billed monthly. Cancel Anytime",
    highlighted: true,
    badge: "BEST VALUE",
    features: [
      "Access to Regular + Specialized meals",
      "Priority delivery windows",
      "Basic macro tracking",
      "PrepAI meal recommendations",
      "Full macro & kcal tracking",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "Full coverage for anyone who wants meals sorted, every day.",
    price: "₱4,000",
    credits: 100,
    mealsInfo: "daily meals covered",
    billing: "Billed monthly. Cancel Anytime",
    highlighted: false,
    badge: null,
    features: [
      "Full catalog access, incl. specialized meals",
      "Priority delivery + free rescheduling",
      "Credits valid for 45 days",
      "Personalized weekly planning with PrepAI",
      "Free monthly macro consultation",
    ],
  },
];

export const subscriptionFaqs = [
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
      "Unused credits roll over as long as your subscription stays active, but they expire based on your tier's validity window (30 days for Bronze, 45 days for Silver and Gold).",
  },
  {
    id: "switch-tiers",
    question: "Can I switch tiers later?",
    answer:
      "Yes. You can upgrade or downgrade anytime from your profile, changes apply on your next billing cycle.",
  },
];