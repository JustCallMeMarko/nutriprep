import favorite from "@/assets/icons/favorite.svg"
import active_favorite from "@/assets/icons/active_favorite.svg"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";

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
  id?: string | number;
  title: string;
  description: string;
  image_url: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  tags?: string[];
  stocks?: number;
  credits: number;
  isFavorite?: boolean;
};

export function MealCard({
  meal,
  type = 'user',
  onFavoriteChange,
  onClick,
}: {
  meal: Meal;
  type?: 'admin' | 'user';
  onFavoriteChange?: (isFavorite: boolean) => void;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const {makeRequest} = useApi()
  const {
    id,
    title,
    description,
    image_url,
    calories,
    protein,
    carb,
    fat,
    tags = [],
    stocks = 0,
    credits,
    isFavorite,
  } = meal;
  const [isFav, setIsFav] = useState(isFavorite);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (type === 'user' && id !== undefined) {
      navigate(`/user/meal/${id}`);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    if (id === undefined) return;

    try {
      await makeRequest(`fav-meal?meal_id=${encodeURIComponent(id)}`, {
        method: isFav ? 'DELETE' : 'POST',
      });
      const nextIsFavorite = !isFav;
      setIsFav(nextIsFavorite);
      onFavoriteChange?.(nextIsFavorite);
    } catch (error) {
      console.error('Failed to update favorite meal:', error);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex flex-col w-full h-full bg-white border border-[rgba(174,174,178,0.5)] rounded-xl overflow-hidden shadow-xs hover:border-black/30 transition-all ${
        type === 'user' || onClick ? 'cursor-pointer group' : ''
      }`}
    >
      {/* Image Banner */}
      <div className="relative w-full h-36 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Credits Badge */}
        <div className="absolute right-3.5 top-3.5 w-11.25 h-7.5 rounded-full bg-white flex items-center justify-center gap-0.75 shadow-xs">
          <FigmaStar />
          <span className="text-[14px] font-semibold leading-4.25 text-black">
            {credits}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        {tags.length > 0 && (
          <span className="text-xs font-bold leading-3 text-[#306FE6] mb-1">
            {tags[0]}
          </span>
        )}

        <h2 className="text-lg font-bold leading-5 mb-1.5 text-foreground line-clamp-1 group-hover:text-[#306FE6] transition-colors">
          {title}
        </h2>

        <p className="mb-3 text-xs font-medium leading-relaxed opacity-50 line-clamp-2">
          {description}
        </p>

        {/* Macro Badges */}
        <div className="mt-auto flex flex-wrap gap-1.5 mb-3">
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {protein}g Protein
          </span>
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {carb}g Carbs
          </span>
          <span className="flex h-5.75 w-fit px-2 items-center justify-center rounded-[7px] border border-[rgba(174,174,178,0.5)] bg-white text-xs font-bold leading-2.5 opacity-70">
            {fat}g Fat
          </span>
        </div>

        <span className="border-t border-black opacity-20 mb-2.5" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium leading-3 opacity-50">
            {calories}kcal
          </span>
          {type === 'user' ? (
            <span className="flex items-center gap-2">
              <span className="text-xs font-semibold leading-3 opacity-50">
                {stocks} in stock
              </span>
              <img
                src={isFav ? active_favorite : favorite}
                alt="Favorite"
                className="size-6 cursor-pointer hover:scale-110 transition-transform"
                onClick={handleFavoriteClick}
              />
            </span>
          ) : (
            <span className="text-sm font-semibold">
              {stocks} Qty
            </span>
          )}
        </div>
      </div>
    </div>
  );
}