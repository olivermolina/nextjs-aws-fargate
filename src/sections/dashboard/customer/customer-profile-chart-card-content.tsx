import { trpc } from '../../../app/_trpc/client';
import { CardContent, Skeleton } from '@mui/material';
import { ChartItemType } from '@prisma/client';
import ChiefComplaintItem from '../../components/charting-note/chief-complaint-item';
import NoteItem from '../../components/charting-note/note-item';
import NoteEditorItem from '../../components/charting-note/note-editor-item';
import SketchItem from '../../components/charting-note/sketch-item';
import Box from '@mui/material/Box';
import React from 'react';
import { CustomerProfileChartCardProps } from './customer-profile-chart-card';
import HeadingItem from '../../components/charting-note/heading-item';
import SpineItem from '../../components/charting-note/spine-item';
import BodyChartItem from '../../components/charting-note/body-chart-item';
import FileUploadItem from '../../components/charting-note/file-upload-item';
import DropdownItem from '../../components/charting-note/dropdown-item';
import RangeItem from '../../components/charting-note/range-item';
import CheckboxItem from '../../components/charting-note/checkbox-item';
import VitalsItem from '../../components/charting-note/vitals-item';
import AllergyItem from '../../components/charting-note/allergy-item';
import ProblemItem from '../../components/charting-note/problem-item';
import CustomerProfileChartHistoryCard from './customer-profile-chart-history-card';

export const ChartCardContent = ({ chart }: { chart: CustomerProfileChartCardProps['chart'] }) => {
  const { data, isLoading } = trpc.chart.get.useQuery(
    {
      id: chart.id,
    },
    {
      refetchOnWindowFocus: true,
    },
  );

  if (isLoading) {
    return (
      <CardContent sx={{ py: 0 }}>
        <Skeleton
          variant="rectangular"
          height={200}
          sx={{
            p: 2,
          }}
        />
      </CardContent>
    );
  }

  return (
    <>
      {data?.items.map((item) => (
        <CardContent
          key={item.id}
          sx={{ py: 0 }}
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

        </CardContent>
      ))}

      <Box sx={{ p: 2 }}>
        <CustomerProfileChartHistoryCard chart={chart} />
      </Box>
    </>
  );
};
