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
import { Card, Language } from "./types";
import FunctionCardSheet from "./function_card_sheet";
import LanguagePickerCard from "./language-picker-card";
import FunctionCardApiSheet from "./function_card_api";

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

  return (
    <Container maxWidth={showCards ? false : "lg"} sx={{ py: 4 }}>
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
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 4 }}>
            <Button variant="outlined" onClick={() => setShowCards(false)}>
              Back to Settings
            </Button>
          </Box>

          {showIcons ? (
            <FunctionCardApiSheet
              cards={cards}
              showIcons={showIcons}
              selectedLanguages={selectedLanguages}
            />
          ) : (
            <FunctionCardSheet
              cards={cards}
              showIcons={showIcons}
              selectedLanguages={selectedLanguages}
            />
          )}
        </>
      )}
    </Container>
  );
}
