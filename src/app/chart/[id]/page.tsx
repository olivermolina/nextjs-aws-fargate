'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useParams } from 'next/navigation';
import { trpc } from 'src/app/_trpc/client';
import { useOrganizationStore } from '../../../hooks/use-organization';
import Grid from '@mui/material/Grid';
import { getBaseUrl } from '../../../utils/get-base-url';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { addressToString } from '../../../utils/address-to-string';
import { getUserFullName } from '../../../utils/get-user-full-name';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
import { ChartItemType } from '@prisma/client';
import ChiefComplaintItem from '../../../sections/components/charting-note/chief-complaint-item';
import NoteItem from '../../../sections/components/charting-note/note-item';
import NoteEditorItem from '../../../sections/components/charting-note/note-editor-item';
import SketchItem from '../../../sections/components/charting-note/sketch-item';
import HeadingItem from '../../../sections/components/charting-note/heading-item';
import SpineItem from '../../../sections/components/charting-note/spine-item';
import BodyChartItem from '../../../sections/components/charting-note/body-chart-item';
import FileUploadItem from '../../../sections/components/charting-note/file-upload-item';
import DropdownItem from '../../../sections/components/charting-note/dropdown-item';
import RangeItem from '../../../sections/components/charting-note/range-item';
import CheckboxItem from '../../../sections/components/charting-note/checkbox-item';
import VitalsItem from '../../../sections/components/charting-note/vitals-item';
import AllergyItem from '../../../sections/components/charting-note/allergy-item';
import ProblemItem from '../../../sections/components/charting-note/problem-item';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';

const Layout = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
});

const LayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
});

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
    <Layout>
      <LayoutContainer>
        <Seo title="Dashboard: Chart Viewer" />
        <Box
          component="main"
          sx={{
            py: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Container maxWidth={'lg'}>
            <Stack
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
              sx={{
                width: '100%',
                height: '100%',
                p: 4,
              }}
            >
              {/* Header */}
              <Stack
                direction={'row'}
                justifyContent={'space-between'}
                alignItems={'flex-start'}
              >
                <img
                  alt={organization?.name || ''}
                  src={logo || `${getBaseUrl()}/assets/logo.jpg`}
                  width={75}
                  height={75}
                />

                <Stack
                  sx={{
                    pt: 2,
                  }}
                >
                  <Typography variant={'subtitle1'}>
                    {organization?.name || ''} by Luna Health
                  </Typography>
                  <Typography variant={'subtitle2'}>
                    {addressToString(organization?.address)}
                  </Typography>
                  <Typography variant={'subtitle2'}>
                    Tel: {organization?.phone || ''} Email:{' '}
                    {organization?.email || organization?.bill_email || ''}
                  </Typography>
                </Stack>
              </Stack>

              {/* Patient details*/}
              <Stack
                sx={{
                  mt: 2,
                }}
              >
                <Typography
                  variant={'h4'}
                  color={'text.secondary'}
                >
                  Chart
                </Typography>
                <Typography variant={'subtitle2'}>{getUserFullName(chart.user)}</Typography>
                <Typography variant={'subtitle2'}>
                  Date of Birth: {dayjs(chart.user.birthdate).format('YYYY-MM-DD')}
                </Typography>
                <Typography variant={'subtitle2'}>{addressToString(chart.user.address)}</Typography>
                <Typography variant={'subtitle2'}>Tel: {chart.user.phone || ''}</Typography>
                <Typography variant={'subtitle2'}>Email: {chart.user.email}</Typography>
              </Stack>

              {/* Divider */}
              <Divider
                sx={{
                  borderBottomWidth: '5px',
                  bgcolor: (theme) => theme.palette.neutral[400],
                  my: 2,
                }}
                style={{
                  border: 'none',
                  height: 2,
                }}
              />

              {/* Staff Creator Details */}
              <Stack
                direction={'row'}
                spacing={1}
                alignItems={'end'}
              >
                <Typography
                  variant={'subtitle1'}
                  color={'text.secondary'}
                >
                  {dayjs(chart.created_at).format('MMMM DD, YYYY')}
                </Typography>
                <Typography
                  variant={'subtitle2'}
                  color={'text.secondary'}
                >
                  Added by: {getUserFullName(chart.created_by)} -{' '}
                  {chart.signed_by ? 'Signed' : 'Unsigned Draft'}
                </Typography>
              </Stack>

              {/* Chart Items */}
              <Grid
                container
                sx={{
                  ml: -2,
                }}
                spacing={1}
              >
                {chart?.items.map((item) => (
                  <Grid
                    item
                    key={item.id}
                    xs={12}
                  >
                    {item.type === ChartItemType.CHIEF_COMPLAINT && item.ChiefComplaint && (
                      <ChiefComplaintItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        chiefComplaint={item.ChiefComplaint}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.NOTE && item.ChartNote && (
                      <NoteItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        note={item.ChartNote}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.NOTE_EDITOR && item.ChartNoteEditor && (
                      <NoteEditorItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        note={item.ChartNoteEditor}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.SKETCH && item.ChartSketch && (
                      <SketchItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        sketch={item.ChartSketch}
                        readOnly
                        printMode
                      />
                    )}

                    {item.type === ChartItemType.HEADING && item.ChartHeading && (
                      <HeadingItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        chartHeading={item.ChartHeading}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.SPINE && item.ChartSpine && (
                      <SpineItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        spine={item.ChartSpine}
                        readOnly
                      />
                    )}
                    {item.type === ChartItemType.BODY_CHART && item.BodyChart && (
                      <BodyChartItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        bodyChart={item.BodyChart}
                        readOnly
                        printMode
                      />
                    )}

                    {item.type === ChartItemType.FILE && item.ChartFile && (
                      <FileUploadItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        file={item.ChartFile}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.DROPDOWN && item.ChartDropdown && (
                      <DropdownItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        chartDropdown={item.ChartDropdown}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.RANGE && item.ChartRange && (
                      <RangeItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        chartRange={item.ChartRange}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.CHECKBOXES && item.ChartCheckBox && (
                      <CheckboxItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        chartCheckBox={item.ChartCheckBox}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.VITALS && item.Vital && (
                      <VitalsItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        vital={item.Vital}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.ALLERGY && item.Allergy && (
                      <AllergyItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        allergy={item.Allergy}
                        readOnly
                      />
                    )}

                    {item.type === ChartItemType.PROBLEM && item.Problem && (
                      <ProblemItem
                        chartId={item.chart_id}
                        itemId={item.id}
                        problem={item.Problem}
                        readOnly
                      />
                    )}
                  </Grid>
                ))}
              </Grid>

              {/* Divider */}
              <Divider
                sx={{
                  borderBottomWidth: '5px',
                  bgcolor: (theme) => theme.palette.neutral[400],
                  my: 2,
                }}
                style={{
                  border: 'none',
                  height: 2,
                }}
              />

              {/* Signed By */}
              <Stack spacing={1}>
                <Typography variant={'h6'}>Signature</Typography>
                {chart.signed_by ? (
                  <>
                    <Typography variant={'body2'}>{getUserFullName(chart.signed_by)}</Typography>
                    <Typography variant={'body2'}>
                      {dayjs(chart.signed_at).format('MMMM DD, YYYY')}
                    </Typography>
                  </>
                ) : (
                  <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                  >
                    Signature not provided
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Container>
        </Box>
      </LayoutContainer>
    </Layout>
  );
};

export default Page;
