/* eslint-disable react/function-component-definition */
/* eslint-disable arrow-parens */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

interface DraggableLanguageItemProps {
  language: Language;
  index: number;
  moveLanguage: (dragIndex: number, hoverIndex: number) => void;
  toggleLanguage: (index: number) => void;
}

// Type for drag item
interface DragItem {
  index: number;
  type: string;
}

// Draggable language item component
const DraggableLanguageItem = ({
  language,
  index,
  moveLanguage,
  toggleLanguage,
}: DraggableLanguageItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "LANGUAGE_ITEM",
    item: { index } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "LANGUAGE_ITEM",
    hover: (item: DragItem) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Move the item
      moveLanguage(dragIndex, hoverIndex);

      // Update the item's index for future interactions
      const updatedItem = { ...item, index: hoverIndex };
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <ListItem dense>
        <ListItemIcon>
          <DragIndicatorIcon color="action" />
        </ListItemIcon>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={language.enabled}
            onChange={() => toggleLanguage(index)}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={language.name} />
      </ListItem>
    </div>
  );
};

export default function CardsRenderer() {
  const cards = Object.values(CardsJson) as Card[];

  // State for form values
  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);

  // Language order and selection state
  const [languages, setLanguages] = useState<Language[]>([
    { code: "en", name: "English", enabled: true },
    { code: "it", name: "Italian", enabled: false },
    { code: "fr", name: "French", enabled: false },
    { code: "de", name: "German", enabled: false },
  ]);

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

    // Remove the dragged item
    updatedLanguages.splice(dragIndex, 1);
    // Insert it at the new position
    updatedLanguages.splice(hoverIndex, 0, draggedLanguage);

    setLanguages(updatedLanguages);
  };

  // Generate cards based on selections
  const handleGenerateCards = () => {
    setShowCards(true);
  };

  // Filter and order card languages based on selection
  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];
    const enabledLanguages = languages.filter((lang) => lang.enabled);

    // Use user-defined order from the languages array
    enabledLanguages.forEach((lang) => {
      if (localization[lang.code]) {
        filteredLanguages.push(localization[lang.code]);
      }
    });

    // Default to all languages if none selected
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
