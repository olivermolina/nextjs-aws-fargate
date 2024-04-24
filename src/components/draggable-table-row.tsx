import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Table, TableBody, TableRow } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { styled, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import SvgIcon from '@mui/material/SvgIcon';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export const TableCellInput = (props: {
  value: string;
  index: number;
  onChange: (index: number, value: string) => void;
  errors?: { [key: string]: string | boolean | number }[] | null;
  children: React.ReactNode;
  isDragging?: boolean;
  tableBodyRef?: React.RefObject<HTMLTableSectionElement>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(props.value);
  const handleBlur = () => {
    props.onChange(props.index, inputValue);
    setIsEditing(false);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const isErrored = useMemo(() => {
    if (inputValue === '') return true;

    if (props.errors) {
      return props.errors.some((error) => error.index === props.index);
    }

    return false;
  }, [props.errors, inputValue, props.index]);

  useEffect(() => {
    setInputValue(props.value);
  }, [props.value]);

  useEffect(() => {
    if (props.isDragging) {
      setIsEditing(false);
    }
  }, [props.isDragging]);

  return (
    <TableCell
      sx={{
        width: props.isDragging ? Number(props.tableBodyRef?.current?.clientWidth) - 10 : '100%',
      }}
    >
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        spacing={1}
        alignItems={'center'}
      >
        {isEditing || isErrored ? (
          <TextField
            error={isErrored}
            variant={'outlined'}
            value={inputValue}
            onChange={handleOnChange}
            onBlur={handleBlur}
            autoFocus
            fullWidth
            size={'small'}
            sx={{
              height: 35,
            }}
          />
        ) : (
          <Typography
            className="hoverable"
            sx={{
              p: 1,
              width: '100%',
              height: 35,
              justifyContent: 'center',
              backgroundColor: props.isDragging ? 'white' : 'transparent',
            }}
            onClick={() => setIsEditing(true)}
          >
            {inputValue}
          </Typography>
        )}

        {props.children}
      </Stack>
    </TableCell>
  );
};

interface Props {
  items: any[];
  onSetItems?: (items: any[]) => void;
  errors?: { [key: string]: string | boolean | number }[] | null;
  clearErrors?: () => void;
  columnLabel?: string;
}

export default function DraggableTableRow(props: Props) {
  const [items, setItems] = useState<any[]>(props.items);
  const theme = useTheme();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
    props.onSetItems?.(newItems);
  };

  const handleRemoveRow = (index: number) => {
    const newItems = Array.from(items);
    newItems.splice(index, 1);

    if (newItems.length === 0) {
      newItems.push('New...');
    }

    setItems(newItems);
    props.onSetItems?.(newItems);
    props.clearErrors?.();
  };

  const handleAddRow = (index: number) => {
    const newItems = Array.from(items);
    // Insert a new item below the current item
    newItems.splice(index + 1, 0, 'New...');
    setItems(newItems);
    props.onSetItems?.(newItems);
    props.clearErrors?.();
  };

  const onChange = (index: number, value: string) => {
    const newItems = Array.from(items);
    newItems[index] = value;
    setItems(newItems);
    props.onSetItems?.(newItems);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="draggable-table">
        {(droppableProvided) => (
          <Table
            ref={droppableProvided.innerRef}
            sx={{
              px: 1,
              pb: 2,
              mt: 1,
              width: '100%',
              border: `1px solid ${theme.palette.neutral[200]}`,
            }}
            {...droppableProvided.droppableProps}
          >
            <TableHead>
              <StyledTableRow>
                <TableCell align="left">{props.columnLabel || 'Options'}</TableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody ref={tableBodyRef}>
              {Array.isArray(items) &&
                items.map((item, index) => (
                  <Draggable
                    key={`item-${index}`}
                    draggableId={`item-${index}`}
                    index={index}
                  >
                    {(draggableProvided, snapshot) => (
                      <TableRow
                        id={`item-${index}`} // Assign an id to each item
                        ref={draggableProvided.innerRef}
                        sx={{
                          width: '100%',
                          px: snapshot.isDragging ? 0 : 2,
                          backgroundColor: snapshot.isDragging
                            ? theme.palette.action.hover
                            : 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            '& .hoverable': {
                              // Add this line
                              backgroundColor: 'white',
                            },
                          },
                          ...(snapshot.isDragging && {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }),
                        }}
                        {...draggableProvided.draggableProps} // Spread draggableProps here
                      >
                        <TableCellInput
                          value={item}
                          onChange={onChange}
                          index={index}
                          errors={props.errors}
                          isDragging={snapshot.isDragging}
                          tableBodyRef={tableBodyRef}
                        >
                          <Stack direction={'row'}>
                            <Tooltip title={'Add row below'}>
                              <IconButton
                                edge="end"
                                aria-label="add"
                                size={'small'}
                                onClick={() => handleAddRow(index)}
                              >
                                <SvgIcon>
                                  <AddIcon
                                    fontSize={'inherit'}
                                    color={'primary'}
                                  />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={'Remove row'}>
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                size={'small'}
                                onClick={() => handleRemoveRow(index)}
                              >
                                <SvgIcon>
                                  <DeleteIcon
                                    fontSize={'inherit'}
                                    color={'error'}
                                  />
                                </SvgIcon>
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              edge="end"
                              aria-label="drag"
                              size={'small'}
                              {...draggableProvided.dragHandleProps}
                            >
                              <SvgIcon>
                                <DragIndicatorIcon fontSize={'inherit'} />
                              </SvgIcon>
                            </IconButton>
                          </Stack>
                        </TableCellInput>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
              {droppableProvided.placeholder}
            </TableBody>
          </Table>
        )}
      </Droppable>
    </DragDropContext>
  );
}
