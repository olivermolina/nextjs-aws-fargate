import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import React, { ChangeEvent, useCallback, useState } from 'react';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ChartItemsList from './chart-items-list';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import { CreateChartItemInput } from '../../../utils/zod-schemas/chart';
import ChartTemplateList from './chart-template-list';
import { ChartTemplate } from '@prisma/client';

const tabs = [
  { label: 'Items', value: 'items' },
  { label: 'Templates', value: 'templates' },
];

type ChartingNoteModalProps = {
  patientId: string;
  onSelectItem: (input: CreateChartItemInput) => void;
  handleClose: () => void;
  open: boolean;
  type: 'items' | 'templates';
  chartId?: string;
  order?: number | string;
  onSelectTemplateItem: (chartTemplate: ChartTemplate) => void;
};

export default function ChartingNoteModal(props: ChartingNoteModalProps) {
  const {
    onSelectTemplateItem,
    onSelectItem,
    open,
    handleClose,
    type,
    patientId,
    chartId,
    order,
  } = props;
  const [currentTab, setCurrentTab] = useState<string>(type);
  const handleTabsChange = useCallback((event: ChangeEvent<any>, value: string): void => {
    setCurrentTab(value);
  }, []);

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={'md'}
      onClose={handleClose}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            flexGrow: 1,
          }}
          variant={'h6'}
        >
          Add {currentTab === 'items' ? 'Item' : 'Template'}
        </Typography>

        <IconButton onClick={handleClose}>
          <SvgIcon>
            <CloseIcon />
          </SvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: 250,
        }}
      >
        <Stack spacing={2}>
          <Divider />
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            sx={{ mt: 1 }}
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
              />
            ))}
          </Tabs>

          {currentTab === 'items' && (
            <ChartItemsList
              onSelectItem={onSelectItem}
              patientId={patientId}
              chartId={chartId}
              order={order}
            />
          )}
          {currentTab === 'templates' && (
            <ChartTemplateList
              onSelectItem={onSelectTemplateItem}
              patientId={patientId}
              chartId={chartId}
              order={order}
            />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
