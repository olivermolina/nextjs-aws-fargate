'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { FileUploader } from 'src/sections/dashboard/file-manager/file-uploader';
import { ItemDrawer } from 'src/sections/patient/file-manager/item-drawer';

import { ItemList } from 'src/sections/dashboard/file-manager/item-list';
import { ItemSearch } from 'src/sections/dashboard/file-manager/item-search';
import { FileWithUser } from 'src/types/user';
import { useItemsSearch, useItemsStore, View } from 'src/hooks/use-item-store';

import { useAuth } from 'src/hooks/use-auth';
import { useFileUploader } from '../../../hooks/use-file-uploader';
import Link from '@mui/material/Link';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import { getInitials } from '../../../utils/get-initials';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import { useSearchParams } from '../../../hooks/use-search-params';

const useCurrentItem = (items: FileWithUser[], itemId?: string): FileWithUser | undefined => {
  return useMemo((): FileWithUser | undefined => {
    if (!itemId) {
      return undefined;
    }

    return items.find((item) => item.id === itemId);
  }, [items, itemId]);
};

const Page = () => {
  const settings = useSettings();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const itemsSearch = useItemsSearch();
  const { user } = useAuth();
  const itemsStore = useItemsStore(itemsSearch.state, user?.id);
  const [view, setView] = useState<View>('grid');
  const uploadDialog = useDialog();
  const detailsDialog = useDialog<string>();
  const currentItem = useCurrentItem(itemsStore.items, detailsDialog.data);
  const fileUploader = useFileUploader(itemsStore.refetch, user?.id);
  const { replaceSearchParams } = useUpdateSearchParams();

  const handleOpenFolder = (folderId?: string) => {
    replaceSearchParams({
      folderId,
      id: undefined,
    });
  };
  const userInitials = getInitials(getUserFullName(user));

  usePageView();

  const handleDelete = useCallback(
    (itemId: string): void => {
      detailsDialog.handleClose();
      itemsStore.handleDelete(itemId);
    },
    [detailsDialog, itemsStore]
  );

  useEffect(() => {
    if (id && itemsStore.items.length > 0) {
      detailsDialog.handleOpen(id);
    }
  }, [id, itemsStore.items]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Grid
            container
            spacing={{
              xs: 3,
              lg: 4,
            }}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">File Manager</Typography>
                </div>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Button
                    onClick={uploadDialog.handleOpen}
                    startIcon={
                      <SvgIcon>
                        <Upload01Icon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Upload
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid xs={12}>
              <Stack
                spacing={{
                  xs: 3,
                  lg: 4,
                }}
              >
                <ItemSearch
                  onFiltersChange={itemsSearch.handleFiltersChange}
                  onSortChange={itemsSearch.handleSortChange}
                  onViewChange={setView}
                  sortBy={itemsSearch.state.sortBy}
                  sortDir={itemsSearch.state.sortDir}
                  view={view}
                />
                {itemsStore.selectedFolderId && (
                  <Link
                    color="text.primary"
                    component={'button'}
                    onClick={() => handleOpenFolder()}
                    sx={{
                      alignItems: 'center',
                      display: 'inline-flex',
                      mt: 1,
                    }}
                    underline="hover"
                  >
                    <SvgIcon sx={{ mr: 1 }}>
                      <ArrowLeftIcon />
                    </SvgIcon>
                    <Typography variant="subtitle2">Back</Typography>
                  </Link>
                )}
                <ItemList
                  count={itemsStore.itemsCount}
                  items={itemsStore.items}
                  onDelete={handleDelete}
                  onOpen={detailsDialog.handleOpen}
                  onPageChange={itemsSearch.handlePageChange}
                  onRowsPerPageChange={itemsSearch.handleRowsPerPageChange}
                  page={itemsSearch.state.page}
                  rowsPerPage={itemsSearch.state.rowsPerPage}
                  view={view}
                  openFolder={handleOpenFolder}
                  isSubFiles={!!itemsStore.selectedFolderId}
                  userInitials={userInitials}
                  userId={user?.id}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ItemDrawer
        item={currentItem}
        onClose={() => {
          detailsDialog.handleClose();
          replaceSearchParams({
            id: undefined,
          });
        }}
        onDelete={handleDelete}
        open={detailsDialog.open}
        isSubFiles={!!itemsStore.selectedFolderId}
      />
      <FileUploader
        {...fileUploader}
        onClose={uploadDialog.handleClose}
        open={uploadDialog.open}
      />
    </>
  );
};

export default Page;
