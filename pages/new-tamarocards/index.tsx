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

    // Create language objects from codes
    const parsedLanguages = Array.from(languageCodes).map((code) => ({
      code,
      name: code.toUpperCase(),
      enabled: false, // No longer using enabled flag
    }));

    setLanguages(parsedLanguages);

    // Set first language as selected by default
    if (parsedLanguages.length > 0) {
      setSelectedLanguages([parsedLanguages[0].code]);
    }
  }, []);

  // Handle language selection for a specific dropdown index
  const handleLanguageSelect = (index: number, languageCode: string | null) => {
    const updatedSelectedLanguages = [...selectedLanguages];

    // If clearing a selection
    if (!languageCode) {
      // If trying to clear the only selection, don't allow it
      if (
        updatedSelectedLanguages.length === 1 &&
        updatedSelectedLanguages[0] === updatedSelectedLanguages[index]
      ) {
        return;
      }

      // Remove the language from the array
      if (index < updatedSelectedLanguages.length) {
        updatedSelectedLanguages.splice(index, 1);
      }
    }
    // Add or update language at the specified index
    if (index < updatedSelectedLanguages.length) {
      updatedSelectedLanguages[index] = languageCode ?? "";
    } else {
      // Fill any gaps with empty strings
      while (updatedSelectedLanguages.length < index) {
        updatedSelectedLanguages.push("");
      }
      if (languageCode !== null) {
        updatedSelectedLanguages.push(languageCode);
      }
    }

    // Remove any empty strings (except where needed to maintain indices)
    const cleanedSelections = updatedSelectedLanguages.filter(
      (lang, i) => lang !== "" || i < updatedSelectedLanguages.length - 1
    );

    setSelectedLanguages(cleanedSelections);
  };

  // Generate cards based on selections
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
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {cards.map((card, index) => (
              <div key={index}>
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
              </div>
            ))}
          </Box>
          <ValueCard value={250} />
          <ValueCard value={50} />
          <ValueCard value={0} />
          <ConstantCard />
        </>
      )}
    </Container>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
