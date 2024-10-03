import Grid from '@mui/material/Unstable_Grid2';
import Head from 'next/head';
import { useRef } from 'react';
import DocElementsCardsStack from '../../../components/documentation/DocElementsCardsStack';
import NavigationBar from '../../../components/NavigationBar';
import PageTitle from '../../../components/PageTitle';
import CentralContent from '../../../components/sidebar/CentralContent';
import Sidebar from '../../../components/sidebar/Sidebar';
import TableOfContents from '../../../components/sidebar/TableOfContents';
import useJudiciousDocData from '../../../src/documentation';
import allDocumentationModules from '../../../src/fs-content/documentation';
import useLocalTranslation from '../../../src/localStorage/useLocalTranslation';
import { translationProps } from '../../../src/serverSideTranslationProps';
import useIsMounted from '../../../src/useIsMounted';

export default function DocumentationModule({ module }: { module: string }) {
  const modules = useJudiciousDocData([module]);
  const isMounted = useIsMounted();
  const elementsRef = useRef<HTMLDivElement>(null);
  const { t } = useLocalTranslation();
  const title = `${t('documentation')} ${module}`;
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <NavigationBar />
      <Grid container>
        <Sidebar side="left" />
        <CentralContent>
          <PageTitle>
            {title}
          </PageTitle>
          <Grid>
            <DocElementsCardsStack modules={modules} elementsRef={elementsRef} />
          </Grid>
        </CentralContent>
        <Sidebar side="right">
          <TableOfContents key={JSON.stringify(modules)} initialized={isMounted} elementRef={elementsRef} selector="div[id]" title={t('contents')} />
        </Sidebar>
      </Grid>
    </div>
  );
}

export async function getStaticProps({ params } : { params: { module: string } }) {
  return {
    props: {
      ...await translationProps(),
      module: params.module,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: (await allDocumentationModules()).map((module) => ({ params: { module } })),
    fallback: false,
  };
}
