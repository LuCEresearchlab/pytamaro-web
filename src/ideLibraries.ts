export type Library = {
  id: string;
  name: string;
  alwaysInstalled?: boolean;
};

const libraries: readonly Library[] = [
  {
    id: 'pytamaro',
    name: 'PyTamaro',
    alwaysInstalled: true,
  },
  {
    id: 'toolbox',
    name: 'PyTamaro Web Toolbox',
    alwaysInstalled: true,
  },
  {
    id: 'numpy',
    name: 'NumPy',
  },
  {
    id: 'pandas',
    name: 'Pandas',
  },
  {
    id: 'scipy',
    name: 'SciPy',
  },
  {
    id: 'sympy',
    name: 'SymPy',
  },
  {
    id: 'pytest',
    name: 'Pytest',
  },
];

export const OPTIONAL_IDE_LIBRARIES = libraries.filter(
  (library) => library.alwaysInstalled !== true,
);

export const PREINSTALLED_IDE_LIBRARIES = libraries.filter(
  (library) => library.alwaysInstalled === true,
);

export function isOptionalIdeLibrary(libraryId: string): boolean {
  return OPTIONAL_IDE_LIBRARIES.some((library) => library.id === libraryId);
}
