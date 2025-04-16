/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable react/function-component-definition */
/* eslint-disable arrow-parens */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";
import ValueCard from "./value-card";
import ConstantCard from "./constant-card";
import { Card, Language } from "./types";
import LanguagePickerCard from "./language-picker-card";

export default function CardsRenderer() {
  const cards = Object.values(CardsJson) as Card[];

  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    const languageCodes = new Set<string>();

    Object.values(CardsJson).forEach((card) => {
      if (card.localization) {
        Object.keys(card.localization).forEach((code) => {
          languageCodes.add(code);
        });
      }
    });

    const parsedLanguages = Array.from(languageCodes).map((code) => ({
      code,
      name: code.toUpperCase(),
      enabled: false, // No longer using enabled flag
    }));

    setLanguages(parsedLanguages);

    if (parsedLanguages.length > 0) {
      setSelectedLanguages([parsedLanguages[0].code]);
    }
  }, []);

  const handleLanguageSelect = (index: number, languageCode: string | null) => {
    const updatedSelectedLanguages = [...selectedLanguages];

    if (!languageCode) {
      if (
        updatedSelectedLanguages.length === 1 &&
        updatedSelectedLanguages[0] === updatedSelectedLanguages[index]
      ) {
        return;
      }

      if (index < updatedSelectedLanguages.length) {
        updatedSelectedLanguages.splice(index, 1);
      }
    }
    if (index < updatedSelectedLanguages.length) {
      updatedSelectedLanguages[index] = languageCode ?? "";
    } else {
      while (updatedSelectedLanguages.length < index) {
        updatedSelectedLanguages.push("");
      }
      if (languageCode !== null) {
        updatedSelectedLanguages.push(languageCode);
      }
    }

    const cleanedSelections = updatedSelectedLanguages.filter(
      (lang, i) => lang !== "" || i < updatedSelectedLanguages.length - 1
    );

    setSelectedLanguages(cleanedSelections);
  };

  const handleGenerateCards = () => {
    setShowCards(true);
  };

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        PyTamaro Card Generator
      </Typography>

      {!showCards ? (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Card Preferences
          </Typography>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LanguagePickerCard
              languages={languages}
              selectedLanguages={selectedLanguages}
              onLanguageSelect={handleLanguageSelect}
            />
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showIcons}
                  onChange={() => setShowIcons(!showIcons)}
                />
              }
              label="Show Parameter/Return Icons"
            />
          </FormControl>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGenerateCards}
              disabled={selectedLanguages.length === 0}
            >
              Generate Cards
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Button variant="outlined" onClick={() => setShowCards(false)}>
              Back to Settings
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 0,
              justifyItems: "center",
              alignItems: "stretch",
              width: "auto",
              mb: 4,
            }}
          >
            {cards
              .slice()
              .sort((a, b) => {
                // Sort logic: cards without icons first, then cards with icons
                const aHasIcons =
                  a.parametersIcon?.some(
                    (icon) => icon && icon.trim() !== ""
                  ) ||
                  (a.returnIcon && a.returnIcon.trim() !== "");
                const bHasIcons =
                  b.parametersIcon?.some(
                    (icon) => icon && icon.trim() !== ""
                  ) ||
                  (b.returnIcon && b.returnIcon.trim() !== "");

                if (!aHasIcons && bHasIcons) return -1;
                if (aHasIcons && !bHasIcons) return 1;
                return 0;
              })
              .map((card, index) => (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    border: "2px solid #444444",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <FunctionCard
                    params={
                      Array.isArray(card.parametersIcon)
                        ? card.parametersIcon.map(
                            (icon: string, i: number) => ({
                              name: `Param ${i + 1}`,
                              type: "Icon",
                            })
                          )
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
                </div>
              ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(16em, 1fr))",
              justifyItems: "center",
            }}
          >
            <ValueCard value={250} />
            <ValueCard value={50} />
            <ValueCard value={0} />
            <ConstantCard />
          </Box>
        </>
      )}
    </Container>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
