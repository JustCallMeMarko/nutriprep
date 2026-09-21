import lowCalorieImg from "@/assets/MealCatalog/MealPlans/LowCalorie.jpg";
import leanActiveImg from "@/assets/MealCatalog/MealPlans/LeanActive.jpg";
import performanceImg from "@/assets/MealCatalog/MealPlans/Performance.jpg";
import ketoImg from "@/assets/MealCatalog/MealPlans/Keto.jpg";
import highFiberImg from "@/assets/MealCatalog/MealPlans/HighFIber.jpg";
import diabeticImg from "@/assets/MealCatalog/MealPlans/Diabetic.jpg";



export const dummyPlans = [
  {
    id: 1,
    name: "Low Calorie",
    tag: "Low calorie",
    category: "regular",
    description: "Balanced, everyday meals sized for steady, sustainable weight loss.",
    image_url: lowCalorieImg,
    credits_per_meal: 5,
    macros: { protein: "28%", carbs: "45%", fat: "27%" },
  },
  {
    id: 2,
    name: "Lean & Active",
    tag: "Low carb - high protein",
    category: "regular",
    description: "Higher protein, lower carbs, built for weight management and keeping full longer.",
    image_url: leanActiveImg,
    credits_per_meal: 7,
    macros: { protein: "35%", carbs: "30%", fat: "35%" },
  },
  {
    id: 3,
    name: "Performance",
    tag: "Low carb - high protein",
    category: "regular",
    description: "Muscle recovery and energy for daily workouts and active routines.",
    image_url: performanceImg,
    credits_per_meal: 8,
    macros: { protein: "38%", carbs: "33%", fat: "29%" },
  },
  {
    id: 4,
    name: "Keto",
    tag: "Keto",
    category: "regular",
    description: "Very low carb, high healthy fat. Best with medical guidance for some conditions.",
    image_url: ketoImg,
    credits_per_meal: 8,
    macros: { protein: "23%", carbs: "7%", fat: "70%" },
  },
  {
    id: 5,
    name: "High Fiber",
    tag: "High Fiber",
    category: "specialized",
    description: "Supports digestion, satiety, and healthy cholesterol with fiber-rich meals.",
    image_url: highFiberImg,
    credits_per_meal: 7,
    macros: { protein: "20%", carbs: "55%", fat: "25%" },
  },
  {
    id: 6,
    name: "Diabetic",
    tag: "Diabetic",
    category: "specialized",
    description: "Controlled carbohydrates and nutrient-dense foods for glycemic control.",
    image_url: diabeticImg,
    credits_per_meal: 8,
    macros: { protein: "25%", carbs: "40%", fat: "39%" },
  },
];