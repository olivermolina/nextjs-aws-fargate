import {
  Allergy,
  BodyChart,
  Chart,
  ChartCheckBox,
  ChartDropdown,
  ChartFile,
  ChartHeading,
  ChartItem,
  ChartItemType,
  ChartNote,
  ChartNoteEditor,
  ChartRange,
  ChartSketch,
  ChartSpine,
  ChiefComplaint,
  Problem,
  Vital,
} from '@prisma/client';
import ChiefComplaintItem from '../../components/charting-note/chief-complaint-item';
import NoteItem from '../../components/charting-note/note-item';

import { Draggable } from 'react-beautiful-dnd';
import React from 'react';
import NoteEditorItem from '../../components/charting-note/note-editor-item';
import Box from '@mui/material/Box';
import SketchItem from '../../components/charting-note/sketch-item';
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

export type ProfileChartItemType = ChartItem & {
  ChiefComplaint?: ChiefComplaint | null;
  ChartNote?: ChartNote | null;
  ChartNoteEditor?: ChartNoteEditor | null;
  ChartHeading?: ChartHeading | null;
  ChartSketch?:
    | (ChartSketch & {
    signedUrl?: string | null;
  })
    | null;
  ChartSpine?: ChartSpine | null;
  BodyChart?: BodyChart | null;
  ChartFile?:
    | (ChartFile & {
    signedUrl?: string | null;
  })
    | null;
  ChartDropdown?: ChartDropdown | null;
  ChartCheckBox?: ChartCheckBox | null;
  ChartRange?: ChartRange | null;
  Vital?: Vital | null;
  Allergy?: Allergy | null;
  Problem?: Problem | null;
};

export type ChartWithProfileChartItemType = Chart & {
  items: ProfileChartItemType[];
};

type Props = {
  item: ProfileChartItemType;
  index: number;
  itemLength: number;
  moveItemDown: () => void;
  moveItemUp: () => void;
  handleNew: () => void;
  removeMoveItemRef: () => void;
};

const CustomerProfileChartItem = ({
                                    item,
                                    index,
                                    itemLength,
                                    moveItemDown,
                                    moveItemUp,
                                    handleNew,
                                    removeMoveItemRef,
                                  }: Props) => {
  const isFirst = index === 0;
  const isLast = index === itemLength - 1;

  return (
    <Draggable
      draggableId={item.id}
      index={index}
    >
      {(provided, snapshot) => (
        <Box
          id={`item-${index}`} // Assign an id to each item
          ref={provided.innerRef}
          sx={{
            width: '100%',
            px: snapshot.isDragging ? 0 : 2,
            backgroundColor: snapshot.isDragging ? 'primary.light' : 'white', // Change background color when dragging
          }}
          {...provided.draggableProps}
        >
          {item.type === ChartItemType.CHIEF_COMPLAINT && item.ChiefComplaint && (
            <ChiefComplaintItem
              chartId={item.chart_id}
              itemId={item.id}
              chiefComplaint={item.ChiefComplaint}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.NOTE && item.ChartNote && (
            <NoteItem
              chartId={item.chart_id}
              itemId={item.id}
              note={item.ChartNote}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.NOTE_EDITOR && item.ChartNoteEditor && (
            <NoteEditorItem
              chartId={item.chart_id}
              itemId={item.id}
              note={item.ChartNoteEditor}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.SKETCH && item.ChartSketch && (
            <SketchItem
              chartId={item.chart_id}
              itemId={item.id}
              sketch={item.ChartSketch}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.HEADING && item.ChartHeading && (
            <HeadingItem
              chartId={item.chart_id}
              itemId={item.id}
              chartHeading={item.ChartHeading}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.SPINE && item.ChartSpine && (
            <SpineItem
              chartId={item.chart_id}
              itemId={item.id}
              spine={item.ChartSpine}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.BODY_CHART && item.BodyChart && (
            <BodyChartItem
              chartId={item.chart_id}
              itemId={item.id}
              bodyChart={item.BodyChart}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.FILE && item.ChartFile && (
            <FileUploadItem
              chartId={item.chart_id}
              itemId={item.id}
              file={item.ChartFile}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.DROPDOWN && item.ChartDropdown && (
            <DropdownItem
              chartId={item.chart_id}
              itemId={item.id}
              chartDropdown={item.ChartDropdown}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.RANGE && item.ChartRange && (
            <RangeItem
              chartId={item.chart_id}
              itemId={item.id}
              chartRange={item.ChartRange}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.CHECKBOXES && item.ChartCheckBox && (
            <CheckboxItem
              chartId={item.chart_id}
              itemId={item.id}
              chartCheckBox={item.ChartCheckBox}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.VITALS && item.Vital && (
            <VitalsItem
              chartId={item.chart_id}
              itemId={item.id}
              vital={item.Vital}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.ALLERGY && item.Allergy && (
            <AllergyItem
              chartId={item.chart_id}
              itemId={item.id}
              allergy={item.Allergy}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}

          {item.type === ChartItemType.PROBLEM && item.Problem && (
            <ProblemItem
              chartId={item.chart_id}
              itemId={item.id}
              problem={item.Problem}
              handleMoveUp={isFirst ? undefined : moveItemUp}
              handleMoveDown={isLast ? undefined : moveItemDown}
              handleNew={handleNew}
              removeMoveItemRef={removeMoveItemRef}
              provided={provided}
            />
          )}
        </Box>
      )}
    </Draggable>
  );
};

export default CustomerProfileChartItem;
