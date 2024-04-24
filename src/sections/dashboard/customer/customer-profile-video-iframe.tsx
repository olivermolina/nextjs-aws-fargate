import React, { useCallback, useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { useAuth } from '../../../hooks/use-auth';
import Box from '@mui/material/Box';
import Draggable from 'react-draggable';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import Stack from '@mui/material/Stack';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { trpc } from '../../../app/_trpc/client';

const MINIMIZE_WIDTH = 500;

type Props = {
  url: string;
  view?: 'minimize' | 'split' | 'default';
  setView?: React.Dispatch<React.SetStateAction<'minimize' | 'split' | 'default'>>;
  consultationId: string;
  setRecording?: React.Dispatch<React.SetStateAction<boolean>>;
  recording?: boolean;
  callFrame: DailyCall | null;
  setCallFrame: React.Dispatch<React.SetStateAction<DailyCall | null>>;
  token?: string;
  autoRecording?: boolean;
};

const CustomerProfileVideoIFrame: React.FC<Props> = ({
                                                       url,
                                                       view = 'default',
                                                       setView,
                                                       consultationId,
                                                       setRecording,
                                                       recording,
                                                       callFrame,
                                                       setCallFrame,
                                                       token,
                                                       autoRecording,
                                                     }) => {
  const callRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const [hasLeft, setHasLeft] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const theme = useTheme();
  const mutation = trpc.consultation.videoCallStarted.useMutation();

  const [position, setPosition] = useState<any>({ x: 0, y: 0 });

  const handleJoin = useCallback(() => {
    if (!callRef.current) return;

    const instance = DailyIframe.getCallInstance();

    const newCallFrame = instance || DailyIframe.createFrame(callRef.current);

    if (!newCallFrame) return;
    newCallFrame.join({
      url,
      token,
      userName: getUserFullName(user),
      showFullscreenButton: true,
      showLeaveButton: true,
      theme: {
        colors: {
          accent: theme.palette.primary.main,
          accentText: theme.palette.primary.contrastText,
          background: '#1c2536',
          backgroundAccent: '#2b3954',
          baseText: theme.palette.primary.contrastText,
          border: '#1c2536',
          mainAreaBg: '#1c2536',
          mainAreaBgAccent: '#2b3954',
          mainAreaText: theme.palette.primary.contrastText,
          supportiveText: theme.palette.primary.contrastText,
        },
      },
    });

    newCallFrame.on('joined-meeting', (e) => {
      setHasJoined(true);
      setHasLeft(false);
      mutation.mutate({ id: consultationId });

      if (autoRecording) {
        newCallFrame.startRecording();
      }
    });

    newCallFrame.on('left-meeting', (e) => {
      setHasLeft(true);
      setHasJoined(false);
      setView?.('default');
      setPosition({ x: 0, y: 0 });
    });

    newCallFrame.on('recording-started', (e) => {
      setRecording?.(true);
    });

    newCallFrame.on('recording-stopped', (e) => {
      setTimeout(() => {
        setRecording?.(false);
      }, 5000);
    });

    setCallFrame(newCallFrame);
    setHasLeft(false);

    return newCallFrame;
  }, [url, callFrame, consultationId, token, autoRecording]);

  useEffect(() => {
    handleJoin();
  }, [url, callFrame]);

  // Cleanup the callFrame when the component is unmounted
  useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [callFrame]);

  useEffect(() => {
    if (view !== 'minimize') {
      setPosition({ x: 0, y: 0 });
    }
  }, [view]);

  return (
    <Draggable
      disabled={view !== 'minimize'}
      position={position}
      bounds={'body'}
      onDrag={(e, data) => {
        setPosition({ x: data.x, y: data.y });
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1c2536',
          width: view === 'minimize' ? MINIMIZE_WIDTH : '100%',
          height: view === 'minimize' ? MINIMIZE_WIDTH : '100%',
          position: 'relative',
          cursor: view === 'minimize' ? 'grab' : 'default',
          maxHeight: view === 'minimize' ? MINIMIZE_WIDTH : window.screen.height,
          pt: recording ? 2 : 0,
        }}
      >
        <Stack
          direction={'row'}
          justifyContent={view === 'minimize' ? 'space-between' : 'center'}
          alignItems={'center'}
          sx={{
            zIndex: 1201,
            position: 'absolute',
            top: view !== 'minimize' ? -20 : -30,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          spacing={1}
        >
          <IconButton
            onClick={() => {
              setPosition({ x: 0, y: 0 });
              setView?.('split');
            }}
            size={view !== 'minimize' ? 'medium' : 'large'}
            sx={{
              backgroundColor: view === 'split' ? theme.palette.primary.main : '#2b3954',
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <VerticalSplitIcon
              sx={{
                color: 'inherit',
              }}
              fontSize={'inherit'}
            />
          </IconButton>

          <IconButton
            onClick={() => {
              setPosition({ x: 0, y: 0 });
              setView?.('default');
            }}
            size={view !== 'minimize' ? 'medium' : 'large'}
            sx={{
              backgroundColor: view === 'default' ? theme.palette.primary.main : '#2b3954',
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <RememberMeIcon
              sx={{
                color: 'inherit',
              }}
              fontSize={'inherit'}
            />
          </IconButton>

          <IconButton
            onClick={() => {
              setPosition({ x: document.body.clientWidth / 2 - MINIMIZE_WIDTH, y: -190 });
              setView?.('minimize');
            }}
            size={view !== 'minimize' ? 'medium' : 'large'}
            sx={{
              backgroundColor: view === 'minimize' ? theme.palette.primary.main : '#2b3954',
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <BrandingWatermarkOutlinedIcon
              sx={{
                color: 'inherit',
              }}
              fontSize={'inherit'}
            />
          </IconButton>

          {view === 'minimize' && (
            <IconButton
              size={'large'}
              sx={{
                color: '#fff',
                backgroundColor: '#2b3954',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  cursor: 'grab',
                },
              }}
            >
              <OpenWithIcon
                sx={{
                  color: 'inherit',
                }}
                fontSize={'inherit'}
              />
            </IconButton>
          )}
        </Stack>

        <Stack
          spacing={1}
          sx={{
            height: '100%',
            width: '100%',
            pt: hasJoined ? 0 : 4,
          }}
        >
          <Box
            ref={callRef}
            sx={{
              height: '100%',
              width: '100%',
            }}
          />
          {hasLeft && (
            <Button
              onClick={handleJoin}
              color={'success'}
            >
              Rejoin
            </Button>
          )}
        </Stack>
      </Box>
    </Draggable>
  );
};

export default CustomerProfileVideoIFrame;
