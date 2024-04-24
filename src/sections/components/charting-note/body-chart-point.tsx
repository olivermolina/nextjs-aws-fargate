import Draggable from 'react-draggable';
import Box from '@mui/material/Box';
import * as React from 'react';

type Props = {
  positionIndex: number;
  id: string;
  defaultPosition?: { x: number; y: number };
  onSavePosition?: (position: { x: number; y: number }, id: string) => void;
  onStart?: () => void;
  readOnly?: boolean;
};

export default function BodyChartPoint({
                                         id,
                                         positionIndex,
                                         onStart,
                                         onSavePosition,
                                         defaultPosition,
                                         readOnly,
                                       }: Props) {
  const [position, setPosition] = React.useState(defaultPosition || { x: 0, y: 0 });

  return (
    <Draggable
      position={position}
      bounds={'parent'}
      onDrag={(e, data) => {
        e.stopPropagation();
        if (readOnly) return;
        setPosition({ x: data.x, y: data.y });
      }}
      onStop={(e, data) => {
        e.stopPropagation();
        if (readOnly) return;
        onSavePosition?.({ x: data.x, y: data.y }, id);
      }}
      onStart={(e) => {
        e.stopPropagation();
        if (readOnly) return;
        onStart?.();
      }}
      disabled={readOnly}
    >
      <Box
        sx={{
          position: 'absolute',
          cursor: readOnly ? 'default' : 'move',
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.primary.contrastText,
          borderRadius: '50%', // This makes the box appear as a circle
          width: 25, // Specify a fixed width
          height: 25, // Specify a fixed height
          display: 'flex', // Set display to flex
          justifyContent: 'center', // Center items horizontally
          alignItems: 'center', // Center items vertically
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {positionIndex + 1}
      </Box>
    </Draggable>
  );
}
