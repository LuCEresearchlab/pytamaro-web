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
import { Card, Language } from "./types";
import FunctionCardSheet from "./function_card_sheet";
import LanguagePickerCard from "./language-picker-card";
import FunctionCardApiSheet from "./function_card_api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import fs from "fs";
import path from "path";

export default function CardsRenderer({
  cards,
  availableLanguages,
}: {
  cards: Card[];
  availableLanguages: string[];
}) {
  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Debug cards data in browser console
  useEffect(() => {
    console.log("Cards data:", cards);
  }, [cards]);

  useEffect(() => {
    // Convert available languages from getStaticProps to Language objects
    const parsedLanguages = availableLanguages.map((code) => ({
      code,
      name: code.toUpperCase(),
      enabled: false,
    }));

    setLanguages(parsedLanguages);

    if (parsedLanguages.length > 0) {
      setSelectedLanguages([parsedLanguages[0].code]);
    }
  }, [availableLanguages]);

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

export async function getStaticProps() {
  // Get all language folders from public/locales
  const localesPath = path.join(process.cwd(), "public/locales");
  // Get SVG folders from public/function_svgs
  const svgsPath = path.join(process.cwd(), "public/function_svgs");
  const availableLanguages: string[] = [];
  const cards: Card[] = [];

  try {
    // 1. Find all language folders with tamarocards.json
    const languageFolders = fs.readdirSync(localesPath);
    const languageTranslations: Record<string, Record<string, string>> = {};

    // Load all translations from each language
    languageFolders.forEach((folder) => {
      const tamarocardsPath = path.join(
        localesPath,
        folder,
        "tamarocards.json"
      );
      if (fs.existsSync(tamarocardsPath)) {
        availableLanguages.push(folder);
        const translationContent = fs.readFileSync(tamarocardsPath, "utf8");
        try {
          languageTranslations[folder] = JSON.parse(translationContent);
        } catch (e) {
          console.error(`Error parsing JSON for ${folder}:`, e);
        }
      }
    });

    // 2. Get all function folders from function_svgs directory
    if (fs.existsSync(svgsPath)) {
      const functionFolders = fs.readdirSync(svgsPath);
      console.log(`Found ${functionFolders.length} function folders`);

      // Process each function folder
      functionFolders.forEach((functionName) => {
        const functionPath = path.join(svgsPath, functionName);

        // Skip if not a directory
        if (!fs.statSync(functionPath).isDirectory()) return;

        // Build card localization based on translations
        const localization: Record<string, string> = { en: functionName };

        // Add translations for each available language
        availableLanguages.forEach((lang) => {
          if (
            lang !== "en" &&
            languageTranslations[lang] &&
            languageTranslations[lang][functionName]
          ) {
            localization[lang] = languageTranslations[lang][functionName];
          }
        });

        // Find icon SVGs
        const svgFiles = fs.readdirSync(functionPath);

        // Main function icon - now looking for function_icon.svg
        const iconFile = svgFiles.find((f) => f === `${functionName}_icon.svg`);
        const icon = iconFile
          ? `/function_svgs/${functionName}/${iconFile}`
          : "";

        // Return icon - now looking for any file with _out.svg
        const returnIconFile = svgFiles.find((f) => f.includes("_out.svg"));
        const returnIcon = returnIconFile
          ? `/function_svgs/${functionName}/${returnIconFile}`
          : "";

        // Parameter icons - now looking for files with _in_N.svg
        const parameterFiles = svgFiles
          .filter((f) => f.includes("_in_"))
          .sort((a, b) => {
            // Sort by parameter number
            const numA = parseInt(a.match(/_in_(\d+)\.svg/)?.[1] || "0", 10);
            const numB = parseInt(b.match(/_in_(\d+)\.svg/)?.[1] || "0", 10);
            return numA - numB;
          });

        const parameterIcons = parameterFiles.map(
          (file) => `/function_svgs/${functionName}/${file}`
        );

        // Create card object
        cards.push({
          localization,
          icon,
          returnIcon,
          parametersIcon: parameterIcons,
        });
      });

      console.log(`Successfully processed ${cards.length} cards`);
    } else {
      console.error("SVG path does not exist:", svgsPath);
    }
  } catch (error) {
    console.error("Error processing card data:", error);
  }

  return {
    props: {
      cards,
      availableLanguages,
      ...(await serverSideTranslations(
        "en",
        ["tamarocards"],
        null,
        availableLanguages
      )),
    },
  };
}
