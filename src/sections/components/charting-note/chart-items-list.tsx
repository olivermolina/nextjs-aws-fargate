import Grid from '@mui/material/Grid';
import { ChartItemType } from '@prisma/client';
import MessageIcon from '@mui/icons-material/Message';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import ActivityIcon from '@untitled-ui/icons-react/build/esm/Activity';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import DrawIcon from '@mui/icons-material/Draw';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SpineIcon from '../../../icons/untitled-ui/duocolor/spine';
import HeadingIcon from '../../../icons/untitled-ui/duocolor/heading';
import CheckboxesIcon from '../../../icons/untitled-ui/duocolor/checkboxes';
import DropdownIcon from '../../../icons/untitled-ui/duocolor/dropdown';
import TuneIcon from '@mui/icons-material/Tune';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { CreateChartItemInput } from '../../../utils/zod-schemas/chart';
import HistoryIcon from '@mui/icons-material/History';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';

type Item = {
  icon: any;
  label: string;
  description: string;
  isClinicalProfile?: boolean;
  disabled?: boolean;
};

export const chartItemMap: Record<ChartItemType, Item> = {
  CHIEF_COMPLAINT: {
    icon: MessageIcon,
    label: 'Chief Complaint',
    description: 'Record The Chief Complaint or Diagnosis',
  },
  NOTE: {
    icon: TextSnippetIcon,
    label: 'Note',
    description: 'A Plain Text Area To Type Notes.',
  },
  NOTE_EDITOR: {
    icon: WysiwygIcon,
    label: 'Note with Editor',
    description: 'A Text Area With Editor To Type Notes.',
  },
  BODY_CHART: {
    icon: AccessibilityIcon,
    label: 'Body Chart',
    description: 'Draw or Type Notes On the Provided Body Chart or Any Image of Your Choosing',
  },
  SKETCH: {
    icon: DrawIcon,
    label: 'Sketch',
    description:
      'A Blank Canvas To Draw, Sketch Or Write, Ideally With a Stylus On A Touch Screen.',
  },
  FILE: {
    icon: UploadFileIcon,
    label: 'File / Image',
    description: 'Upload Any Type Of File With A Preview of Most Common File Types.',
  },
  SPINE: {
    icon: SpineIcon,
    label: 'Spine',
    description: 'Checkboxes For Each Joint, Sketch On a Spine Diagram, And Notes',
  },
  HEADING: {
    icon: HeadingIcon,
    label: 'Heading',
    description: 'A Simple Heading',
  },
  CHECKBOXES: {
    icon: CheckboxesIcon,
    label: 'Check Boxes',
    description: 'Select One Or More Checkboxes And Optionally Add A Note To Each.',
  },
  DROPDOWN: {
    icon: DropdownIcon,
    label: 'Drop Down',
    description: 'Select One Option From A List Of Options In A Drop Down Menu.',
  },
  RANGE: {
    icon: TuneIcon,
    label: 'Range / Scale',
    description:
      'A Customizable Range / Scale / Slider Allows You to Choose From A Range of Values.',
  },
  VITALS: {
    icon: ActivityIcon,
    label: 'Vitals',
    description: 'Record Weight, Height, Blood Pressure, Respiratory Rate, and BMI.',
    isClinicalProfile: true,
  },
  HISTORY: {
    icon: HistoryIcon,
    label: 'History',
    description: 'Record Medical, Surgical, Family, Social, and Medication History.',
    isClinicalProfile: true,
    disabled: true,
  },
  ALLERGY: {
    icon: VaccinesIcon,
    label: 'Allergies',
    description: 'Record Allergies and Reactions.',
    isClinicalProfile: true,
  },
  PROBLEM: {
    icon: MedicalInformationIcon,
    label: 'Problem List',
    description: 'Record Patient\'s Active and Inactive Problems.',
    isClinicalProfile: true,
  },
};

type GridItemProps = {
  key: string;
  type: ChartItemType;
  icon: any;
  label: string;
  description: string;
  onSelectItem: (input: CreateChartItemInput) => void;
  patientId: string;
  chartId?: string;
  order?: number | string;
  index: number;
};

const GridItem: React.FC<GridItemProps> = ({
                                             key,
                                             icon: Icon,
                                             label,
                                             description,
                                             onSelectItem,
                                             patientId,
                                             chartId,
                                             order,
                                             index,
                                             type,
                                           }) => (
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
      onClick={() =>
        onSelectItem({
          userId: patientId,
          itemType: type as ChartItemType,
          service_datetime: new Date(),
          chartId,
          order: typeof order === 'number' ? order : 1,
        })
      }
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
          <Icon />
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

type ChartItemsListProps = {
  patientId: string;
  onSelectItem: (input: CreateChartItemInput) => void;
  chartId?: string;
  order?: number | string;
};

const defaultElements = Object.entries(chartItemMap).filter(
  ([, { isClinicalProfile, disabled }]) => !isClinicalProfile && !disabled,
);
const clinicalProfileElements = Object.entries(chartItemMap).filter(
  ([, { isClinicalProfile, disabled }]) => isClinicalProfile && !disabled,
);

export default function ChartItemsList(props: ChartItemsListProps) {
  const { onSelectItem, patientId, chartId, order } = props;

  return (
    <Grid container>
      {defaultElements.map(([key, item], i) => (
        <GridItem
          key={key}
          {...item}
          type={key as ChartItemType}
          onSelectItem={onSelectItem}
          patientId={patientId}
          chartId={chartId}
          order={order}
          index={i}
        />
      ))}

      <Grid
        item
        xs={12}
        sx={{
          pt: 4,
          pb: 2,
        }}
      >
        <Typography variant={'h6'}>Clinical Profile</Typography>
      </Grid>
      {clinicalProfileElements.map(([key, item], i) => (
        <GridItem
          key={key}
          {...item}
          type={key as ChartItemType}
          onSelectItem={onSelectItem}
          patientId={patientId}
          chartId={chartId}
          order={order}
          index={i}
        />
      ))}
    </Grid>
  );
}
