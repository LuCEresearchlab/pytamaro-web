/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useState } from "react";
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";
import ValueCard from "./value-card";
import ConstantCard from "./constant-card";

interface Card {
  localization: { [lang: string]: string };
  icon: string;
  parametersIcon?: string[];
  returnIcon?: string;
}

export default function CardsRender() {
  const cards = Object.values(CardsJson) as Card[];
  const [showIcons, setShowIcons] = useState(true);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
          padding: "10px",
        }}
      >
        <label
          htmlFor="show-icons-checkbox"
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <input
            id="show-icons-checkbox"
            type="checkbox"
            checked={showIcons}
            onChange={() => setShowIcons(!showIcons)}
            style={{ marginRight: "8px", width: "18px", height: "18px" }}
          />
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            Show Parameter/Return Icons
          </span>
        </label>
      </div>

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
              parameterIcons={showIcons ? card.parametersIcon : undefined}
              returnIcon={showIcons ? card.returnIcon : ""}
              showIcons={showIcons}
            />
          </div>
        ))}
      </div>
      <ValueCard value={250} />
      <ValueCard value={50} />
      <ValueCard value={0} />
      <ConstantCard />
    </>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
