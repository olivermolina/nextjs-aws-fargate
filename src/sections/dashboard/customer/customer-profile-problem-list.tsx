import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';

import AddIcon from '@mui/icons-material/Add';
import { useDialog } from '../../../hooks/use-dialog';
import { ProblemStatus } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import { Skeleton } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import React from 'react';
import { CustomerProfileProblemModal } from './customer-profile-problem-modal';
import { ProblemInput } from '../../../utils/zod-schemas/problem';
import Stack from '@mui/material/Stack';
import dayjs from 'dayjs';
import { useDeleteProblem } from '../../../hooks/use-delete-problem';
import Box from '@mui/material/Box';

const statusMap: Record<ProblemStatus, string> = {
  ACTIVE: 'warning.main',
  CONTROLLED: 'info.main',
  RESOLVED: 'success.main',
};

type Props = {
  id: string;
};

function CustomerProfileProblemList(props: Props) {
  const { id } = props;
  const dialog = useDialog<ProblemInput>();
  const { data: problems, isLoading } = trpc.problem.list.useQuery(
    {
      userId: id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleNew = () => {
    dialog.handleOpen({
      id: 'new',
      user_id: id,
      title: '',
      synopsis: '',
      status: ProblemStatus.ACTIVE,
      diagnostic_date: new Date(),
      code: [],
    });
  };

  const deleteProblem = useDeleteProblem(id);

  if (isLoading) {
    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {Array.from({ length: 3 }).map((i, index) => (
          <ListItem
            key={index}
            disableGutters
          >
            <Typography
              variant="caption"
              sx={{ color: 'error.main', width: '100%' }}
            >
              <Skeleton />
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {problems?.map((problem) => (
          <ListItem
            key={problem.id}
            sx={{
              p: 0,
              '& .MuiListItemSecondaryAction-root': {
                visibility: 'hidden',
              },
              '&:hover': {
                '& .MuiListItemSecondaryAction-root': {
                  visibility: 'visible',
                },
              },
            }}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteProblem.onDiscard(problem.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => dialog.handleOpen(problem)}>
              <ListItemText
                primary={
                  <Stack
                    direction={'row'}
                    spacing={1}
                    justifyContent={'justify-start'}
                    alignItems={'baseline'}
                  >
                    <Typography variant={'subtitle2'}>
                      {dayjs(problem.diagnostic_date).format('YYYY')}
                    </Typography>
                    <Box
                      sx={{
                        bgcolor: statusMap[problem.status],
                        minHeight: 10,
                        minWidth: 10,
                        maxHeight: 10,
                        maxWidth: 10,
                        borderRadius: '50%',
                      }}

                    />
                    <Typography
                      sx={{
                        color: 'primary.main',
                      }}
                      variant={'subtitle1'}
                    >
                      {problem.title}
                    </Typography>
                    {!!problem.code?.length && (
                      <Typography variant={'caption'}>[{problem.code?.join(' ,')}]</Typography>
                    )}
                  </Stack>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disableGutters>
          <Button
            variant={'outlined'}
            startIcon={
              <SvgIcon fontSize={'small'}>
                <AddIcon />
              </SvgIcon>
            }
            color={'primary'}
            size={'small'}
            onClick={handleNew}
          >
            <Typography variant={'caption'}>Add Problem</Typography>
          </Button>
        </ListItem>
      </List>
      <CustomerProfileProblemModal
        userId={id}
        defaultValues={dialog.data}
        open={dialog.open}
        handleClose={dialog.handleClose}
        handleNew={handleNew}
      />
    </>
  );
}

export default React.memo(CustomerProfileProblemList);
