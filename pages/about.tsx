import {
  Avatar,
  Box,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TablePagination,
  Typography,
} from '@mui/material';
import { orderBy } from 'lodash';
import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import { useState } from 'react';
import ChangelogList, { changelogEntries } from '../components/ChangelogList';
import NavigationBar from '../components/navbar/NavigationBar';
import { listAuthorsProfiles } from '../src/fs-content/authors';
import { AuthorProfile } from '../src/schemas/authorSchema';
import { translationProps } from '../src/serverSideTranslationProps';
import { authorPathname } from '../src/urlUtils';

const collaborators = [
  {
    firstname: 'Alen',
    lastname: 'Sugimoto',
    contribution:
      'Design and implementation of curricula as graphs of activities',
    title:
      'Bachelor student in the Faculty of Informatics at the Università della Svizzera italiana (USI) - Bachelor thesis',
  },
  {
    firstname: 'Luca',
    lastname: 'Chiodini',
    contribution:
      'PyTamaro library, design of the platform, management and contributions throughout',
    title:
      'Postdoctoral researcher at the Software Institute, Università della Svizzera italiana (USI)',
    avatar: 'LucaChiodini.jpg',
  },
  {
    firstname: 'Joey',
    lastname: 'Bevilacqua',
    contribution:
      'Client-side execution of PyTamaro programs, contributions throughout',
    title:
      'PhD student at the Software Institute, Università della Svizzera italiana (USI)',
  },
  {
    firstname: 'Nathan',
    lastname: 'Coquerel',
    contribution: 'TIDE: a web-based IDE for TamaroCards',
    title: 'Master student at Rennes University - Research internship',
  },
  {
    firstname: 'Matthias',
    lastname: 'Hauswirth',
    contribution: 'Management and contributions throughout',
    title:
      'Professor at the Software Institute, Università della Svizzera italiana (USI)',
    avatar: 'MatthiasHauswirth.jpg',
  },
];

export function Body2Typography({
  children = null,
}: {
  children?: React.ReactNode;
}) {
  return <Typography variant='body2'>{children}</Typography>;
}

export default function AboutPage({
  authorsProfiles,
}: {
  authorsProfiles: AuthorProfile[];
}) {
  const [changelogPage, setChangelogPage] = useState(0);
  const entriesPerPage = 5;
  return (
    <div>
      <Head>
        <title>About - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <Typography
            sx={{ mt: 3, mb: 5 }}
            variant='h3'
            align='center'
            color='textPrimary'
          >
            About PyTamaro Web
          </Typography>
          <Typography variant='h4' color='textPrimary' paragraph>
            ✨ What is new on the platform?
          </Typography>
          <Typography variant='body1' paragraph>
            We constantly improve our platform. These are the highlights of our
            updates:
          </Typography>
          <ChangelogList
            start={entriesPerPage * changelogPage}
            end={entriesPerPage * (changelogPage + 1)}
          />
          <TablePagination
            component='div'
            count={changelogEntries.length}
            page={changelogPage}
            rowsPerPageOptions={[]}
            onPageChange={(_ev, newPage) => setChangelogPage(newPage)}
            rowsPerPage={entriesPerPage}
            sx={{
              marginBottom: 6,
              '& .MuiTablePagination-spacer': {
                display: 'none',
              },
              display: 'flex',
              justifyContent: 'center',
            }}
          />
          <Typography id='who' variant='h4' gutterBottom>
            🧑‍🤝‍🧑 Who?
          </Typography>
          <Typography variant='body1' paragraph>
            This web platform for PyTamaro has been developed at the{' '}
            <Link href='https://luce.si.usi.ch/'>
              Lugano Computing Education research lab
            </Link>{' '}
            (LuCE) at the{' '}
            <Link href='https://si.usi.ch/'>Software Institute</Link> of the{' '}
            <Link href='https://usi.ch/en'>
              Università della Svizzera italiana
            </Link>{' '}
            (USI) in Lugano, Switzerland. Part of the development of the
            platform has been funded by the Swiss National Science Foundation
            through the project{' '}
            <Link href='https://data.snf.ch/grants/grant/184689'>184689</Link>.
            Part of the content has been created thanks to the support of two
            grants for{' '}
            <Link href='https://www.usi.ch/en/university/info/elab/call-projects-innovation-teaching'>
              didactic innovation projects funded by USI
            </Link>
            .
          </Typography>
          <Typography variant='body1'>
            These people contributed to the development of the platform:
          </Typography>
          <List>
            {orderBy(collaborators, ['lastname', 'firstname']).map((person) => (
              <ListItem
                key={`collaborator_${person.firstname}_${person.lastname}`}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={`${person.firstname} ${person.lastname}`}
                    src={
                      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                      person.avatar ? `./people/${person.avatar}` : undefined
                    }
                    sx={{ width: '2.5rem', height: '2.5rem' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography variant='h6'>
                      {`${person.firstname} ${person.lastname}`}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant='subtitle1'>
                        {person.contribution}
                      </Typography>
                      <Typography variant='body2'>{person.title}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='body1'>
            The content of the platform (activities and curricula) has been
            developed by multiple authors:
          </Typography>
          <List>
            {authorsProfiles.map((authorProfile) => (
              <ListItem key={`author_${authorProfile.slug}`}>
                <ListItemAvatar>
                  <Avatar sx={{ width: '2.5rem', height: '2.5rem' }}>
                    {authorProfile.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Link
                      href={authorPathname(authorProfile.slug)}
                      underline='none'
                      variant='h6'
                    >
                      {authorProfile.name}
                    </Link>
                  }
                  secondary={
                    <MDXRemote
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...authorProfile.description}
                      components={{
                        p: Body2Typography,
                      }}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
          <Typography variant='h4' sx={{ mt: 4 }} gutterBottom>
            🧑‍💻 Why?
          </Typography>
          <Typography variant='body1' paragraph>
            Graphics can be an excellent domain to learn programming. We
            developed PyTamaro exactly with this goal in mind, and we have been
            using it in several courses: students loved it! This web platform
            provides a way to use PyTamaro in a browser and several activities
            that can inspire you.
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
      ...(await translationProps()),
    },
  };
}
