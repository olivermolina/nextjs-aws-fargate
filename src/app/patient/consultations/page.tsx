'use client';

import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
import { Prisma } from '@prisma/client';
import { Consultation } from 'src/types/consultation';

import { useAuth } from 'src/hooks/use-auth';
import { useSearchParams } from '../../../hooks/use-search-params';

interface Filters {
  query?: string;
  status?: StateValue;
  id?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  staff_ids?: string[];
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
    },
    page: 0,
    rowsPerPage: 5,
    sortBy: 'created_at',
    sortDir: Prisma.SortOrder.desc,
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 0,
      rowsPerPage: 5,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: SortDir): void => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
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
  const { user } = useAuth();

  const userId = user?.id ?? null;

  const { data, refetch } = trpc.consultation.list.useQuery(
    {
      rowsPerPage: searchState.rowsPerPage,
      status: StatusMap[searchState.filters.status || 'all'],
      query: searchState.filters.query,
      page: searchState.page,
      sortDir: searchState.sortDir,
      userId: userId || undefined,
    },
    {
      keepPreviousData: true,
    }
  );

  const flatData = useMemo(() => {
    const items = data?.items;
    return (items || []) as Consultation[];
  }, [data]);

  const consultationsCount = data?.meta?.totalRowCount ?? 0;

  return {
    items: flatData,
    consultationsCount,
    refetch,
  };
};

const useCurrentConsultation = (
  consultations: Consultation[],
  id?: string
): Consultation | undefined => {
  return useMemo((): Consultation | undefined => {
    if (!id) {
      return undefined;
    }

    return consultations.find((consultation) => consultation.id === id) as Consultation;
  }, [consultations, id]);
};

const Page = () => {
  const searchParams = useSearchParams();
  const consultationId = searchParams.get('id');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const consultationSearch = useConsultationsSearch();
  const consultationStore = useConsultationsStore(consultationSearch.state);
  const dialog = useDialog<string>();
  const currentOrder = useCurrentConsultation(consultationStore.items, dialog.data);
  //const createDialog = useDialog<CreateDialogData>();
  // const staffsStore = useStaffsStore();
  // const patientStore = usePatientsStore();

  usePageView();

  const handleConsultationOpen = useCallback(
    (id: string): void => {
      // Close drawer if is the same order

      if (dialog.open && dialog.data === id) {
        dialog.handleClose();
        return;
      }

      dialog.handleOpen(id);
    },
    [dialog]
  );

  useEffect(() => {
    if (consultationId) {
      consultationSearch.handleFiltersChange({ id: consultationId });
    }

    if (consultationId && consultationStore.items.length > 0) {
      handleConsultationOpen(consultationId);
    }
  }, [consultationId, consultationStore.items]);

  return (
    <>
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
          <ConsultationListContainer open={dialog.open}>
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
              </Stack>
            </Box>
            <Divider />
            <ConsultationListSearch
              onFiltersChange={consultationSearch.handleFiltersChange}
              onSortChange={consultationSearch.handleSortChange}
              sortBy={consultationSearch.state.sortBy}
              sortDir={consultationSearch.state.sortDir}
              isPatientView
            />
            <Divider />
            <ConsultationListTable
              count={consultationStore.consultationsCount}
              items={consultationStore.items}
              onPageChange={consultationSearch.handlePageChange}
              onRowsPerPageChange={consultationSearch.handleRowsPerPageChange}
              onSelect={handleConsultationOpen}
              page={consultationSearch.state.page}
              rowsPerPage={consultationSearch.state.rowsPerPage}
              isPatientView
            />
          </ConsultationListContainer>
          <ConsultationDrawer
            container={rootRef.current}
            onClose={dialog.handleClose}
            open={dialog.open}
            consultation={currentOrder}
            isPatientView
            refetchList={consultationStore.refetch}
          />
        </Box>
      </Box>
    </>
  );
};

export default Page;
