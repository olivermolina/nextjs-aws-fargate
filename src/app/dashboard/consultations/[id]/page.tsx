'use client';

import { format } from 'date-fns';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/components/router-link';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { paths } from 'src/paths';
import { ConsultationSummary } from 'src/sections/dashboard/consultation/consultation-summary';
import { trpc } from 'src/app/_trpc/client';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const { data } = trpc.consultation.get.useQuery(
    {
      id: params.id as string,
    },
    {
      keepPreviousData: true,
    }
  );

  usePageView();

  if (!data) {
    return null;
  }

  const createdAt = format(new Date(data.created_at), 'dd/MM/yyyy HH:mm');

  return (
    <>
      <Seo title="Dashboard: Consultation Details" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <div>
              <Link
                color="text.primary"
                component={RouterLink}
                href={paths.dashboard.consultation.index}
                sx={{
                  alignItems: 'center',
                  display: 'inline-flex',
                }}
                underline="hover"
              >
                <SvgIcon sx={{ mr: 1 }}>
                  <ArrowLeftIcon />
                </SvgIcon>
                <Typography variant="subtitle2">Consultations</Typography>
              </Link>
            </div>
            <div>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={3}
              >
                <Stack spacing={1}>
                  <Typography variant="h4">{data.id}</Typography>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      Placed on
                    </Typography>
                    <SvgIcon color="action">
                      <CalendarIcon />
                    </SvgIcon>
                    <Typography variant="body2">{createdAt}</Typography>
                  </Stack>
                </Stack>
                <div>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={2}
                  >
                    <Button
                      color="inherit"
                      endIcon={
                        <SvgIcon>
                          <Edit02Icon />
                        </SvgIcon>
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      endIcon={
                        <SvgIcon>
                          <ChevronDownIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                    >
                      Action
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </div>
            <ConsultationSummary consultation={data} />
            {/*<OrderItems items={consultation.items || []}/>*/}
            {/*<OrderLogs logs={consultation.logs || []}/>*/}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
