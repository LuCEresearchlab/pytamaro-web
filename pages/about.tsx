/* eslint-disable react/jsx-one-expression-per-line */
import {
  Avatar, Box, Container, Divider, Link, List, ListItem, ListItemAvatar, ListItemText, Typography,
} from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import GenericMuiIcon from '../components/GenericMuiIcon';
import NavigationBar from '../components/NavigationBar';
import { listAuthorsProfiles } from '../src/fs-content/authors';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { authorPathname } from '../src/urlUtils';

const collaborators = [
  {
    firstname: 'Alen',
    lastname: 'Sugimoto',
    contribution: 'Design and implementation of curricula as graphs of activities',
    title: 'Bachelor student in the Faculty of Informatics at the Università della Svizzera italiana (USI) - Bachelor thesis',
  },
  {
    firstname: 'Luca',
    lastname: 'Chiodini',
    contribution: 'PyTamaro library, initial design of the platform, management and contributions throughout',
    title: 'PhD student at the Software Institute, Università della Svizzera italiana (USI)',
    avatar: 'LucaChiodini.jpg',
  },
  {
    firstname: 'Matthias',
    lastname: 'Hauswirth',
    contribution: 'Management and contributions throughout',
    title: 'Professor at the Software Institute, Università della Svizzera italiana (USI)',
    avatar: 'MatthiasHauswirth.jpg',
  },
];

export function Body2Typography({ children = null } : { children?: React.ReactNode }) {
  return (
    <Typography variant="body2">
      {children}
    </Typography>
  );
}

const changelogEntries = [
  {
    date: '2023-11-17',
    icon: 'FontDownload',
    title: 'More fonts available',
    desc: <span>You can now pick a font for the text in your graphics from a broader set! <Link href="/install">Read here the full list</Link> of available fonts.</span>,
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
];

export default function AboutPage({ authorsProfiles } : { authorsProfiles: AuthorProfile[] }) {
  return (
    <div>
      <Head>
        <title>About - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography sx={{ mt: 3, mb: 5 }} variant="h3" align="center" color="textPrimary">
            About PyTamaro Web
          </Typography>
          <Typography variant="h4" color="textPrimary" paragraph>
            ✨ What is new on the platform?
          </Typography>
          <Typography variant="body1" paragraph>
            We constantly improve our platform. These are the highlights of our updates:
          </Typography>
          <List sx={{ bgcolor: 'background.paper', mb: 6 }}>
            {changelogEntries.toReversed().map((entry, idx) => (
              <>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <GenericMuiIcon iconName={entry.icon} fontSize="1.5rem" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${entry.title} (${new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })})`}
                    secondary={entry.desc}
                  />
                </ListItem>
                {idx !== changelogEntries.length - 1 && <Divider variant="inset" component="li" />}
              </>
            ))}
          </List>
          <Typography variant="h4" gutterBottom>🧑‍🤝‍🧑 Who?</Typography>
          <Typography variant="body1" paragraph>
            This web platform for PyTamaro has been developed at
            the
            {' '}
            <a href="https://luce.si.usi.ch/">Lugano Computing Education research lab</a>
            {' '}
            (LuCE)
            at the
            {' '}
            <a href="https://si.usi.ch/">Software Institute</a>
            {' '}
            of
            the
            {' '}
            <a href="https://usi.ch/en">Università della Svizzera italiana</a>
            {' '}
            (USI)
            in Lugano, Switzerland.
          </Typography>
          <Typography variant="body1">
            Contributors to the platform:
          </Typography>
          <List>
            {collaborators.map((person) => (
              <ListItem key={`collaborator_${person.firstname}_${person.lastname}`}>
                <ListItemAvatar>
                  <Avatar
                    alt={`${person.firstname} ${person.lastname}`}
                    src={`./people/${person.avatar}`}
                    sx={{ width: '2.5rem', height: '2.5rem' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={(
                    <Typography
                      variant="h6"
                    >
                      {`${person.firstname} ${person.lastname}`}
                    </Typography>
                )}
                  secondary={(
                    <>
                      <Typography
                        variant="subtitle1"
                      >
                        {person.contribution}
                      </Typography>
                      <Typography
                        variant="body2"
                      >
                        {person.title}
                      </Typography>
                    </>
                )}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1">
            The content of the platform (activities and curricula) has been developed by
            multiple authors:
          </Typography>
          <List>
            {authorsProfiles.map((authorProfile) => (
              <ListItem key={`author_${authorProfile.slug}`}>
                <ListItemAvatar>
                  <Avatar
                    sx={{ width: '2.5rem', height: '2.5rem' }}
                  >
                    {authorProfile.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={(
                    <Link
                      href={authorPathname(authorProfile.slug)}
                      underline="none"
                      variant="h6"
                    >
                      {authorProfile.name}
                    </Link>
                )}
                  secondary={(
                    <MDXRemote
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...authorProfile.description}
                      components={{
                        p: Body2Typography,
                      }}
                    />
                )}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="h4" sx={{ mt: 4 }} gutterBottom>🧑‍💻 Why?</Typography>
          <Typography variant="body1" paragraph>
            Graphics can be an excellent domain to learn programming.
            We developed PyTamaro exactly with this goal in mind,
            and we have been using it in several courses: students loved it!
            This web platform provides a way to use PyTamaro in a browser
            and several activities that can inspire you.
          </Typography>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      authorsProfiles: await listAuthorsProfiles(),
      ...await translationProps(),
    },
  };
}
