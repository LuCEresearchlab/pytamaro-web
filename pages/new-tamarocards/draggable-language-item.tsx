/* eslint-disable react/function-component-definition */
/* eslint-disable arrow-parens */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useRef } from "react";
import { ListItem, ListItemIcon, Checkbox, ListItemText } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { Language } from "./types";

interface DraggableLanguageItemProps {
  language: Language;
  index: number;
  moveLanguage: (dragIndex: number, hoverIndex: number) => void;
  toggleLanguage: (index: number) => void;
  languages: Language[];
}

// Type for drag item
interface DragItem {
  index: number;
  type: string;
}

// Draggable language item component
export default function DraggableLanguageItem({
  language,
  index,
  moveLanguage,
  toggleLanguage,
  languages,
}: DraggableLanguageItemProps) {
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
    },
  });

  drag(drop(ref));

  // Determine if checkbox should be disabled
  const disableCheckbox =
    !language.enabled && languages.filter((l) => l.enabled).length >= 4;

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
          <Checkbox
            edge="start"
            checked={language.enabled}
            onChange={() => toggleLanguage(index)}
            tabIndex={-1}
            disableRipple
            disabled={disableCheckbox}
          />
        </ListItemIcon>
        <ListItemText
          primary={language.name}
          secondary={disableCheckbox ? "Max 4 languages" : ""}
        />
      </ListItem>
    </div>
  );
}
