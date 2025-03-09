/* eslint-disable @typescript-eslint/quotes */
import { useEffect, useState } from "react";
import CardsJson from "../public/docs/pytamaro.json";

function RectangleFunctionSvg() {
  return (
    <svg
      width="90"
      height="70"
      viewBox="0 0 41 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ alignSelf: "left" }}
    >
      <rect x="7" y="7" width="34" height="21" fill="#55CC75" />
      <path
        d="M7 3L12 5.88675V0.113249L7 3ZM41 3L36 0.113249V5.88675L41 3ZM11.5 3.5L36.5 3.5V2.5L11.5 2.5V3.5Z"
        fill="black"
      />
      <path
        d="M3 28L5.88675 23L0.113249 23L3 28ZM3 7L0.113249 12L5.88675 12L3 7ZM3.5 23.5L3.5 11.5L2.5 11.5L2.5 23.5L3.5 23.5Z"
        fill="black"
      />
    </svg>
  );
}

function PyTamaroSymbol() {
  return (
    <svg
      width="40"
      height="20"
      viewBox="0 0 121 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginTop: "5px" }}
    >
      <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#7F99EF" />
      <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#7F99EF" />
      <path d="M23 65L3.08141 30.5L42.9186 30.5L23 65Z" fill="#6589FF" />
      <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#7F99EF" />
      <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#7F99EF" />
      <path d="M98 65L78.0814 30.5L117.919 30.5L98 65Z" fill="#6589FF" />
      <path d="M60.5 0L98.1721 65.25H22.8279L60.5 0Z" fill="#F84545" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      width="46"
      height="35"
      viewBox="0 0 26 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26 3L21 0.113249V5.88675L26 3ZM0 3.5L21.5 3.5V2.5L0 2.5L0 3.5Z"
        fill="black"
      />
    </svg>
  );
}

interface BasicCardProps {
  name: string;
  type: string; // For now just "Function"
  params: { name: string; type: string }[];
  url: string;
  returnValue: { type: string; description: string };
}

function BasicCard({ name, type, params, url, returnValue }: BasicCardProps) {
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
          {/* Rectangle svg at the bottom of the card */}
          <RectangleFunctionSvg />
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

interface Card {
  section: string;
  kind: string;
  name: string;
  description: { p: string[]; figure: { url: string; caption: string } };
  parameters: { name: string; type: string; description: string }[];
  returnValue: { type: string; description: string };
  examples: { code: string; usesOptional?: boolean; stdout: string }[];
}

export default function Giovanni() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    setCards(CardsJson.elements.filter((c) => c.kind === "function") as Card[]);
    console.log(CardsJson.elements);
  }, []);
  return (
    <div>
      {cards.map((card, index) => (
        <div key={index}>
          <BasicCard
            name={card.name}
            type={card.kind}
            params={card.parameters}
            url={
              card.description.figure?.url ? card.description.figure.url : ""
            }
            returnValue={card.returnValue}
          />
        </div>
      ))}
    </div>
  );
}
