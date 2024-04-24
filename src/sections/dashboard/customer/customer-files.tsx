'use client';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
//import { Seo } from 'src/components/seo';
import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { FileUploader } from 'src/sections/dashboard/file-manager/file-uploader';
import { ItemDrawer } from 'src/sections/dashboard/file-manager/item-drawer';
import { ItemList } from 'src/sections/dashboard/file-manager/item-list';
import { ItemSearch } from 'src/sections/dashboard/file-manager/item-search';
import { FileWithUser } from 'src/types/user';
import { useItemsSearch, useItemsStore, View } from 'src/hooks/use-item-store';
import { useFileUploader } from '../../../hooks/use-file-uploader';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import { User } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { getInitials } from '../../../utils/get-initials';
import { useSearchParams } from '../../../hooks/use-search-params';

const useCurrentItem = (items: FileWithUser[], itemId?: string): FileWithUser | undefined => {
  return useMemo((): FileWithUser | undefined => {
    if (!itemId) {
      return undefined;
    }

    return items.find((item) => item.id === itemId);
  }, [items, itemId]);
};

interface CustomerFilesProps {
  // files?: CustomerFiles[];
  openUpload?: boolean;
  toggleMenuUpload?: () => void;
  hasEditAccess?: boolean;
  patient: User;
}

export const CustomerFiles: FC<CustomerFilesProps> = ({
  openUpload,
  toggleMenuUpload,
  hasEditAccess,
                                                        patient,
}) => {
  const searchParams = useSearchParams();
  const fileId = searchParams.get('id');
  const folderId = searchParams.get('folderId');
  const settings = useSettings();
  const itemsSearch = useItemsSearch();
  const itemsStore = useItemsStore(itemsSearch.state);
  const [view, setView] = useState<View>('list');
  const uploadDialog = useDialog();
  const detailsDialog = useDialog<string>();
  const currentItem = useCurrentItem(itemsStore.items, detailsDialog.data);
  const fileUploader = useFileUploader(itemsStore.refetch);
  const userInitials = getInitials(getUserFullName(patient));

  const { replaceSearchParams } = useUpdateSearchParams();

  usePageView();

  const handleOpenFolder = (folderId?: string) => {
    replaceSearchParams({
      folderId,
      id: undefined,
    });
  };
  const handleDelete = useCallback(
    (itemId: string): void => {
      // This can be triggered from multiple places, ensure drawer is closed.
      detailsDialog.handleClose();
      itemsStore.handleDelete(itemId);
    },
    [detailsDialog, itemsStore]
  );

  useEffect(() => {
    if (openUpload) {
      uploadDialog.handleOpen();
    }
  }, [openUpload]);

  useEffect(() => {
    if (fileId && itemsStore.items.length > 0) {
      detailsDialog.handleOpen(fileId);
    }
  }, [fileId, itemsStore.items]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 0,
        }}
      >
        <Container maxWidth={settings.stretch ? false : 'xl'}>
          <Grid
            container
            spacing={1}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  {/* Add this Box to wrap ItemSearch */}
                  <ItemSearch
                    onFiltersChange={itemsSearch.handleFiltersChange}
                    onSortChange={itemsSearch.handleSortChange}
                    onViewChange={setView}
                    sortBy={itemsSearch.state.sortBy}
                    sortDir={itemsSearch.state.sortDir}
                    view={view}
                  />
                </Box>
                {hasEditAccess && (
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
                )}
              </Stack>
            </Grid>
            {itemsStore.selectedFolderId && (
              <Grid xs={12}>
                <Link
                  color="text.primary"
                  component={'button'}
                  onClick={() => handleOpenFolder('')}
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
              </Grid>
            )}
            <Grid
              xs={12}
              md={12}
            >
              <ItemList
                count={itemsStore.itemsCount}
                items={itemsStore.items}
                onDelete={handleDelete}
                onOpen={detailsDialog.handleOpen}
                openFolder={handleOpenFolder}
                onPageChange={itemsSearch.handlePageChange}
                onRowsPerPageChange={itemsSearch.handleRowsPerPageChange}
                page={itemsSearch.state.page}
                rowsPerPage={itemsSearch.state.rowsPerPage}
                view={view}
                isSubFiles={!!itemsStore.selectedFolderId}
                userInitials={userInitials}
                userId={patient.id}
              />
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
            folderId: folderId || undefined,
          });
        }}
        onDelete={handleDelete}
        open={detailsDialog.open}
        handleShareFile={itemsStore.handleShareFile}
        isSubFiles={!!itemsStore.selectedFolderId}
      />
      <FileUploader
        {...fileUploader}
        onClose={() => {
          uploadDialog.handleClose();
          toggleMenuUpload?.();
        }}
        open={uploadDialog.open}
      />
    </>
  );
};

//export default CustomerFiles;
