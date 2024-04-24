'use client';

import React, { ChangeEvent, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Seo } from 'src/components/seo';
import { useDialog } from 'src/hooks/use-dialog';
import { usePageView } from 'src/hooks/use-page-view';
import { ConsultationDrawer } from 'src/sections/dashboard/consultation/consultation-drawer';
import {
  ConsultationListContainer,
} from 'src/sections/dashboard/consultation/consultation-list-container';
import {
  ConsultationListSearch,
  StateValue,
  StatusMap,
} from 'src/sections/dashboard/consultation/consultation-list-search';
import { ConsultationListTable } from 'src/sections/dashboard/consultation/consultation-list-table';
import { trpc } from 'src/app/_trpc/client';
import { Prisma, RolePermissionLevel } from '@prisma/client';
import { Consultation } from 'src/types/consultation';
import { CalendarEventDialog } from 'src/sections/dashboard/calendar/calendar-event-dialog';
import { CreateDialogData } from '../calendar/page';
import { useStaffsStore } from 'src/hooks/use-staffs-store';
import { usePatientsStore } from 'src/hooks/use-patient-store';
import moment from 'moment-timezone';
import { useServiceStore } from 'src/hooks/use-services-store';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { useSearchParams } from '../../../hooks/use-search-params';
import dayjs from 'dayjs';
import { mapConsultationToCalendarEvent } from '../../../thunks/calendar';

interface Filters {
  query?: string;
  status?: StateValue;
  id?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  staff_ids?: string[];
  locationId?: string;
}

type SortDir = Prisma.SortOrder;

interface ConsultationsSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDir?: SortDir;
}

const useConsultationsSearch = () => {
  const [state, setState] = useState<ConsultationsSearchState>({
    filters: {
      query: undefined,
      status: undefined,
      id: undefined,
      startDate: undefined,
      endDate: undefined,
      staff_ids: undefined,
      locationId: 'all',
    },
    page: 0,
    rowsPerPage: 10,
    sortBy: 'created_at',
    sortDir: Prisma.SortOrder.desc,
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters: {
        ...filters,
        id: undefined,
      },
      page: 0,
      rowsPerPage: 10,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: SortDir): void => {
    setState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        id: undefined,
      },
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        filters: {
          ...prevState.filters,
          id: undefined,
        },
        page,
      }));
    },
    [],
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      filters: {
        ...prevState.filters,
        id: undefined,
      },
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

const useConsultationsStore = (searchState: ConsultationsSearchState) => {
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('id');
  const dialog = useDialog<string>();
  const handleConsultationOpen = useCallback(
    (id: string): void => {
      // Close drawer if is the same order
      if (dialog.open && dialog.data === id) {
        dialog.handleClose();
        return;
      }

      dialog.handleOpen(id);
    },
    [],
  );

  const { data, refetch, isLoading, isFetching } = trpc.consultation.list.useQuery(
    {
      rowsPerPage: searchState.rowsPerPage,
      status: StatusMap[searchState.filters.status || 'all'],
      query: searchState.filters.query,
      page: searchState.page,
      sortDir: searchState.sortDir,
      id: consultationId || searchState.filters.id,
      from: searchState.filters.startDate
        ? dayjs(searchState.filters.startDate).format('YYYY-MM-DD')
        : undefined,
      to: searchState.filters.endDate
        ? dayjs(searchState.filters.endDate).format('YYYY-MM-DD')
        : undefined,
      staff_ids: searchState.filters.staff_ids?.filter((id) => id !== 'all') ?? undefined,
      location_ids:
        searchState.filters.locationId === 'all' ||
        searchState.filters.locationId === 'telemedicine'
          ? undefined
          : searchState.filters.locationId
            ? [searchState.filters.locationId]
            : undefined,
      telemedicine:
        searchState.filters.locationId === 'all'
          ? undefined
          : searchState.filters.locationId === 'telemedicine',
    },
    {
      keepPreviousData: true,
      onSettled: (data) => {
        if (consultationId && !!data?.items?.length) {
          handleConsultationOpen(consultationId);
        }
      },
    }
  );

  return {
    items: (data?.items || []) as Consultation[],
    consultationsCount: data?.meta?.totalRowCount ?? 0,
    refetch,
    isLoading: isLoading || isFetching,
    dialog,
    handleConsultationOpen,
  };
};

const useCurrentConsultation = (
  consultations: Consultation[],
  id?: string,
): Consultation | undefined => {
  return useMemo((): Consultation | undefined => {
    if (!id) {
      return undefined;
    }

    return consultations.find((consultation) => consultation.id === id) as Consultation;
  }, [consultations, id]);
};

const Page = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const consultationSearch = useConsultationsSearch();
  const consultationStore = useConsultationsStore(consultationSearch.state);
  const currentConsultation = useCurrentConsultation(
    consultationStore.items,
    consultationStore.dialog.data,
  );
  const createDialog = useDialog<CreateDialogData>();
  const staffsStore = useStaffsStore();
  const patientStore = usePatientsStore();
  const serviceStore = useServiceStore();
  const permission = useGetPermissionByResource(PermissionResourceEnum.SCHEDULING);
  const hasEditAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.editAccessLevel !== RolePermissionLevel.NONE;
  }, [permission]);

  const updateDialog = useDialog<Consultation>();

  const { data: locations } = trpc.location.list.useQuery(undefined, {
    keepPreviousData: true,
  });

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Order List" />
      <Divider />
      <Box
        component="main"
        ref={rootRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          ref={rootRef}
          sx={{
            bottom: 0,
            display: 'flex',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        >
          <ConsultationListContainer open={consultationStore.dialog.open}>
            <Box sx={{ p: 3 }}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">Consultations</Typography>
                </div>
                {hasEditAccess && (
                  <div>
                    <Button
                      startIcon={
                        <SvgIcon>
                          <PlusIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={() =>
                        createDialog.handleOpen({
                          range: {
                            start: new Date().getTime(),
                            end: new Date().getTime(),
                          },
                        })
                      }
                    >
                      Add
                    </Button>
                  </div>
                )}
              </Stack>
            </Box>
            <Divider />
            <ConsultationListSearch
              onFiltersChange={consultationSearch.handleFiltersChange}
              onSortChange={consultationSearch.handleSortChange}
              sortBy={consultationSearch.state.sortBy}
              sortDir={consultationSearch.state.sortDir}
              staffs={staffsStore.staffs}
              locations={locations}
            />
            <Divider />
            <ConsultationListTable
              count={consultationStore.consultationsCount}
              items={consultationStore.items}
              onPageChange={consultationSearch.handlePageChange}
              onRowsPerPageChange={consultationSearch.handleRowsPerPageChange}
              onSelect={consultationStore.handleConsultationOpen}
              page={consultationSearch.state.page}
              rowsPerPage={consultationSearch.state.rowsPerPage}
              isLoading={consultationStore.isLoading}
            />
          </ConsultationListContainer>
          <ConsultationDrawer
            container={rootRef.current}
            onClose={consultationStore.dialog.handleClose}
            open={consultationStore.dialog.open}
            consultation={currentConsultation}
            handleEdit={(id: string) => {
              if (!currentConsultation) return;
              if (currentConsultation.id !== id) return;
              updateDialog.handleOpen(currentConsultation);
            }}
            refetchList={consultationStore.refetch}
          />
        </Box>
      </Box>

      <CalendarEventDialog
        action="create"
        onAddComplete={() => {
          consultationStore.refetch();
          createDialog.handleClose();
        }}
        onClose={createDialog.handleClose}
        open={createDialog.open}
        range={createDialog.data?.range}
        staffs={staffsStore.staffs}
        patients={patientStore.patients}
        timezone={moment.tz.guess()}
        services={serviceStore.services}
        locations={locations}
      />

      <CalendarEventDialog
        action="update"
        event={updateDialog.data ? mapConsultationToCalendarEvent(updateDialog.data) : undefined}
        onClose={updateDialog.handleClose}
        onDeleteComplete={updateDialog.handleClose}
        onEditComplete={updateDialog.handleClose}
        open={updateDialog.open}
        staffs={staffsStore.staffs}
        patients={patientStore.patients}
        timezone={moment.tz.guess()}
        services={serviceStore.services}
        locations={locations}
      />
    </>
  );
};

export default Page;
