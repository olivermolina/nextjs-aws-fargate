'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { Layout as ComponentsLayout } from 'src/layouts/components';
import { Previewer } from 'src/sections/components/previewer';
import { GridList1 } from 'src/sections/components/grid-lists/grid-list-1';
import { GridList2 } from 'src/sections/components/grid-lists/grid-list-2';
import { GridList3 } from 'src/sections/components/grid-lists/grid-list-3';
import { GridList4 } from 'src/sections/components/grid-lists/grid-list-4';
import { GridList5 } from 'src/sections/components/grid-lists/grid-list-5';
import { GridList6 } from 'src/sections/components/grid-lists/grid-list-6';

const components: { element: JSX.Element; title: string }[] = [
  {
    element: <GridList1 />,
    title: 'Grid list 1',
  },
  {
    element: <GridList2 />,
    title: 'Grid list 2',
  },
  {
    element: <GridList3 />,
    title: 'Grid list 3',
  },
  {
    element: <GridList4 />,
    title: 'Grid list 4',
  },
  {
    element: <GridList5 />,
    title: 'Grid list 5',
  },
  {
    element: <GridList6 />,
    title: 'Grid list 6',
  },
];

const Page = () => {
  usePageView();

  return (
    <>
      <Seo title="Components: Grid Lists" />
      <ComponentsLayout title="Grid Lists">
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Stack spacing={8}>
              {components.map((component) => (
                <Previewer
                  key={component.title}
                  title={component.title}
                >
                  {component.element}
                </Previewer>
              ))}
            </Stack>
          </Container>
        </Box>
      </ComponentsLayout>
    </>
  );
};

export default Page;
