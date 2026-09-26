import favorite from "@/assets/icons/favorite.svg"
import active_favorite from "@/assets/icons/active_favorite.svg"
import { useState } from "react";

function FigmaStar() {
  return (
    <svg
      width="11"
      height="12"
      viewBox="0 0 11 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 0L6.9855 4.37946L11 6L6.9855 7.62054L5.5 12L4.0145 7.62054L0 6L4.0145 4.37946L5.5 0Z"
        fill="black"
      />
    </svg>
  );
}

type Meal = {
  title: string;
  description: string;
  image_url: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tags?: string[];
  credits: number;
  isFavorite: boolean;
};

export function MealCard({ meal }: { meal: Meal }) {
  const {
    title,
    description,
    image_url,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    tags = [],
    credits,
    isFavorite,
  } = meal;
  const [isFav, setIsFav] = useState(isFavorite);

  return (
    <div className="relative w-full h-77 bg-white border border-[rgba(174,174,178,0.5)] rounded-xl">
      <div
        className="absolute left-0 top-0 w-full h-36 rounded-t-xl overflow-hidden"
      >
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
      </div>

      <div className="absolute right-3.5 top-3.5 w-11.25 h-7.5 rounded-full bg-white flex items-center justify-center gap-0.75">
        <FigmaStar />

        <span className="text-[14px] font-semibold leading-4.25">
          {credits}
        </span>
      </div>

      <div className="absolute px-4.75 left-0 top-38 w-full flex flex-col">
        {tags.length > 0 && (
          <span className="text-xs font-bold leading-3 text-[#306FE6] mb-1">
            {tags[0]}
          </span>
        )}

        <h2 className="text-lg font-bold leading-4 mb-2">
          {title}
        </h2>

        <p className="mb-4 line-clamp-2 text-xs font-medium leading-3 opacity-50">
          {description}
        </p>

        <div className="flex gap-1.5 mb-2">
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {protein_g}g Protein
          </span>
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {carbs_g}g Carbs
          </span>
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {fat_g}g Fat
          </span>
        </div>

        <span className="border-t border-black opacity-20 mb-2" />

        <div className=" flex items-center justify-between">
          <span className="text-xs font-medium leading-3 opacity-50">
            {calories}kcal
          </span>
          <img src={isFav ? active_favorite : favorite} alt="Favorite" className="size-6 cursor-pointer" onClick={() => setIsFav(!isFav)} />
        </div>
      </div>
    </div>
  );
}