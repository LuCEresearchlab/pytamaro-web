import {
  Box,
  Container, Stack,
} from '@mui/material';
import { sortBy } from 'lodash';
import { Ref } from 'react';
import { allKinds } from '../../src/documentation';
import { JudiciousModule } from '../../src/schemas/documentation';
import DocElementCard from './DocElementCard';

export default function DocElementsCardsStack({ modules, elementsRef } :
{ modules: JudiciousModule[], elementsRef: Ref<HTMLDivElement> }) {
  const modulesSortedElements = modules.map((data) => ({
    module: data.module,
    elements: sortBy(
      data.elements,
      (element) => allKinds.find((kind) => kind.id === element.kind)?.priority,
      (element) => element.name,
    ),
  }));
  return (
    <Stack spacing={6} ref={elementsRef} alignItems="center">
      {modulesSortedElements.map((modData) => {
        const modName = modData.module;
        return (
          <Container key={modName} maxWidth="md" id={modName} data-toc-title={modName} className="anchor">
            <Stack spacing={2}>
              {modData.elements.map((element) => (
                <Box key={element.name}>
                  <DocElementCard module={modData.module} element={element} elevation={1} />
                </Box>
              ))}
            </Stack>
          </Container>
        );
      })}
    </Stack>
  );
}
