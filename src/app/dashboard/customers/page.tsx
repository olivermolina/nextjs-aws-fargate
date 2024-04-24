'use client';

import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { usePageView } from 'src/hooks/use-page-view';
import { useSelection } from 'src/hooks/use-selection';
import { CustomerListSearch } from 'src/sections/dashboard/customer/customer-list-search';
import { CustomerListTable } from 'src/sections/dashboard/customer/customer-list-table';
import { Prisma, RolePermissionLevel, User, UserType } from '@prisma/client';
import { trpc } from 'src/app/_trpc/client';
import { CustomerFormModal } from 'src/sections/dashboard/customer/customer-form-modal';
import {
  CustomerWelcomeEmailDialog,
} from 'src/sections/dashboard/customer/customer-welcome-email-dialog';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { useAddNewCustomer } from '../../../hooks/use-add-new-customer';
import { useAssignStaff } from '../../../hooks/use-assign-staff';
import {
  CustomerAssignStaffModal,
} from '../../../sections/dashboard/customer/customer-assign-staff-modal';
import { deepCopy } from '../../../utils/deep-copy';
import { applySort } from '../../../utils/apply-sort';
import { useAuth } from '../../../hooks/use-auth';
import CustomerImport from '../../../sections/dashboard/customer/customer-import-modal';
import BackdropLoading
  from '../../../sections/dashboard/account/account-billing-reactivate-backdrop';
import { useImportPatients } from '../../../hooks/user-import-patients';

interface Filters {
  query?: string;
  active?: boolean;
  assigned?: boolean;
}

interface CustomersSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: Prisma.SortOrder;
}

const useCustomersSearch = () => {
  const [state, setState] = useState<CustomersSearchState>({
    filters: {
      query: undefined,
      active: undefined,
      assigned: undefined,
    },
    page: 0,
    rowsPerPage: 10,
    sortBy: 'updated_at',
    sortDir: Prisma.SortOrder.desc,
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
      page: 0,
    }));
  }, []);

  const handleSortChange = useCallback(
    (sort: { sortBy: string; sortDir: Prisma.SortOrder }): void => {
      setState((prevState) => ({
        ...prevState,
        sortBy: sort.sortBy,
        sortDir: sort.sortDir,
      }));
    },
    []
  );

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


interface CustomersStoreState {
  customers: User[];
  customersCount: number;
}

const useCustomersStore = (searchState: CustomersSearchState) => {
  const { user } = useAuth();

  const [state, setState] = useState<CustomersStoreState>({
    customers: [],
    customersCount: 0,
  });

  const { data, refetch, isLoading, isFetching } = trpc.user.list.useQuery(
    {
      active: searchState.filters.active,
      query: searchState.filters.query,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      type: [UserType.PATIENT],
      sortDir: searchState.sortDir,
      assigned: searchState.filters.assigned,
      includeEmailQueryFilter: true,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Prefetch Active Patients
  trpc.user.list.useQuery(
    {
      active: true,
      query: searchState.filters.query,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      type: [UserType.PATIENT],
      sortDir: searchState.sortDir,
      assigned: searchState.filters.assigned,
      includeEmailQueryFilter: true,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Prefetch Inactive Patients
  trpc.user.list.useQuery(
    {
      active: false,
      query: searchState.filters.query,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      type: [UserType.PATIENT],
      sortDir: searchState.sortDir,
      assigned: searchState.filters.assigned,
      includeEmailQueryFilter: true,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Prefetch own Patients
  trpc.user.list.useQuery(
    {
      active: searchState.filters.active,
      query: searchState.filters.query,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      type: [UserType.PATIENT],
      sortDir: searchState.sortDir,
      assigned: true,
      includeEmailQueryFilter: true,
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

  const customersCount = data?.meta?.totalRowCount ?? 0;

  useEffect(() => {
    let data = deepCopy(customers) as User[];
    const { filters, sortBy, sortDir } = searchState;

    if (typeof filters !== 'undefined') {
      data = data.filter((customer) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;
          const properties: ('email' | 'first_name' | 'last_name')[] = [
            'email',
            'first_name',
            'last_name',
          ];

          properties.forEach((property) => {
            if (customer?.[property]?.toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });

          if (!queryMatched) {
            return false;
          }
        }

        if (typeof filters.active !== 'undefined') {
          if (customer.active !== filters.active) {
            return false;
          }
        }

        return true;
      });
    }

    if (typeof sortBy !== 'undefined' && typeof sortDir !== 'undefined') {
      data = applySort(data, sortBy, sortDir);
    }

    setState({
      customers: data,
      customersCount,
    });
  }, [customers, customersCount, searchState, user]);

  return {
    ...state,
    refetch,
    isLoading: isLoading || isFetching,
  };
};

const useCustomersIds = (customers: User[] = []) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};

const Page = () => {
  const customersSearch = useCustomersSearch();
  const customersStore = useCustomersStore(customersSearch.state);
  const importPatients = useImportPatients(customersStore.refetch);
  const customersIds = useCustomersIds(customersStore.customers);
  const customersSelection = useSelection<string>(customersIds);
  const { createUserDialog, inviteToPortal } = useAddNewCustomer(customersStore.refetch);
  const permission = useGetPermissionByResource(PermissionResourceEnum.PATIENT_INFORMATION);
  const assignStaff = useAssignStaff(
    customersStore.refetch,
    customersSelection.selected,
    [],
    customersSelection.handleDeselectAll,
  );

  usePageView();

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth={false}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">Customers</Typography>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Upload01Icon />
                      </SvgIcon>
                    }
                    onClick={importPatients.importDialog.handleOpen}
                  >
                    Import
                  </Button>
                </Stack>
              </Stack>
              {permission?.editAccessLevel !== RolePermissionLevel.NONE && (
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={3}
                >
                  <Button
                    startIcon={
                      <SvgIcon>
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={createUserDialog.handleOpen}
                  >
                    Add
                  </Button>
                </Stack>
              )}
            </Stack>
            <Card>
              <CustomerListSearch
                onFiltersChange={customersSearch.handleFiltersChange}
                onSortChange={customersSearch.handleSortChange}
                sortBy={customersSearch.state.sortBy}
                sortDir={customersSearch.state.sortDir}
              />
              <CustomerListTable
                count={customersStore.customersCount}
                items={customersStore.customers}
                onDeselectAll={customersSelection.handleDeselectAll}
                onDeselectOne={customersSelection.handleDeselectOne}
                onPageChange={customersSearch.handlePageChange}
                onRowsPerPageChange={customersSearch.handleRowsPerPageChange}
                onSelectAll={customersSelection.handleSelectAll}
                onSelectOne={customersSelection.handleSelectOne}
                page={customersSearch.state.page}
                rowsPerPage={customersSearch.state.rowsPerPage}
                selected={customersSelection.selected}
                isLoading={customersStore.isLoading}
                openAssignStaff={assignStaff.dialog.handleOpen}
              />
            </Card>
          </Stack>
        </Container>
      </Box>
      <CustomerFormModal {...createUserDialog} />
      {inviteToPortal.patient && (
        <CustomerWelcomeEmailDialog
          {...inviteToPortal}
          patient={inviteToPortal.patient}
        />
      )}
      <CustomerAssignStaffModal
        staffs={createUserDialog.staffs}
        theme={createUserDialog.theme}
        open={assignStaff.dialog.open}
        handleClose={() => {
          assignStaff.handleRemoveStaff([] as unknown as [string, ...string[]]);
          assignStaff.dialog.handleClose();
        }}
        isLoading={assignStaff.isLoading}
        handleSubmit={assignStaff.handleSubmit}
        onSubmit={assignStaff.onSubmit}
        control={assignStaff.control}
        errors={assignStaff.errors}
        handleRemoveStaff={assignStaff.handleRemoveStaff}
      />
      <CustomerImport
        open={importPatients.importDialog.open}
        handleClose={importPatients.importDialog.handleClose}
        handleImport={importPatients.handleImport}
      />
      <BackdropLoading
        open={importPatients.isLoading}
        message="Importing customers..."
      />
    </>
  );
};

export default Page;
