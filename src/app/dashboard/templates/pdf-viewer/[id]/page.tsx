'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { PDFViewer } from '@react-pdf/renderer';
import { useParams } from 'next/navigation';
import { trpc } from 'src/app/_trpc/client';
import { TemplatePdfDocument } from 'src/sections/dashboard/templates/template-pdf-document';

const Page = () => {
  const params = useParams();
  const templateId = params.id as string;

  const { data } = trpc.template.get.useQuery(
    {
      id: templateId!,
    },
    {
      enabled: !!templateId,
    },
  );

  usePageView();

  if (!data) return null;

  return (
    <>
      <Seo title="Dashboard: Intake Viewer" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <PDFViewer
          height="100%"
          style={{ border: 'none' }}
          width="100%"
        >
          <TemplatePdfDocument template={data} />
        </PDFViewer>
      </Box>
    </>
  );
};

export default Page;
