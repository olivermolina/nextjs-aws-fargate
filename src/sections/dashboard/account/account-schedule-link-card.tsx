import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import SvgIcon from '@mui/material/SvgIcon';
import LinkIcon from '@mui/icons-material/Link';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/Info';
import FormControl from '@mui/material/FormControl';
import { FormHelperText, Input } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CardActions from '@mui/material/CardActions';
import toast from 'react-hot-toast';
import { useScheduleLinkSettings } from '../../../hooks/use-schedule-link-settings';

const BASE_DOMAIN = 'book.lunahealth.app/'; // Non-modifiable part of the link

type Props = {
  scheduleLinkSettings: ReturnType<typeof useScheduleLinkSettings>;
};

export default function AccountScheduleLinkCard(props: Props) {
  const { scheduleLinkSettings } = props;
  // Function to copy the scheduling link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`${BASE_DOMAIN}${scheduleLinkSettings.schedulingLink}`)
      .then(() => {
        toast.success('Link copied to clipboard!');
      });
  };

  return (
    <form
      onSubmit={scheduleLinkSettings.handleSubmit(scheduleLinkSettings.handleSchedulingLinkSubmit)}
    >
      <Card
        sx={{
          paddingTop: 0,
          width: '100%', // Use 100% width for full container width
          minHeight: 400,
        }}
      >
        <CardHeader
          title={
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
            >
              <SvgIcon>
                <LinkIcon />
              </SvgIcon>
              <Typography variant="h6">Scheduling Link</Typography>
            </Stack>
          }
          subheader={
            <Stack
              direction={'row'}
              justifyContent="flex-start"
              alignItems="center"
              spacing={2}
              sx={{ backgroundColor: '#ece6fb', p: 1, borderRadius: 0.5, mt: 1 }}
            >
              <InfoIcon color={'primary'} />
              <Typography variant={'caption'}>
                This link will be used by existing and new patients to schedule appointments.
              </Typography>
            </Stack>
          }
          action={
            !scheduleLinkSettings.schedulingLinkEditMode && (
              <Button onClick={scheduleLinkSettings.toggleSchedulingLinkEditMode}>
                <Typography
                  sx={{
                    color: (theme) => theme.palette.primary.main,
                    textTransform: 'none',
                  }}
                  variant="button"
                >
                  Edit
                </Typography>
              </Button>
            )
          }
        />
        <CardContent>
          {scheduleLinkSettings.schedulingLinkEditMode ? (
            // Editable State
            <Stack
              spacing={2}
              direction="row"
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ marginRight: 2 }}
              >
                {BASE_DOMAIN}
              </Typography>
              <FormControl
                variant="outlined"
                sx={{ width: '60%' }}
                error={
                  (!!scheduleLinkSettings.errors.slug || !scheduleLinkSettings.isAvailable) &&
                  !scheduleLinkSettings.isLoading
                }
              >
                <Input
                  id="scheduling-slug"
                  value={scheduleLinkSettings.schedulingLink}
                  aria-describedby="scheduling-slug-text"
                  fullWidth
                  {...scheduleLinkSettings.register('slug')}
                  endAdornment={
                    <>
                      {scheduleLinkSettings.isLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '150px' }}>
                          <CircularProgress size={20} />
                          <Typography variant="caption">Checking unique name</Typography>
                        </Box>
                      )}
                      {!scheduleLinkSettings.isLoading &&
                        scheduleLinkSettings.isAvailable &&
                        scheduleLinkSettings.schedulingLink && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'success.main' }}
                          >
                            Available
                          </Typography>
                        )}
                      {!scheduleLinkSettings.isLoading && !scheduleLinkSettings.isAvailable && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'error.main' }}
                        >
                          Not Available
                        </Typography>
                      )}
                    </>
                  }
                />
                <FormHelperText id="scheduling-slug-text">
                  {`${
                    scheduleLinkSettings.errors?.slug?.message ||
                    'Enter the unique slug for your scheduling link.'
                  }`}
                </FormHelperText>
              </FormControl>
            </Stack>
          ) : (
            // Non-editable State
            <Stack
              spacing={2}
              direction="row"
              alignItems="center"
            >
              <Link
                href={`${BASE_DOMAIN}${scheduleLinkSettings.schedulingLink}`}
                target="_blank"
                variant="body1"
                sx={{ marginRight: 2 }}
              >
                {`${BASE_DOMAIN}${scheduleLinkSettings.schedulingLink}`}
              </Link>
              <IconButton
                onClick={copyToClipboard}
                size="small"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </CardContent>
        {scheduleLinkSettings.schedulingLinkEditMode && (
          <CardActions>
            <span style={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              onClick={scheduleLinkSettings.toggleSchedulingLinkEditMode}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={scheduleLinkSettings.isSubmitting || !scheduleLinkSettings.isAvailable}
            >
              Save Link
              {scheduleLinkSettings.isSubmitting && (
                <CircularProgress
                  sx={{ ml: 1 }}
                  size={20}
                />
              )}
            </Button>
          </CardActions>
        )}
      </Card>
    </form>
  );
}
