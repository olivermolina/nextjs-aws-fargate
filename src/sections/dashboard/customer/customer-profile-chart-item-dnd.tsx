import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import CustomerProfileChartItem, { ProfileChartItemType } from './customer-profile-chart-item';
import Stack from '@mui/material/Stack';
import sortBy from 'lodash/sortBy';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import CustomItem from '../../../icons/untitled-ui/duocolor/custom-item';
import Box from '@mui/material/Box';
import { trpc } from '../../../app/_trpc/client';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';

type Props = {
  items: ProfileChartItemType[];
  handleNew: (order: number) => void;
  movedItemRef: React.MutableRefObject<number | null>;
};

const reorder = (list: ProfileChartItemType[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function CustomerProfileChartItemDnd(props: Props) {
  const mutation = trpc.chart.saveChartItemOrder.useMutation();
  const saveOrder = async (items: { id: string; order: number }[]) => {
    try {
      await mutation.mutateAsync(items);
    } catch (e) {
      console.error(e);
    }
  };

  const [state, setState] = useState({ items: props.items });

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const items = reorder(state.items || [], result.source.index, result.destination.index);

    setState({ items });
    saveOrder(
      items.map((item, index) => {
        return {
          id: item.id,
          order: index + 1,
        };
      })
    );
    props.movedItemRef.current = result.destination.index;
  }

  // Function to move item up
  const moveItemUp = (index: number) => {
    if (index === 0) return; // If it's the first item, it can't be moved up

    const newItems = [...state.items];
    const item = newItems[index];
    newItems.splice(index, 1); // Remove item from current position
    newItems.splice(index - 1, 0, item); // Insert item at new position

    setState({ items: newItems });
    saveOrder(
      newItems.map((item, index) => {
        return {
          id: item.id,
          order: index + 1,
        };
      })
    );
    props.movedItemRef.current = index - 1;
  };

  // Function to move item down
  const moveItemDown = (index: number) => {
    if (index === state.items.length - 1) return; // If it's the last item, it can't be moved down

    const newItems = [...state.items];
    const item = newItems[index];
    newItems.splice(index, 1); // Remove item from current position
    newItems.splice(index + 1, 0, item); // Insert item at new position

    setState({ items: newItems });
    saveOrder(
      newItems.map((item, index) => {
        return {
          id: item.id,
          order: index + 1,
        };
      })
    );
    props.movedItemRef.current = index + 1;
  };

  const onAddNew = useCallback(
    (order: number) => {
      props.handleNew(order);
      props.movedItemRef.current = null;
    },
    [state.items, props.items],
  );

  const removeMoveItemRef = () => {
    props.movedItemRef.current = null;
  };

  const items = useMemo(() => sortBy(props.items, 'order'), [props.items]);

  useEffect(() => {
    setState({ items: items });
  }, [items]);

  useEffect(() => {
    // Scroll to moved item
    const element = document.getElementById(`item-${props.movedItemRef.current}`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [props.movedItemRef.current, items]);

  if (state.items.length === 0) {
    return (
      <Stack
        alignItems={'center'}
        justifyContent={'center'}
        spacing={1}
        sx={{
          height: '100%',
        }}
      >
        <Typography
          variant={'h6'}
          color={'text.secondary'}
        >
          Add elements or Template
        </Typography>
        <Button onClick={() => onAddNew(0)}>
          <SvgIcon color={'primary'}>
            <CustomItem />
          </SvgIcon>
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        px: 1,
        pb: 1,
      }}
    >
      <Box
        sx={{
          m: 2,
          height: '100%',
          borderRadius: 1,
          boxShadow:
            '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)',
        }}
      >
        <Typography
          sx={{
            backgroundColor: 'neutral.100',
            p: 2,
            '&:hover': {
              cursor: 'default',
            },
          }}
          variant={'h6'}
        >
          Chart
        </Typography>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <List
                ref={provided.innerRef}
                sx={{
                  px: 1,
                  pb: 2,
                  mt: 1,
                  width: '100%',
                }}
                {...provided.droppableProps}
              >
                <TransitionGroup>
                  {Array.isArray(state.items) &&
                    state.items.map((item, index) => (
                      <Collapse
                        key={item.id}
                        timeout={500}
                        easing={'ease-in-out'}
                      >
                        <ListItem
                          sx={{
                            width: '100%',
                          }}
                        >
                          <CustomerProfileChartItem
                            key={item.id}
                            item={item}
                            index={index}
                            itemLength={props.items.length}
                            moveItemDown={() => moveItemDown(index)}
                            moveItemUp={() => moveItemUp(index)}
                            handleNew={() => onAddNew(index)}
                            removeMoveItemRef={removeMoveItemRef}
                          />
                        </ListItem>
                      </Collapse>
                    ))}
                  {provided.placeholder}
                </TransitionGroup>
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Box>
  );
}

export default React.memo(CustomerProfileChartItemDnd);
