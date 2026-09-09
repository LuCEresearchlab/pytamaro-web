import Category from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Functions from '@mui/icons-material/Functions';
import Numbers from '@mui/icons-material/Numbers';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { groupBy, sortBy } from 'lodash';
import Head from 'next/head';
import DocBreadcrumbs from '../../../components/documentation/DocBreadcrumbs';
import NavigationBar from '../../../components/navbar/NavigationBar';
import PageTitle from '../../../components/PageTitle';
import CentralContent from '../../../components/sidebar/CentralContent';
import Sidebar from '../../../components/sidebar/Sidebar';
import { toSpanAndCodeElements } from '../../../src/basicMarkdown';
import { allKinds } from '../../../src/documentation';
import allDocumentationModules, {
  readDocumentation,
} from '../../../src/fs-content/documentation';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import {
  JudiciousElement,
  JudiciousModule,
} from '../../../src/schemas/documentation';
import { translationProps } from '../../../src/serverSideTranslationProps';
import { documentationElementPathname } from '../../../src/urlUtils';

export function sortElements(elements: JudiciousElement[]) {
  return sortBy(
    elements,
    (element) => allKinds[element.kind].priority,
    (element) => element.name,
  );
}

export default function DocumentationModule({
  moduleData,
}: {
  moduleData: JudiciousModule;
}) {
  const { t } = useLocalTranslation();
  const title = `Python ${t('documentation')} ${t('library')} ${moduleData.module}`;
  const icons = {
    function: <Functions />,
    constant: <Numbers />,
    type: <Category />,
  };
  const sections = groupBy(moduleData.elements, 'section');
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <NavigationBar />
      <Grid container>
        <Sidebar side='left' />
        <CentralContent>
          <PageTitle>{t('documentation')}</PageTitle>
          <Container maxWidth='md'>
            <DocBreadcrumbs module={moduleData.module} />
            <Typography
              sx={{
                mb: 4,
                textAlign: 'center',
              }}
            >
              {moduleData.summary}
            </Typography>
            <div>
              {sortBy(Object.keys(sections)).map((section) => (
                <Accordion key={section}>
                  {section !== 'undefined' && (
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 'normal',
                        }}
                      >
                        {section}
                      </Typography>
                    </AccordionSummary>
                  )}
                  <AccordionDetails sx={{ p: 0 }}>
                    <List sx={{ bgcolor: 'background.paper' }}>
                      {sortElements(sections[section]).map((element, index) => (
                        <div key={element.name}>
                          <ListItem>
                            <ListItemButton
                              href={documentationElementPathname(
                                moduleData.module,
                                element.name,
                              )}
                            >
                              <ListItemAvatar>
                                <Avatar>{icons[element.kind]}</Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={element.name}
                                secondary={toSpanAndCodeElements(
                                  element.description.p[0],
                                )}
                                sx={{
                                  '& .MuiListItemText-primary': {
                                    fontSize: '1.2rem',
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '1rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  },
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                          {index === sections[section].length - 1 ? null : (
                            <Divider variant='middle' component='li' />
                          )}
                        </div>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
            {moduleData.officialBaseUrl !== undefined && (
              <Typography
                sx={{
                  mt: 10,
                  textAlign: 'center',
                }}
              >
                See also the{' '}
                <Link href={moduleData.officialBaseUrl}>
                  official documentation of the {moduleData.module} module
                </Link>
              </Typography>
            )}
          </Container>
        </CentralContent>
        <Sidebar side='right' />
      </Grid>
    </div>
  );
}

export async function getStaticProps({
  params,
}: {
  params: { module: string };
}) {
  return {
    props: {
      ...(await translationProps()),
      moduleData: await readDocumentation(params.module),
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: (await allDocumentationModules()).map((module) => ({
      params: { module },
    })),
    fallback: false,
  };
}
