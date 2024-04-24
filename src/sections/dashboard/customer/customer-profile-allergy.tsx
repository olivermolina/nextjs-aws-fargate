import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';

import AddIcon from '@mui/icons-material/Add';
import { CustomerProfileAllergyModal } from './customer-profile-allergy-modal';
import { useDialog } from '../../../hooks/use-dialog';
import { AllergyStatus } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import { AllergyInput } from '../../../utils/zod-schemas/allergy';
import { Skeleton } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import { useDeleteAllergy } from '../../../hooks/use-delete-allergy';
import React from 'react';

type Props = {
  id: string;
};

function CustomerProfileAllergy(props: Props) {
  const { id } = props;
  const dialog = useDialog<AllergyInput>();
  const { data: allergies, isLoading } = trpc.allergy.list.useQuery(
    {
      userId: id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const deleteAllergy = useDeleteAllergy(id);

  const handleNewAllergy = () => {
    dialog.handleOpen({
      id: 'new',
      user_id: id,
      name: '',
      reaction: '',
      status: AllergyStatus.ACTIVE,
      onset_date: new Date(),
    });
  };

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
              sx={{ color: 'error.main' }}
            >
              <Skeleton width={150} />
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {allergies?.map((allergy) => (
          <ListItem
            key={allergy.id}
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
                onClick={() => deleteAllergy.onDiscard(allergy.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => dialog.handleOpen(allergy)}>
              <ListItemText
                primary={allergy.name}
                primaryTypographyProps={{
                  sx: {
                    color: 'error.main',
                    fontSize: 12,
                  },
                }}
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
            onClick={handleNewAllergy}
          >
            <Typography variant={'caption'}>Add allergy</Typography>
          </Button>
        </ListItem>
      </List>
      <CustomerProfileAllergyModal
        userId={id}
        defaultValues={dialog.data}
        open={dialog.open}
        handleClose={dialog.handleClose}
        handleNewAllergy={handleNewAllergy}
      />
    </>
  );
}

export default React.memo(CustomerProfileAllergy);
