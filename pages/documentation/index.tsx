import {
  Autocomplete,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import { sortBy } from 'lodash';
import Head from 'next/head';
import { iconPath } from '../../components/documentation/utils';
import NavigationBar from '../../components/navbar/NavigationBar';
import PageTitle from '../../components/PageTitle';
import CentralContent from '../../components/sidebar/CentralContent';
import Sidebar from '../../components/sidebar/Sidebar';
import allDocumentationModules, {
  readDocumentation,
} from '../../src/fs-content/documentation';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { JudiciousModule } from '../../src/schemas/documentation';
import { translationProps } from '../../src/serverSideTranslationProps';
import {
  documentationElementPathname,
  documentationModulePathname,
  pytamaroDocsUrl,
} from '../../src/urlUtils';

export default function Documentation({
  modulesData,
}: {
  modulesData: JudiciousModule[];
}) {
  const { t } = useLocalTranslation();

  const sortedModules = sortBy(modulesData, (module) => [
    module.module.startsWith('pytamaro') ? 1 : 0,
    module.module,
  ]);

  return (
    <div>
      <Head>
        <title>{`Python ${t('documentation')}`}</title>
      </Head>
      <NavigationBar />
      <Grid container>
        <Sidebar side='left' />
        <CentralContent>
          <PageTitle>{t('documentation')}</PageTitle>
          <Container maxWidth='md'>
            <Typography my={4} textAlign='center'>
              {t('selectToSeeDoc')}
            </Typography>
            <Autocomplete
              options={sortedModules.flatMap((module) =>
                module.elements.map((element) => ({
                  ...element,
                  module: module.module,
                })),
              )}
              renderOption={(_props, option) => (
                <ListItemButton
                  href={documentationElementPathname(
                    option.module,
                    option.name,
                  )}
                >
                  <ListItemText
                    primary={option.name}
                    secondary={option.description.p[0]}
                  />
                </ListItemButton>
              )}
              // eslint-disable-next-line react/jsx-props-no-spreading
              renderInput={(params) => (
                <TextField {...params} label={t('findName')} />
              )}
              filterOptions={createFilterOptions({
                limit: 10,
                stringify: (option) => option.name + option.description.p[0],
                trim: true,
              })}
              sx={{ mb: 6 }}
              freeSolo
            />
            <List sx={{ bgcolor: 'background.paper' }}>
              {sortedModules.map((data, index) => (
                <div key={data.module}>
                  <ListItem>
                    <ListItemButton
                      href={documentationModulePathname(data.module)}
                    >
                      <ListItemAvatar>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={iconPath(data.module)}
                          alt='Library logo'
                          height={32}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={data.module}
                        secondary={data.summary}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontSize: '1.2rem',
                          },
                          '& .MuiListItemText-secondary': {
                            fontSize: '1rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index === sortedModules.length - 1 ? null : (
                    <Divider variant='middle' component='li' />
                  )}
                </div>
              ))}
            </List>
            <Typography mt={10} textAlign='center'>
              See also the official documentation of{' '}
              <Link href='https://docs.python.org/3/library/index.html'>
                The Python Standard Library
              </Link>{' '}
              and of{' '}
              <Link href={pytamaroDocsUrl()}>PyTamaro on ReadTheDocs</Link>
            </Typography>
          </Container>
        </CentralContent>
        <Sidebar side='right' />
      </Grid>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
      modulesData: await Promise.all(
        (await allDocumentationModules()).map(readDocumentation),
      ),
    },
  };
}
