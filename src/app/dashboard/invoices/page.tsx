'use client';

import React, { ChangeEvent, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import FilterFunnel01Icon from '@untitled-ui/icons-react/build/esm/FilterFunnel01';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { InvoiceListContainer } from 'src/sections/dashboard/invoice/invoice-list-container';
import { InvoiceListSidebar } from 'src/sections/dashboard/invoice/invoice-list-sidebar';
import { InvoiceListSummary } from 'src/sections/dashboard/invoice/invoice-list-summary';
import { InvoiceListTable } from 'src/sections/dashboard/invoice/invoice-list-table';
import type { Invoice } from 'src/types/invoice';
import { trpc } from 'src/app/_trpc/client';
import { InvoiceStatus, Prisma, RolePermissionLevel, User, UserType } from '@prisma/client';
import { InvoiceCreateDialog } from 'src/sections/dashboard/invoice/invoice-create-dialog';
import { useCreateInvoice } from 'src/hooks/use-create-invoice';
import { useStaffsStore } from 'src/hooks/use-staffs-store';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getUserFullName } from '../../../utils/get-user-full-name';
import numeral from 'numeral';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import trpcClient from '../../../libs/trpc';
import BackdropLoading
  from '../../../sections/dashboard/account/account-billing-reactivate-backdrop';

const csvConfig = mkConfig({
  useKeysAsHeaders: true,
  filename: 'invoices',
});

interface Filters {
  customers?: User[];
  endDate?: Date;
  query?: string;
  startDate?: Date;
  status?: InvoiceStatus;
  groupByStatus?: boolean;
}

interface InvoicesSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
}

const useInvoicesSearch = () => {
  const [state, setState] = useState<InvoicesSearchState>({
    filters: {
      customers: [],
      endDate: undefined,
      query: '',
      startDate: undefined,
    },
    page: 0,
    rowsPerPage: 5,
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 0,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    [],
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

interface InvoicesStoreState {
  invoices: Invoice[];
  invoicesCount: number;
}

const useInvoicesStore = (searchState: InvoicesSearchState): InvoicesStoreState => {
  const { data } = trpc.invoice.list.useQuery(
    {
      query: searchState.filters.query,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      from: searchState.filters.startDate?.toDateString(),
      to: searchState.filters.endDate?.toDateString(),
      status: searchState.filters.status,
      userIds: searchState.filters.customers?.map((customer) => customer.id),
      groupByStatus: searchState.filters.groupByStatus,
    },
    {
      keepPreviousData: true,
    }
  );

  return {
    invoices: (data?.items ?? []) as Invoice[],
    invoicesCount: data?.meta?.totalRowCount ?? 0,
  };
};

const useCustomersStore = () => {
  const { data } = trpc.user.list.useQuery(
    {
      type: [UserType.PATIENT],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const customers: User[] = useMemo(() => {
    const items = data?.items;
    return items || [];
  }, [data]);

  return customers;
};

const Page = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const invoicesSearch = useInvoicesSearch();
  const invoicesStore = useInvoicesStore(invoicesSearch.state);
  const [group, setGroup] = useState<boolean>(true);
  const [openSidebar, setOpenSidebar] = useState<boolean>(lgUp);
  const customers = useCustomersStore();
  const staffStore = useStaffsStore();
  const createInvoice = useCreateInvoice();

  const permission = useGetPermissionByResource(PermissionResourceEnum.INVOICING_AND_PAYMENT);
  const hasEditAccess = useMemo(() => {
    if (!permission) {
      return false;
    }
    return permission.editAccessLevel !== RolePermissionLevel.NONE;
  }, [permission]);

  usePageView();

  const handleGroupChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setGroup(event.target.checked);
  }, []);

  const handleFiltersToggle = useCallback((): void => {
    setOpenSidebar((prevState) => !prevState);
  }, []);

  const handleFiltersClose = useCallback((): void => {
    setOpenSidebar(false);
  }, []);

  const [exportLoading, setExportLoading] = useState(false);

  const handleGenerateCSV = async () => {
    setExportLoading(true);
    const result = await trpcClient().invoice.list.query({
      query: invoicesSearch.state.filters.query,
      rowsPerPage: invoicesStore.invoicesCount > 5 ? invoicesStore.invoicesCount : 5,
      page: 0,
      from: invoicesSearch.state.filters.startDate?.toDateString(),
      to: invoicesSearch.state.filters.endDate?.toDateString(),
      status: invoicesSearch.state.filters.status,
      userIds: invoicesSearch.state.filters.customers?.map((customer) => customer.id),
      groupByStatus: invoicesSearch.state.filters.groupByStatus,
    });

    const csvData = result?.items?.map((invoice) => ({
      invoice_number: invoice.invoice_number,
      patient_name: getUserFullName(invoice.patient),
      amount: numeral(invoice.total_amount).format('0,0.00'),
      date_issued: format(dayjs(invoice.created_at || new Date()).toDate(), 'dd/MM/yyyy'),
      date_due: format(dayjs(invoice.due_date || new Date()).toDate(), 'dd/MM/yyyy'),
      status: invoice.status,
    }));

    if (!csvData || csvData.length === 0) {
      toast.error('No data to export');
      setExportLoading(false);
      return;
    }

    const csv = generateCsv(csvConfig)(csvData);
    download(csvConfig)(csv);
    setExportLoading(false);
  };

  return (
    <>
      <Seo title="Dashboard: Invoice List" />
      <Divider />
      <Box
        component="main"
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
          <InvoiceListSidebar
            container={rootRef.current}
            filters={invoicesSearch.state.filters}
            group={group}
            onFiltersChange={invoicesSearch.handleFiltersChange}
            onClose={handleFiltersClose}
            onGroupChange={handleGroupChange}
            open={openSidebar}
            customers={customers}
          />
          <InvoiceListContainer open={openSidebar}>
            <Stack spacing={4}>
              <Stack
                alignItems="flex-start"
                direction="row"
                justifyContent="space-between"
                spacing={3}
              >
                <div>
                  <Typography variant="h4">Invoices</Typography>
                </div>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Button
                    onClick={handleGenerateCSV}
                    startIcon={<FileDownloadIcon />}
                    color={'inherit'}
                  >
                    Export
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon>
                        <FilterFunnel01Icon />
                      </SvgIcon>
                    }
                    onClick={handleFiltersToggle}
                  >
                    Filters
                  </Button>
                  {hasEditAccess && (
                    <Button
                      startIcon={
                        <SvgIcon>
                          <PlusIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={createInvoice.handleOpen}
                    >
                      New
                    </Button>
                  )}
                </Stack>
              </Stack>
              <InvoiceListSummary invoices={invoicesStore.invoices} />
              <InvoiceListTable
                count={invoicesStore.invoicesCount}
                group={group}
                items={invoicesStore.invoices}
                onPageChange={invoicesSearch.handlePageChange}
                onRowsPerPageChange={invoicesSearch.handleRowsPerPageChange}
                page={invoicesSearch.state.page}
                rowsPerPage={invoicesSearch.state.rowsPerPage}
              />
            </Stack>
          </InvoiceListContainer>
        </Box>
      </Box>
      <InvoiceCreateDialog
        open={createInvoice.open}
        handleClose={createInvoice.handleClose}
        isLoading={false}
        onSubmit={createInvoice.onSubmit}
        staffOptions={staffStore.staffs}
        patientOptions={customers}
        invoiceNumber={createInvoice.invoiceNumber}
      />

      <BackdropLoading
        open={exportLoading}
        message={'Exporting invoices...'}
      />
    </>
  );
};

export default Page;
