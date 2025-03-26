/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useEffect, useState } from "react";
import CardsJson from "./pytamaro-data.json";
import Arrow from "./arrow";
import PyTamaroSymbol from "./PyTamaro-symbol";

interface BasicCardProps {
  name: string;
  type: string; // For now just "Function"
  params: { name: string; type: string }[];
  svg: string;
  returnValue: { type: string; description: string };
}

function RenderSvg({ svg }: { svg: string }) {
  const [clientSvg, setClientSvg] = useState<string | null>(null);

  useEffect(() => {
    setClientSvg(svg);
  }, [svg]);

  if (!clientSvg) return null;

  return <div dangerouslySetInnerHTML={{ __html: clientSvg }} />;
}

function BasicCard({ name, type, params, svg, returnValue }: BasicCardProps) {
  // const langs = ["rectangle", "rechteck", "rettangolo"];
  const totalHeight = "300px";
  const totalWidth = "150px";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "right",
            justifyContent: "space-evenly",
          }}
        >
          {/* arrows to the left of the card */}
          {Array.from({ length: params?.length }).map((_, index) => (
            <Arrow key={index} />
          ))}
        </div>
        <div
          style={{
            width: totalWidth,
            height: totalHeight,
            border: "5px solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* PyTamaro svg symbol */}
          <PyTamaroSymbol />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
              height: "50%",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            {/* Maps list of languages to card */}
            <p style={{ fontWeight: "bold", margin: "2px 0" }}>{name}</p>
            {/* commented for now since we still dont have languages
             {langs.map((lang, index) => (
              <p
          key={index}
          style={{
            fontWeight: index === 0 ? "bold" : "normal",
            margin: "2px 0",
          }}
              >
          {lang}
              </p>
            ))} */}
          </div>
          <RenderSvg svg={svg} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Output arrows to the right of the card */}
          {Array.from({ length: returnValue ? 1 : 0 }).map((_, index) => (
            <Arrow key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
// Luca's comments:
// - Use the types already defined (e.g., JudiciousFunction), instead of defining new ones
// - useEffect/useState seems not necessary here

interface Card {
  localization: { [lang: string]: string };
  icon: string;
  parametersIcon?: string[];
  returnIcon?: string;
}

export default function Giovanni() {
  const cards = Object.values(CardsJson) as Card[];

  return (
    <div>
      {cards.map((card, index) => (
        <div key={index}>
          <BasicCard
            name={card.localization.en}
            type="Function"
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
          />
        </div>
      ))}
    </div>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
