import {
  Avatar, Box, Container, Divider, Link, List, ListItem, ListItemAvatar, ListItemText, Typography,
} from '@mui/material';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
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

export default function AboutPage({ authorsProfiles } : { authorsProfiles: AuthorProfile[] }) {
  return (
    <div>
      <Head>
        <title>About - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography sx={{ mt: 2 }} variant="h3" align="center" color="textPrimary" gutterBottom>
            About PyTamaro Web
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            The backstory
          </Typography>
          <Typography variant="h4" gutterBottom>Who?</Typography>
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
          <Typography variant="h4" sx={{ mt: 3 }} gutterBottom>Why?</Typography>
          <Typography variant="body1" paragraph>
            Graphics can be an excellent domain to learn programming.
            We developed PyTamaro exactly with this goal in mind,
            and we have been using it in several courses: students loved it!
            This web platform provides a way to use PyTamaro in a browser
            and several activities that can inspire you.
          </Typography>
          <Typography variant="h4" gutterBottom>How?</Typography>
          <Typography variant="body1" paragraph>
            PyTamaro Web is a
            {' '}
            <a href="https://reactjs.org/">React</a>
            {' '}
            web application
            built on top of
            {' '}
            <a href="https://nextjs.org/">Next.js</a>
            .
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
