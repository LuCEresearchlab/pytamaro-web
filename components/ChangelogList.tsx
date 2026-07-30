import {
  Avatar,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import { printableGraphicActivityVariant } from '../src/specialActivities';
import {
  activityVariantPathname,
  activityVariantPathnameFromParts,
  documentationElementPathname,
  playgroundPathname,
} from '../src/urlUtils';
import GenericMuiIcon from './GenericMuiIcon';

// Chronological order, form oldest to newest.
// The oldest (i.e., the first) has index 0.
export const changelogEntries = [
  {
    date: '2023-11-17',
    icon: 'FontDownload',
    title: 'More fonts available',
    desc: (
      <span>
        You can now pick a font for the text in your graphics from a broader
        set! <Link href='/install'>Read here the full list</Link> of available
        fonts.
      </span>
    ),
  },
  {
    date: '2023-11-20',
    icon: 'Code',
    title: 'New version of PyTamaro',
    desc: 'PyTamaro 0.6.0 includes a full French translation and better string representation for graphics.',
  },
  {
    date: '2023-11-20',
    icon: 'Translate',
    title: 'We speak multiple languages',
    desc: 'You can now use this web platform in English, Italian, or German. You can change the preferred language using the button in the top right corner.',
  },
  {
    date: '2024-01-24',
    icon: 'OpenInFull',
    title: 'Full-screen mode for code editor',
    desc: 'The code editor has a new option inside the menu to toggle the full-screen mode, giving you more width for your code',
  },
  {
    date: '2024-02-03',
    icon: 'Construction',
    title: 'Toolbox improvements',
    desc: 'The experience of using the toolbox has been improved with pagination to prevent the sidebar from growing too much and a new search filter in the dedicated page.',
  },
  {
    date: '2024-02-17',
    icon: 'Error',
    title: 'Better integration with Python error messages',
    desc: 'Python error messages are now shown directly inside the code editor. We upgraded to the latest Python 3.12, showing the error message in bold and collapsing by default the stack frames from system libraries.',
  },
  {
    date: '2024-05-13',
    icon: 'Assignment',
    title: 'Learner-friendly message for code with ellipsis',
    desc: (
      <span>
        The platform shows a learner-friendly message as a tip when the code
        still has <code>...</code>, indicating parts that still have to be
        implemented.
      </span>
    ),
  },
  {
    date: '2024-05-23',
    icon: 'Category',
    title: 'Searching activities by concepts',
    desc: 'The platform now supports tagging activities with concepts. You can search for activities that teach a specific concept, or filter out activities that teach a concept you want to exclude.',
  },
  {
    date: '2024-07-12',
    icon: 'Printer',
    title: 'Print ready-to-cut pieces from your own graphic',
    desc: (
      <span>
        A new{' '}
        <Link href={activityVariantPathname(printableGraphicActivityVariant)}>
          automatic system
        </Link>{' '}
        creates ready-to-cut pieces from any PyTamaro graphic. Teachers can
        quickly print them and have students compose the graphic starting from
        atomic shapes!
      </span>
    ),
  },
  {
    date: '2024-09-04',
    icon: 'MenuBook',
    title: 'Judicious: a new documentation system',
    desc: (
      <span>
        The documentation is now powered by{' '}
        <Link href='https://chiodini.org/publications/splashe24-judicious.pdf'>
          Judicious
        </Link>
        , a new system which gradually presents information and offers a
        diagrammatic representation for functions and constants. Enjoy a uniform
        documentation for PyTamaro, the toolbox, and even part of the Python
        standard library.
      </span>
    ),
  },
  {
    date: '2024-09-05',
    icon: 'Schema',
    title: 'Tamaro Cards: Version 2',
    desc: (
      <span>
        New and improved <Link href='/tamarocards'>TamaroCards</Link> for a
        tangible, unplugged way to compose programs. Better documentation,
        slightly improved cards, including a few new ones, and downloads of card
        documentation pictures for your course material.
      </span>
    ),
  },
  {
    date: '2024-11-25',
    icon: 'LibraryBooks',
    title: 'Examples in the documentation',
    desc: (
      <span>
        The documentation now includes examples both for PyTamaro and the Python
        standard library. Check out the examples for{' '}
        <Link href={documentationElementPathname('pytamaro', 'triangle')}>
          <code>triangle</code>
        </Link>{' '}
        and{' '}
        <Link href={documentationElementPathname('builtins', 'print')}>
          <code>print</code>
        </Link>
        !
      </span>
    ),
  },
  {
    date: '2025-04-13',
    icon: 'NearbyError',
    title: 'Detection of errors in previous code cells',
    desc: 'For activities with multiple code cells, the platform now detects errors in previous cells and shows a warning in the current cell. This helps to find the right cell to fix!',
    silent: true,
  },
  {
    date: '2025-06-09',
    icon: 'Share',
    title: 'Shareable Playground Links',
    desc: (
      <span>
        You can now share code in the Playground simply by copying the URL,
        which automatically contains your code.{' '}
        <Link href={playgroundPathname("print('Shared!')")}>
          Try this link!
        </Link>
      </span>
    ),
    silent: true,
  },
  {
    date: '2025-09-24',
    icon: 'Schema',
    title: 'TIDE: TamaroCards IDE',
    desc: (
      <span>
        Introducing TIDE, a new interactive environment for TamaroCards with
        live evaluation of graphics and colors.{' '}
        <Link href={'/tide'}>Try TIDE now!</Link>
      </span>
    ),
    silent: true,
  },
  {
    date: '2025-10-28',
    icon: 'Error',
    title: 'Improved, unified tooltips for error messages',
    desc: 'New, custom tooltips show error messages in a unified way for syntax errors (detected live, before running the code) and runtime errors. A clear category helps to identify the kind of error at a glance.',
    silent: true,
  },
  {
    date: '2025-11-15',
    icon: 'Palette',
    title: 'Improved palette for code highlighting',
    desc: "The palette used for code highlighting in the editor and anywhere else has been improved to better distinguish between kinds of tokens and to better match PyTamaro's color scheme.",
    silent: true,
  },
  {
    date: '2025-12-02',
    icon: 'Flare',
    title: 'Automatic detection of side effects',
    desc: 'The Judicious documentation system now automatically detects functions with side effects in a number of cases, making it easier to recognize impure functions.',
    silent: true,
  },
  {
    date: '2025-12-23',
    icon: 'PlaylistAddCheck',
    title: 'Semantic analysis in real time',
    desc: (
      <span>
        A new settings allows to enable real-time semantic analysis of the code
        as you type, providing errors about names and types even before running
        the code.{' '}
        <Link
          href={activityVariantPathnameFromParts(
            'luce',
            'learn-errors',
            'en',
            'v1',
          )}
        >
          Learn more about the analysis here.
        </Link>
      </span>
    ),
    silent: true,
  },
  {
    date: '2026-04-04',
    icon: 'PlayCircle',
    title: 'Python execution in the browser',
    desc: 'Python now runs directly in your browser thanks to Pyodide. This makes the execution faster and enables interactive input. The PyTamaro library has been updated to support this new mode.',
    silent: true,
  },
];

export default function ChangelogList({
  start,
  end,
}: {
  start: number;
  end: number;
}) {
  return (
    <List sx={{ bgcolor: 'background.paper' }}>
      {changelogEntries
        .slice()
        .reverse()
        .slice(start, end)
        .map((entry, idx, shownEntries) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={idx}>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <GenericMuiIcon iconName={entry.icon} fontSize='1.5rem' />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${entry.title} (${new Date(
                  entry.date,
                ).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })})`}
                secondary={entry.desc}
              />
            </ListItem>
            {idx !== shownEntries.length - 1 && (
              <Divider variant='middle' component='li' />
            )}
          </div>
        ))}
    </List>
  );
}
