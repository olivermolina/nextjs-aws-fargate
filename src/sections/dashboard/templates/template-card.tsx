import type { FC } from 'react';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/paths';
import Chip from '@mui/material/Chip';
import { Template } from '@prisma/client';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DotsVerticalIcon from '@untitled-ui/icons-react/build/esm/DotsVertical';
import { usePopover } from '../../../hooks/use-popover';
import { TemplateMenu } from './template-menu';
import { TemplateDeleteModal } from './template-delete-modal';
import { useDialog } from '../../../hooks/use-dialog';
import { TemplateShareModal } from './template-share-modal';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';

interface TemplateCardProps {
  template: Template;
  handleEditTemplate: (template: Template) => void;
  handleDeleteTemplate: (template: Template) => void;
  handlePublishTemplate: (template: Template) => void;
  deleteIsLoading?: boolean;
  tags: string[];
}

export const TemplateCard: FC<TemplateCardProps> = (props) => {
  const popover = usePopover<HTMLButtonElement>();
  const {
    template,
    handleEditTemplate,
    handleDeleteTemplate,
    handlePublishTemplate,
    deleteIsLoading,
    tags,
  } = props;
  const dialog = useDialog();
  const shareDialog = useDialog<Template>();
  const { data: patients } = trpc.user.patientListOptions.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const mutation = trpc.template.share.useMutation();

  const handleShareSubmit = async (templateId: string, patientIds: string[]) => {
    try {
      await mutation.mutateAsync({
        templateId,
        patientIds,
      });
      shareDialog.handleClose();
      toast.success('Template shared successfully');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent sx={{ height: 220, overflow: 'hidden' }}>
          <div dangerouslySetInnerHTML={{ __html: template.content }} />
        </CardContent>
        <Divider />
        <CardContent>
          <Stack
            direction={'row'}
            justifyContent={'space-between'}
          >
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.dashboard.templates}
              underline="none"
              variant="subtitle1"
            >
              {template.title}
            </Link>
            <IconButton
              onClick={popover.handleOpen}
              ref={popover.anchorRef}
            >
              <SvgIcon>
                <DotsVerticalIcon />
              </SvgIcon>
            </IconButton>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
            variant="body2"
          >
            {template.description}
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ mt: 1 }}
          >
            {template.tags.map((tag) => (
              <Chip
                key={tag}
                label={tags.find((option) => option === tag) || 'Other'}
              />
            ))}
          </Stack>
        </CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 1,
          }}
        >
          <Button
            color="inherit"
            endIcon={
              <SvgIcon>
                <ArrowRightIcon />
              </SvgIcon>
            }
            onClick={() => console.log('Use template')}
          >
            Use
          </Button>
        </Box>
      </Card>
      <TemplateMenu
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        onEdit={() => handleEditTemplate(template)}
        open={popover.open}
        onPublish={() => handlePublishTemplate(template)}
        onDelete={dialog.handleOpen}
        onShare={() => shareDialog.handleOpen(template)}
      />

      <TemplateDeleteModal
        {...dialog}
        handleSubmit={() => {
          dialog.handleClose();
          handleDeleteTemplate(template);
        }}
        isSubmitting={deleteIsLoading}
        onClose={dialog.handleClose}
      />
      <TemplateShareModal
        {...shareDialog}
        handleSubmit={handleShareSubmit}
        isSubmitting={mutation.isLoading}
        onClose={shareDialog.handleClose}
        template={shareDialog.data}
        patients={patients}
      />
    </>
  );
};
