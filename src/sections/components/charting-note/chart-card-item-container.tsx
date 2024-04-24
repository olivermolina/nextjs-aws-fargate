import * as React from 'react';
import { useChartShowMoreMenu } from '../../../hooks/use-chart-show-more-menu';
import Box from '@mui/material/Box';
import ChartItemMenu from './chart-item-menu';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import { DraggableProvided } from 'react-beautiful-dnd';

type Props = {
  handleMoveUp?: () => void;
  handleMoveDown?: () => void;
  handleNew?: () => void;
  handleDelete?: () => void;
  handleEdit?: () => void;
  sectionLabel?: string;
  title?: React.ReactNode;
  provided?: DraggableProvided;
  readOnly?: boolean;
};

export default function ChartCardItemContainer({
                                                 handleMoveUp,
                                                 handleMoveDown,
                                                 handleNew,
                                                 handleDelete,
                                                 handleEdit,
                                                 sectionLabel,
                                                 title,
                                                 provided,
                                                 children,
                                                 readOnly,
                                               }: Props & { children: React.ReactNode }) {
  const chartShowMoreMenu = useChartShowMoreMenu(sectionLabel);
  return (
    <Box
      onMouseMove={chartShowMoreMenu.handleReset}
      onMouseEnter={chartShowMoreMenu.handleReset}
      onMouseLeave={chartShowMoreMenu.handleClose}
    >
      <FormControl
        fullWidth
        sx={{ height: '100%' }}
      >
        <Stack
          sx={{
            p: 1,
          }}
          direction={'row'}
          justifyContent={'space-between'}
          {...provided?.dragHandleProps}
        >
          {title}
          {!readOnly && (
            <Box ref={chartShowMoreMenu.ref}>
              <ChartItemMenu
                open={chartShowMoreMenu.open}
                onMoveDown={handleMoveDown}
                onMoveUp={handleMoveUp}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isOutsideClick={chartShowMoreMenu.isOutsideClick}
                onAdd={handleNew}
                sectionLabel={sectionLabel}
              />
            </Box>
          )}
        </Stack>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {children}
        </Box>
      </FormControl>
    </Box>
  );
}
