/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable no-plusplus */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable new-cap */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { Box, Grid } from "@mui/material";
import FunctionCard from "./function-card";
import { Card } from "./types";

export default function FunctionCardSheet({
  cards,
  showIcons,
  selectedLanguages,
  cardGridRef,
}: {
  cards: Card[];
  showIcons: boolean;
  selectedLanguages: string[];
  cardGridRef: React.RefObject<HTMLDivElement>;
}) {
  const sortedCards = [...cards].sort((a, b) => {
    const aHasIcons =
      a.parametersIcon?.some((icon) => icon && icon.trim() !== "") ||
      (a.returnIcon && a.returnIcon.trim() !== "");
    const bHasIcons =
      b.parametersIcon?.some((icon) => icon && icon.trim() !== "") ||
      (b.returnIcon && b.returnIcon.trim() !== "");

    if (!aHasIcons && bHasIcons) return -1;
    if (aHasIcons && !bHasIcons) return 1;
    return 0;
  });

  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];

    selectedLanguages.forEach((languageCode) => {
      if (languageCode && localization[languageCode]) {
        filteredLanguages.push(localization[languageCode]);
      }
    });

    if (filteredLanguages.length === 0) {
      return Object.values(localization);
    }

    return filteredLanguages;
  };

  return (
    <Box
      ref={cardGridRef}
      sx={{
        width: "100%",
        maxWidth: showIcons ? "1800px" : "1600px",
        backgroundColor: "#ffffff",
        padding: "8px", // Reduced outer padding
        mx: "auto",
        boxSizing: "border-box",
        position: "relative",
        display: "block",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Grid container spacing={0}>
        {sortedCards.map((card, index) => (
          <Grid item xs={12 / 5} key={`func-${index}`}>
            <Box
              sx={{
                border: "1px dotted #666",
                borderRadius: "0px",
                padding: "4px",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                m: 0,
              }}
            >
              <FunctionCard
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
                languages={filterCardLanguages(card.localization)}
                parameterIcons={showIcons ? card.parametersIcon : undefined}
                returnIcon={showIcons ? card.returnIcon : ""}
                showIcons={showIcons}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
