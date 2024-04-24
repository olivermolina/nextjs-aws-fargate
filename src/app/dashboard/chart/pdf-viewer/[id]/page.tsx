'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { PDFViewer } from '@react-pdf/renderer';
import { useParams } from 'next/navigation';
import { trpc } from 'src/app/_trpc/client';
import { useOrganizationStore } from '../../../../../hooks/use-organization';
import {
  ChartPdfDocument,
} from '../../../../../sections/dashboard/customer/customer-chart-pdf-document';

const Page = () => {
  const params = useParams();
  const id = params.id as string;
  const { data: organization } = useOrganizationStore();
  const { data: logo } = trpc.user.getSignedUrlFile.useQuery(
    {
      key: organization?.logo || '',
    },
    {
      enabled: !!organization?.logo,
      refetchOnWindowFocus: false,
    },
  );

  const { data: chart } = trpc.chart.get.useQuery(
    {
      id,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  usePageView();

  if (!chart || !logo) return null;

  return (
    <>
      <Seo title="Dashboard: Chart Viewer" />
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
          <ChartPdfDocument
            chart={chart}
            organization={organization}
            logo={logo}
          />
        </PDFViewer>
      </Box>
    </>
  );
};

export default Page;
