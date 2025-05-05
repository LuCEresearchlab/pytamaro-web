/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
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
import React from "react";
import { Box, Grid, Typography, Container } from "@mui/material";
import FunctionCard from "./function-card";
import { Card } from "./types";
import PyTamaroSymbol from "./PyTamaro-symbol";

const sheet1 = [
  "rectangle",
  "ellipse",
  "circular_sector",
  "triangle",
  "text",
  "empty_graphic",
];

const sheet2 = ["above", "beside", "overlay", "rotate"];

// A4 landscape dimensions in pixels (assuming 96 DPI)
const A4_WIDTH = 1123; // 11.7 inches * 96 DPI
const A4_HEIGHT = 794; // 8.3 inches * 96 DPI

export default function FunctionCardApiSheet({
  cards,
  showIcons,
  selectedLanguages,
}: {
  cards: Card[];
  showIcons: boolean;
  selectedLanguages: string[];
}) {
  const primitivesCards = cards.filter((card) => {
    const functionName = card.localization.en;
    return sheet1.includes(functionName);
  });

  const combinatorsCards = cards.filter((card) => {
    const functionName = card.localization.en;
    return sheet2.includes(functionName);
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
    <Container maxWidth={false}>
      {/* Primitives Section - A4 Landscape Sheet */}
      <Box
        sx={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          border: "1px solid #ddd",
          mb: 4,
          mx: "auto",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          padding: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffcc",
            padding: "1.5em",
            borderRadius: "4px",
            mb: 2,
          }}
        >
          <Typography variant="h6">Library doc</Typography>
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            Primitives · Primitiven · Primitive
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PyTamaroSymbol />
            <Typography variant="h6" sx={{ ml: 1 }}>
              PyTamaro
            </Typography>
          </Box>
        </Box>
        <Grid
          container
          spacing={3}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {primitivesCards.map((card, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
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
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Combinators Section - A4 Landscape Sheet */}
      <Box
        sx={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          border: "1px solid #ddd",
          mx: "auto",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          padding: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffcc",
            padding: "1.5em",
            borderRadius: "4px",
            mb: 2,
          }}
        >
          <Typography variant="h6">Library doc</Typography>
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            Combinators · Kombinatoren · Combinatori
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PyTamaroSymbol />
            <Typography variant="h6" sx={{ ml: 1 }}>
              PyTamaro
            </Typography>
          </Box>
        </Box>
        <Grid
          container
          spacing={3}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {combinatorsCards.map((card, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
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
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
