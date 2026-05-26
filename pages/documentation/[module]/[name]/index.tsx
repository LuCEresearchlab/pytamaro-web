import { Container, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Head from 'next/head';
import DocBreadcrumbs from '../../../../components/documentation/DocBreadcrumbs';
import DocElementCard from '../../../../components/documentation/DocElementCard';
import NavigationBar from '../../../../components/navbar/NavigationBar';
import PageTitle from '../../../../components/PageTitle';
import CentralContent from '../../../../components/sidebar/CentralContent';
import Sidebar from '../../../../components/sidebar/Sidebar';
import { allKinds } from '../../../../src/documentation';
import allDocumentationModules, {
  readDocumentation,
} from '../../../../src/fs-content/documentation';
import useLocalTranslation from '../../../../src/localStorage/useLocalTranslation';
import { JudiciousElement } from '../../../../src/schemas/documentation';
import { translationProps } from '../../../../src/serverSideTranslationProps';

export default function SingleElementDocPage({
  module,
  officialBaseUrl,
  element,
}: {
  module: string;
  officialBaseUrl: string | null;
  element: JudiciousElement;
}) {
  const { t } = useLocalTranslation();
  const nameKind = allKinds[element.kind].label;
  const title = `Python ${t('documentation')} ${t(nameKind)} ${element.name}`;
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
            <DocBreadcrumbs
              module={module}
              name={element.name}
              nameKind={nameKind}
            />
            <DocElementCard module={module} element={element} elevation={0} />
            {officialBaseUrl !== null && element.urlSuffix !== null && (
              <Typography mt={10} textAlign='center'>
                See also{' '}
                <Link href={officialBaseUrl + element.urlSuffix}>
                  {element.name} in the official documentation
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
  params: { module: string; name: string };
}) {
  const doc = await readDocumentation(params.module);
  return {
    props: {
      ...(await translationProps()),
      module: params.module,
      officialBaseUrl: doc.officialBaseUrl ?? null,
      element: doc.elements.find((element) => element.name === params.name),
    },
  };
}

export async function getStaticPaths() {
  const modulesData = await Promise.all(
    (await allDocumentationModules()).map(readDocumentation),
  );
  return {
    paths: modulesData.flatMap((moduleData) =>
      moduleData.elements.map((element) => ({
        params: { module: moduleData.module, name: element.name, element },
      })),
    ),
    fallback: false,
  };
}
