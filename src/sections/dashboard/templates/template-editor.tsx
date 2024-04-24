import React, { FC, useState } from 'react';
import Expand01Icon from '@untitled-ui/icons-react/build/esm/Expand01';
import Image01Icon from '@untitled-ui/icons-react/build/esm/Image01';
import Minimize01Icon from '@untitled-ui/icons-react/build/esm/Minimize01';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Portal from '@mui/material/Portal';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TableChartIcon from '@mui/icons-material/TableChart';

import { QuillEditor } from 'src/components/quill-editor';
import { Controller, useFormContext } from 'react-hook-form';
import { TemplateInput } from '../../../utils/zod-schemas/template';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import Chip from '@mui/material/Chip';
import TemplateTagsMenu from './template-tags-menu';
import { TemplateManageTags } from './template-manage-tags';
import { useDialog } from '../../../hooks/use-dialog';

interface TemplateEditorProps {
  maximize?: boolean;
  onClose?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  open?: boolean;
  onSubmit: (data: TemplateInput) => void;
  tags: string[];
  handleSaveTag?: (tag: string) => void;
  addIsLoading?: boolean;
  handleDeleteTags?: (tags: string[]) => void;
  deleteIsLoading?: boolean;
}

export const TemplateEditor: FC<TemplateEditorProps> = (props) => {
  const {
    maximize = false,
    onClose,
    onMaximize,
    onMinimize,
    open = false,
    onSubmit,
    tags,
    handleSaveTag,
    addIsLoading,
    handleDeleteTags,
    deleteIsLoading,
  } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openTags = Boolean(anchorEl);
  const manageTagsDialog = useDialog();

  const {
    register,
    formState: { errors, isDirty, isSubmitting },
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
  } = useFormContext<TemplateInput>();

  const handleToggle = (value: string) => () => {
    const checkedTags = getValues('tags') || [];
    const currentIndex = checkedTags.indexOf(value);
    const newChecked = [...checkedTags];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setValue('tags', newChecked);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const watchTitle = watch('title');
  const watchTags = watch('tags');

  if (!open) {
    return null;
  }

  return (
    <Portal>
      <Backdrop open={maximize} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          sx={{
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            margin: 3,
            maxHeight: (theme) => `calc(100% - ${theme.spacing(6)})`,
            maxWidth: (theme) => `calc(100% - ${theme.spacing(6)})`,
            minHeight: 500,
            outline: 'none',
            position: 'fixed',
            right: 0,
            width: 600,
            zIndex: 1400,
            overflow: 'hidden',
            ...(maximize && {
              borderRadius: 0,
              height: '100%',
              margin: 0,
              maxHeight: '100%',
              maxWidth: '100%',
              width: '100%',
            }),
          }}
          elevation={12}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              px: 2,
              py: 1,
              backgroundColor: 'primary',
            }}
          >
            <Stack
              spacing={1}
              direction={'row'}
              alignItems={'center'}
            >
              <TableChartIcon />
              <Typography variant="h6">{watchTitle || 'Untitled Template'}</Typography>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            {maximize ? (
              <IconButton onClick={onMinimize}>
                <SvgIcon>
                  <Minimize01Icon />
                </SvgIcon>
              </IconButton>
            ) : (
              <IconButton onClick={onMaximize}>
                <SvgIcon>
                  <Expand01Icon />
                </SvgIcon>
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Box>
          <TextField
            fullWidth
            placeholder="Title"
            sx={{
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
            variant={'standard'}
            InputProps={{ disableUnderline: true }}
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            fullWidth
            placeholder="Description"
            sx={{
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
            variant={'standard'}
            InputProps={{ disableUnderline: true }}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <Controller
            control={control}
            name="content"
            defaultValue={''}
            render={({ field }) => {
              return (
                <QuillEditor
                  {...field}
                  placeholder="Start writing to build a template"
                  sx={{
                    border: 'none',
                    flexGrow: 1,
                  }}
                />
              );
            }}
          />

          <Stack
            alignItems="center"
            direction="row"
            flexWrap="wrap"
            gap={1}
            sx={{ p: 1 }}
          >
            {watchTags?.map((tag, index) => (
              <Chip
                key={index}
                label={tags.find((option) => option === tag) || 'Other'}
                onDelete={handleToggle(tag)}
              />
            ))}
          </Stack>

          <Divider />
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={3}
            sx={{ p: 2 }}
          >
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
              <Tooltip title="Attach image">
                <IconButton size="small">
                  <SvgIcon>
                    <Image01Icon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Choose tags">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                  }}
                >
                  <SvgIcon>
                    <LabelRoundedIcon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Stack>
            <div>
              <Button
                type={'submit'}
                variant="contained"
                disabled={isSubmitting || !isDirty}
              >
                Save
                {isSubmitting && (
                  <CircularProgress
                    sx={{ ml: 1 }}
                    size={20}
                  />
                )}
              </Button>
            </div>
          </Stack>
        </Paper>
      </form>
      <TemplateTagsMenu
        tags={tags}
        watchTags={watchTags}
        handleToggle={handleToggle}
        handleClose={handleClose}
        anchorEl={anchorEl}
        openTags={openTags}
        handleOpenManageTags={manageTagsDialog.handleOpen}
        handleAddTag={handleSaveTag}
        addIsLoading={addIsLoading}
      />
      <TemplateManageTags
        tags={tags}
        handleSubmit={handleDeleteTags}
        open={manageTagsDialog.open}
        onClose={manageTagsDialog.handleClose}
        isSubmitting={deleteIsLoading}
      />
    </Portal>
  );
};
