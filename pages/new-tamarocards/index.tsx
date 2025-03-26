/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";

interface Card {
  localization: { [lang: string]: string };
  icon: string;
  parametersIcon?: string[];
  returnIcon?: string;
}

export default function CardsRender() {
  const cards = Object.values(CardsJson) as Card[];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      {cards.map((card, index) => (
        <div key={index}>
          <FunctionCard
            type="function"
            params={
              Array.isArray(card.parametersIcon)
                ? card.parametersIcon.map((icon: string, i: number) => ({
                    name: `Param ${i + 1}`,
                    type: "Icon",
                  }))
                : []
            }
            svg={card.icon}
            returnValue={{
              type: "Icon",
              description: card.returnIcon || "",
            }}
            languages={Object.values(card.localization)}
          />
        </div>
      ))}
    </div>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
