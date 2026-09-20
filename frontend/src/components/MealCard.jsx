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

export function MealCard({ meal, quantity = 4, onAddFavorite }) {
  const {
    title,
    description,
    image_url,
    calories,
    protein_g,
    carbs_g,
    carbs_fiber_g,
    fat_g,
    tags = [],
  } = meal;

  return (
    <div className="relative w-[262px] h-[280px] bg-white border border-[rgba(174,174,178,0.5)] rounded-xl box-border">
      {/* Image */}
      <div
        className="absolute left-0 top-0 w-[260px] h-[117px] rounded-t-xl overflow-hidden"
        style={{ backgroundColor: "#FFBEBE" }}
      >
        {image_url && (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/*credits*/}
      <div className="absolute right-[14px] top-[14px] w-[45px] h-[30px] rounded-full bg-white flex items-center justify-center gap-[3px]">
        <FigmaStar />

        <span
          style={{
            fontFamily: "Montserrat",
            fontWeight: 800,
            fontSize: "14px",
            lineHeight: "17px",
            color: "#000",
          }}
        >
          {quantity}
        </span>
      </div>

      {/* Tag */}
      {tags.length > 0 && (
        <div
          className="absolute left-[19px] top-[133px]"
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: "10px",
            lineHeight: "12px",
            color: "#306FE6",
          }}
        >
          {tags[0]}
        </div>
      )}

      {/* Title */}
      <div
        className="absolute left-[19px] top-[150px] w-[224px]"
        style={{
          fontFamily: "Montserrat",
          fontWeight: 700,
          fontSize: "13px",
          lineHeight: "16px",
          color: "#000",
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        className="absolute left-[19px] top-[173px] w-[224px]"
        style={{
          fontFamily: "Montserrat",
          fontWeight: 500,
          fontSize: "10px",
          lineHeight: "12px",
          color: "#000",
          opacity: 0.5,
        }}
      >
        {description}
      </div>

      {/* Macro pills */}
      <div className="absolute left-[12px] top-[207px] w-[64px] h-[23px] bg-white border border-[rgba(174,174,178,0.5)] rounded-[7px] flex items-center justify-center">
        <span
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: "8px",
            lineHeight: "10px",
            color: "#000",
            opacity: 0.7,
          }}
        >
          {protein_g}g Protein
        </span>
      </div>

      <div className="absolute left-[82px] top-[207px] w-[100px] h-[23px] bg-white border border-[rgba(174,174,178,0.5)] rounded-[7px] flex items-center justify-center">
        <span
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: "8px",
            lineHeight: "10px",
            color: "#000",
            opacity: 0.7,
          }}
        >
          {carbs_g}g Carbs
          {carbs_fiber_g != null ? ` (${carbs_fiber_g}g Fiber)` : ""}
        </span>
      </div>

      <div className="absolute left-[188px] top-[207px] w-[49px] h-[23px] bg-white border border-[rgba(174,174,178,0.5)] rounded-[7px] flex items-center justify-center">
        <span
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: "8px",
            lineHeight: "10px",
            color: "#000",
            opacity: 0.7,
          }}
        >
          {fat_g}g Fat
        </span>
      </div>

      {/* Separator line */}
      <div
        className="absolute left-[1px] top-[234px] w-[260px] border-t border-black"
        style={{ opacity: 0.2 }}
      />

      {/* Kcals */}
      <div
        className="absolute left-[12px] top-[251px]"
        style={{
          fontFamily: "Montserrat",
          fontWeight: 500,
          fontSize: "10px",
          lineHeight: "12px",
          color: "#000",
          opacity: 0.5,
        }}
      >
        {calories}kcal
      </div>

      {/* Add to cart button */}
      <button
        type="button"
        onClick={() => onAddFavorite?.(meal)}
        className="absolute left-[177px] top-[243px] w-[72px] h-[26px] rounded-[5px] flex items-center justify-center"
        style={{ backgroundColor: "#306FE6" }}
      >
        <span
          style={{
            fontFamily: "Montserrat",
            fontWeight: 700,
            fontSize: "9px",
            lineHeight: "11px",
            color: "#FFFFFF",
          }}
        >
          Add to cart
        </span>
      </button>
    </div>
  );
}