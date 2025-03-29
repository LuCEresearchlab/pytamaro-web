import { Dictionary } from 'lodash';

export type Concept = {
  title: string;
  category: string;
  description: string;
};

export const knownConcepts: Dictionary<Concept> = {
  basic_comp: {
    // All the primitive shapes and the basic composition
    // operations (beside, above, overlay), and rotate (when the pinning position
    // is irrelevant)
    title: 'Basic Composition',
    category: 'graphics',
    description: 'Using shapes and composing them in an elementary way',
  },
  pin: {
    // Pin + Compose
    title: 'Pin',
    category: 'graphics',
    description: 'Using pinning positions to compose shapes',
  },
  gap: {
    // Transparent 0-width/height shapes to separate graphics
    title: 'Gap',
    category: 'graphics',
    description: 'Using gaps to separate graphics',
  },
  color_model: {
    // Meaningfully engage with color models (RGB/HSV/HSL).
    // Not for activities that simply provide constants for colors.
    title: 'Color Model',
    category: 'graphics',
    description: 'Producing colors using a color model (RGB/HSV/HSL)',
  },
  fun_def: {
    title: 'Function Definition',
    category: 'programming',
    description: 'Defining functions',
  },
  list: {
    title: 'List',
    category: 'programming',
    description: 'Using lists',
  },
  cond: {
    title: 'Conditional',
    category: 'programming',
    description:
      'Using conditional computation (if/else statement or expression)',
  },
  loop: {
    title: 'Loop',
    category: 'programming',
    description: 'Using loops (for/while) to repeat computation',
  },
  comprehension: {
    title: 'Comprehension',
    category: 'programming',
    description: 'Using comprehensions to repeat computation',
  },
  recursion: {
    title: 'Recursion',
    category: 'programming',
    description: 'Using recursive computation',
  },
  dict: {
    title: 'Dictionary',
    category: 'programming',
    description: 'Using dictionaries',
  },
  set: {
    title: 'Set',
    category: 'programming',
    description: 'Using sets',
  },
  tuple: {
    title: 'Tuple',
    category: 'programming',
    description: 'Using tuples',
  },
  dataclass: {
    title: 'Data Class',
    category: 'programming',
    description: 'Using data classes',
  },
  hof: {
    title: 'Higher-Order Function',
    category: 'programming',
    description: 'Using higher order functions',
  },
  toolbox: {
    title: 'Toolbox',
    category: 'programming',
    description: 'Reusing code with the toolbox module',
  },
};
