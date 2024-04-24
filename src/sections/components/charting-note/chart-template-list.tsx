import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArticleIcon from '@mui/icons-material/Article';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { trpc } from '../../../app/_trpc/client';
import { Skeleton } from '@mui/material';
import { ChartTemplate } from '@prisma/client';

type GridItemProps = {
  key: string;
  label: string;
  description: string;
  onSelectItem: () => void;
  patientId: string;
  chartId?: string;
  order?: number | string;
  index: number;
};

const GridItem: React.FC<GridItemProps> = ({ key, label, description, onSelectItem, index }) => (
  <Grid
    item
    xs={12}
    md={6}
    lg={4}
    key={key}
    sx={{
      pr: {
        xs: 0,
        md: (index + 1) % 2 === 0 ? 0 : 2,
        lg: (index + 1) % 3 === 0 ? 0 : 2,
      },
      pb: 2,
    }}
  >
    <Stack
      direction={'row'}
      spacing={2}
      sx={{
        cursor: 'pointer',
        padding: 2,
        border: 1,
        borderColor: 'neutral.200',
        borderRadius: 1,
        height: '100%',
        '&:hover': {
          backgroundColor: 'neutral.100',
        },
        '&:hover > .MuiBox-root': {
          backgroundColor: 'neutral.200',
        },
      }}
      justifyContent="flex-start"
      alignItems="flex-start"
      onClick={onSelectItem}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'neutral.100',
          p: 1,
          borderRadius: 0.5,
        }}
      >
        <SvgIcon
          sx={{
            color: 'primary.main',
          }}
          fontSize={'medium'}
        >
          <ArticleIcon />
        </SvgIcon>
      </Box>

      <Stack spacing={0.5}>
        <Typography variant={'body1'}>{label}</Typography>
        <Typography
          variant={'caption'}
          color={'text.secondary'}
        >
          {description}
        </Typography>
      </Stack>
    </Stack>
  </Grid>
);

type ChartTemplateListProps = {
  patientId: string;
  onSelectItem: (chartTemplate: ChartTemplate) => void;
  chartId?: string;
  order?: number | string;
};

export default function ChartTemplateList(props: ChartTemplateListProps) {
  const { data, isLoading } = trpc.chart.templateList.useQuery();

  const { onSelectItem, patientId, chartId, order } = props;

  if (isLoading)
    return (
      <Grid container>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          sx={{
            pb: 2,
            pr: {
              xs: 0,
              md: 2,
            },
          }}
        >
          <Skeleton
            variant="rectangular"
            height={100}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          sx={{
            pr: {
              xs: 0,
              lg: 2,
            },
            pb: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            height={100}
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          sx={{
            pr: {
              xs: 0,
              md: 2,
              lg: 0,
            },
            pb: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            height={100}
          />
        </Grid>
      </Grid>
    );

  if (!data || data.length === 0) {
    return (
      <Grid
        container
        sx={{
          height: 250,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant={'body1'}
          color={'text.secondary'}
          sx={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          No templates found
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container>
      {data.map((item, i) => (
        <GridItem
          label={item.title}
          description={getUserFullName(item.created_by)}
          key={item.id}
          onSelectItem={() => onSelectItem(item)}
          patientId={patientId}
          chartId={chartId}
          order={order}
          index={i}
        />
      ))}
    </Grid>
  );
}
