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
  List,
  Paper,
  Typography,
} from "@mui/material";
// import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";
import ValueCard from "./value-card";
import ConstantCard from "./constant-card";
import { Card, Language } from "./types";
import DraggableLanguageItem from "./draggable-language-item";

export default function CardsRenderer() {
  const cards = Object.values(CardsJson) as Card[];

  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    const languageCodes = new Set<string>();

    Object.values(CardsJson).forEach((card) => {
      if (card.localization) {
        Object.keys(card.localization).forEach((code) => {
          languageCodes.add(code);
        });
      }
    });

    const parsedLanguages = Array.from(languageCodes)
      .map((code, index) => ({
        code,
        name: code.toUpperCase(),
        enabled: index === 0,
      }))
      .slice(0, 4);

    setLanguages(parsedLanguages);
  }, []);

  // Toggle language selection
  const toggleLanguage = (index: number) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index].enabled = !updatedLanguages[index].enabled;
    setLanguages(updatedLanguages);
  };

  // Move language (for drag and drop)
  const moveLanguage = (dragIndex: number, hoverIndex: number) => {
    const updatedLanguages = [...languages];
    const draggedLanguage = updatedLanguages[dragIndex];

    updatedLanguages.splice(dragIndex, 1);
    updatedLanguages.splice(hoverIndex, 0, draggedLanguage);
    setLanguages(updatedLanguages);
  };

  // Generate cards based on selections
  const handleGenerateCards = () => {
    setShowCards(true);
  };

  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];
    const enabledLanguages = languages.filter((lang) => lang.enabled);

    enabledLanguages.forEach((lang) => {
      if (localization[lang.code]) {
        filteredLanguages.push(localization[lang.code]);
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
        <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Card Preferences
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select and Order Languages:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Check the languages you want to include and drag them to change
              their order
            </Typography>

            <DndProvider backend={HTML5Backend}>
              <List
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid #eee",
                  borderRadius: 1,
                }}
              >
                {languages.map((language, index) => (
                  <DraggableLanguageItem
                    key={language.code}
                    language={language}
                    index={index}
                    moveLanguage={moveLanguage}
                    toggleLanguage={toggleLanguage}
                  />
                ))}
              </List>
            </DndProvider>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={showIcons}
                  onChange={() => setShowIcons(!showIcons)}
                />
              }
              label="Show Parameter/Return Icons"
            />
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
