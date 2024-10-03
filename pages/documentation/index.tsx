import {
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { debounce } from 'lodash';
import Head from 'next/head';
import { useRef, useState } from 'react';
import DocElementsCardsStack from '../../components/documentation/DocElementsCardsStack';
import NavigationBar from '../../components/NavigationBar';
import PageTitle from '../../components/PageTitle';
import SelectAll from '../../components/SelectAll';
import CentralContent from '../../components/sidebar/CentralContent';
import Sidebar from '../../components/sidebar/Sidebar';
import TableOfContents from '../../components/sidebar/TableOfContents';
import useJudiciousDocData, { allKinds } from '../../src/documentation';
import allDocumentationModules from '../../src/fs-content/documentation';
import useLocalTranslation from '../../src/localStorage/useLocalTranslation';
import { translationProps } from '../../src/serverSideTranslationProps';
import { documentationModulePathname } from '../../src/urlUtils';
import useIsMounted from '../../src/useIsMounted';

export default function Documentation({ modules } : { modules: string[] }) {
  const { t } = useLocalTranslation();
  const isMounted = useIsMounted();
  const elementsRef = useRef<HTMLDivElement>(null);

  const allModules = modules.map((name) => ({
    id: name,
    label: name,
    url: documentationModulePathname(name),
  }));
  const [selectedModulesIds, setSelectedModulesIds] = useState<string[]>([]);
  const [selectedKindsIds, setSelectedKindsIds] = useState(allKinds.map((kind) => kind.id));
  const localizedKinds = allKinds.map((kind) => ({ ...kind, label: t(kind.label) }));
  const [searchText, setSearchText] = useState('');

  const modulesData = useJudiciousDocData(selectedModulesIds);
  const modulesDataToShow = modulesData.map((data) => ({
    module: data.module,
    elements: data.elements.filter((element) => selectedKindsIds.includes(element.kind)).filter(
      (element) => element.name.includes(searchText)
                || element.description.p.some((text) => text.includes(searchText)),
    ),
  }));

  return (
    <div>
      <Head>
        <title>
          {`${t('documentation')} - PyTamaro`}
        </title>
      </Head>
      <NavigationBar />
      <Grid container>
        <Sidebar side="left" />
        <CentralContent>
          <PageTitle>{t('documentation')}</PageTitle>
          <Grid container spacing={2} mb={4}>
            <Grid xs={12} md={6}>
              <SelectAll
                title={t('library')}
                placeholder={t('selectLibrary')}
                options={allModules}
                maxTagsShown={3}
                initialSelection={[]}
                onSelectionChange={setSelectedModulesIds}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <SelectAll
                title={t('kind')}
                placeholder={t('selectKind')}
                key={JSON.stringify(localizedKinds)}
                options={localizedKinds}
                maxTagsShown={3}
                onSelectionChange={setSelectedKindsIds}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                InputLabelProps={{ shrink: true }}
                fullWidth
                label={t('textualSearch')}
                placeholder={t('nameOrDescription')}
                variant="outlined"
                onChange={debounce((e) => setSearchText(e.target.value), 100)}
              />
            </Grid>
          </Grid>
          {selectedModulesIds.length === 0
            ? <Typography variant="body1" textAlign="center" fontWeight="bold">{t('selectToSeeDoc')}</Typography>
            : <DocElementsCardsStack modules={modulesDataToShow} elementsRef={elementsRef} /> }
        </CentralContent>
        <Sidebar side="right">
          <TableOfContents key={JSON.stringify(modulesDataToShow)} initialized={isMounted} elementRef={elementsRef} selector="div[id]" title={t('contents')} />
        </Sidebar>
      </Grid>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...await translationProps(),
      modules: await allDocumentationModules(),
    },
  };
}
