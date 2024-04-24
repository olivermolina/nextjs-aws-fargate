import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { trpc } from '../../../app/_trpc/client';
import { useDialog } from '../../../hooks/use-dialog';
import { LocationInput } from '../../../utils/zod-schemas/location';
import AccountOrganizationLocationModal from './account-organization-location-modal';
import { LocationType } from '@prisma/client';
import toast from 'react-hot-toast';
import Grid from '@mui/material/Grid';

type Props = {
  hasEditAccess: boolean;
};

export default function AccountOrganizationLocationCard({ hasEditAccess }: Props) {
  const dialog = useDialog<LocationInput>();
  const { data, refetch } = trpc.location.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const createMutation = trpc.location.create.useMutation();
  const updateMutation = trpc.location.update.useMutation();
  const deleteMutation = trpc.location.delete.useMutation();

  const handleSubmit = async (location: LocationInput) => {
    try {
      if (location.id !== 'new') {
        await updateMutation.mutateAsync(location);
      } else {
        await createMutation.mutateAsync(location);
      }
      dialog.handleClose();
      refetch();
      toast.success('Location saved');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error('Invalid location id');
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      dialog.handleClose();
      refetch();
      toast.success('Location deleted');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleNewLocation = () => {
    dialog.handleOpen({
      id: 'new',
      display_name: '',
      value: '',
      type: LocationType.IN_PERSON,
    });
  };

  return (
    <>
      <Card
        sx={{
          minHeight: 400,
        }}
      >
        <CardHeader title="Locations" />
        <CardContent>
          <Stack spacing={2}>
            <Grid
              container
              justifyContent={'space-between'}
              spacing={{ xs: 0, md: 1 }}
              alignItems={'flex-start'}
            >
              {data?.map((location) => (
                <React.Fragment key={location.id}>
                  <Grid
                    item
                    xs={4}
                  >
                    <Stack
                      direction={'row'}
                      alignItems={'center'}
                      spacing={1}
                    >
                      <LocationOnIcon />
                      <Stack>
                        <Typography
                          variant="caption"
                          color={'text.secondary'}
                        >
                          Name
                        </Typography>
                        <Typography
                          sx={{
                            wordWrap: 'break-word',
                          }}
                        >
                          {location.display_name}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    lg={7}
                  >
                    <Stack>
                      <Typography
                        variant="caption"
                        color={'text.secondary'}
                      >
                        Address
                      </Typography>
                      <Typography
                        sx={{
                          wordWrap: 'break-word',
                        }}
                      >
                        {location.value}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    lg={1}
                  >
                    <Button
                      aria-label="edit"
                      onClick={() => dialog.handleOpen(location)}
                      size="small"
                    >
                      Edit
                    </Button>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>

            {hasEditAccess && (
              <Button
                onClick={handleNewLocation}
                sx={{
                  maxWidth: 150,
                }}
                startIcon={
                  <SvgIcon>
                    <AddIcon />
                  </SvgIcon>
                }
              >
                New Location
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
      <AccountOrganizationLocationModal
        location={dialog.data}
        isLoading={createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading}
        open={dialog.open}
        handleClose={dialog.handleClose}
        onSubmit={handleSubmit}
        handleDelete={handleDelete}
      />
    </>
  );
}
