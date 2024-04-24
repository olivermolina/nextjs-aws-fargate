import React, { FC, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { Template } from '@prisma/client';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

import SignatureCanvas from 'react-signature-canvas';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import { useDialog } from '../../hooks/use-dialog';
import { OnboardDocumentModal } from './onboard-document-modal';
import Paper from '@mui/material/Paper';

interface OnboardIntakeConsentProps {
  clinicName?: string;
  consentTemplates: Template[];
  handleBack?: () => void;
  handleNext?: () => void;
  isLoading?: boolean;
  handleSetSignature?: (signature: string | undefined) => void;
}

export const OnboardIntakeConsent: FC<OnboardIntakeConsentProps> = (props) => {
  const { clinicName, consentTemplates, handleBack, handleNext, isLoading, handleSetSignature } =
    props;
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [document, setDocument] = useState({
    title: '',
    contents: '',
  });
  const handleSignatureEnd = () => {
    handleSetSignature?.(sigRef?.current?.toDataURL());
  };
  const dialog = useDialog<string>();

  const clearSignature = () => {
    sigRef?.current?.clear();
    handleSetSignature?.(undefined);
  };

  return (
    <>
      <Stack
        spacing={2}
        sx={{ p: { lg: 2 } }}
      >
        <Typography
          sx={{ pb: 3 }}
          variant="h6"
        >
          Intake consent
        </Typography>

        <Typography variant={'body1'}>
          <p>
            By consenting the enrollment with <strong>{clinicName}</strong> you accept that:
          </p>
          <ol>
            <li>{clinicName} will become your service provider.</li>
            <li>
              <p>Information you have provided is true and correct.</p>
            </li>
            <li>
              <p
                style={{
                  textAlign: 'left',
                }}
              >
                You have read and understood {clinicName}&apos;s{' '}
                {consentTemplates.map((template, index) => (
                  <React.Fragment key={index}>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={() => {
                        setDocument({
                          title: template.title,
                          contents: template.content,
                        });
                        dialog.handleOpen();
                      }}
                      sx={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {template.title}
                    </Link>
                    {index < consentTemplates.length - 1 && ', '}
                  </React.Fragment>
                ))}
                .
              </p>
            </li>
            <li>
              <p>
                You have read and understood the Luna Health&apos;s{' '}
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    setDocument({
                      title: 'Terms of Use',
                      contents: 'Terms of Use contents here',
                    });
                    dialog.handleOpen();
                  }}
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    setDocument({
                      title: 'Privacy Policy',
                      contents: 'Privacy Policy contents here',
                    });
                    dialog.handleOpen();
                  }}
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </li>
          </ol>
        </Typography>

        <Stack>
          <Typography variant={'h6'}>Sign Here:</Typography>
          <Typography
            variant={'caption'}
            sx={{
              color: 'text.secondary',
            }}
          >
            (Click/press down to draw)
          </Typography>
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Paper
              sx={{ p: 0 }}
              elevation={3}
            >
              <SignatureCanvas
                canvasProps={{
                  style: {
                    width: '100%',
                    height: '100%',
                    borderBottom: '1px solid #000',
                  },
                }}
                ref={sigRef}
                onEnd={handleSignatureEnd}
              />
            </Paper>
            <Stack
              direction={'row'}
              alignItems={'baseline'}
              sx={{
                position: 'absolute',
                bottom: 1,
                left: 1,
              }}
            >
              <Tooltip title="Clear">
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={clearSignature}
                  size={'small'}
                >
                  <SvgIcon>
                    <XIcon />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>

        <Stack
          direction={'row'}
          spacing={2}
          justifyContent={'space-between'}
        >
          <Button
            size="large"
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            size="large"
            variant="contained"
            onClick={handleNext}
            disabled={isLoading}
          >
            Next
            {isLoading && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </Stack>
      </Stack>
      <OnboardDocumentModal
        onClose={dialog.handleClose}
        open={dialog.open}
        title={document.title}
        htmlContent={document.contents}
      />
    </>
  );
};
