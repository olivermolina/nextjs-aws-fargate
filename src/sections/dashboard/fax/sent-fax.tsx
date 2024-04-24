import { SentFaxListSearch } from './sent-fax-list-search';
import { SentFaxListTable } from './sent-fax-list-table';
import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Fax, Prisma, User } from '@prisma/client';
import { useAuth } from '../../../hooks/use-auth';
import { trpc } from '../../../app/_trpc/client';
import { deepCopy } from '../../../utils/deep-copy';
import { applySort } from '../../../utils/apply-sort';
import { useSelection } from '../../../hooks/use-selection';
import { useViewFaxPdf } from '../../../hooks/use-view-fax-pdf';
import FaxPdfViewer from './fax-pdf-viewer';

interface Filters {
  query?: string;
  status?: string;
}

interface FaxSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: Prisma.SortOrder;
}

const useFaxSearch = () => {
  const [state, setState] = useState<FaxSearchState>({
    filters: {
      query: undefined,
      status: undefined,
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
    [],
  );

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
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

export type FaxWithStaff = Fax & {
  staff: Pick<User, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'>;
};

interface FaxStoreState {
  faxes: FaxWithStaff[];
  count: number;
}

const useFaxStore = (searchState: FaxSearchState) => {
  const { user } = useAuth();

  const [state, setState] = useState<FaxStoreState>({
    faxes: [],
    count: 0,
  });

  const { data, refetch, isLoading, isFetching } = trpc.fax.sentList.useQuery({
    query: searchState.filters.query,
    rowsPerPage: searchState.rowsPerPage,
    page: searchState.page,
    sortDir: searchState.sortDir,
  });

  const faxes: FaxWithStaff[] = useMemo(() => {
    const items = data?.items;
    return items || [];
  }, [data]);

  const count = data?.meta?.totalRowCount ?? 0;

  useEffect(() => {
    let data = deepCopy(faxes) as FaxWithStaff[];
    const { filters, sortBy, sortDir } = searchState;

    if (typeof filters !== 'undefined') {
      data = data.filter((fax) => {
        if (typeof filters.query !== 'undefined' && filters.query !== '') {
          let queryMatched = false;
          const properties: ('email' | 'first_name' | 'last_name')[] = [
            'email',
            'first_name',
            'last_name',
          ];

          properties.forEach((property) => {
            if (fax.staff[property]?.toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });

          const faxProperties: (
            | 'to_number'
            | 'recipient_first_name'
            | 'recipient_last_name'
            | 'recipient_business_name'
            | 'subject'
            | 'remarks'
            | 'srfax_sent_status'
            | 'srfax_error_code'
            )[] = [
            'to_number',
            'recipient_first_name',
            'recipient_last_name',
            'recipient_business_name',
            'subject',
            'remarks',
            'srfax_sent_status',
            'srfax_error_code',
          ];

          faxProperties.forEach((property) => {
            if (fax[property]?.toLowerCase().includes(filters.query!.toLowerCase())) {
              queryMatched = true;
            }
          });

          if (!queryMatched) {
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
      faxes: data,
      count: count,
    });
  }, [faxes, count, searchState, user]);

  return {
    ...state,
    refetch,
    isLoading: isLoading || isFetching,
  };
};

const useFaxesIds = (faxes: FaxWithStaff[] = []) => {
  return useMemo(() => {
    return faxes.map((fax) => fax.id);
  }, [faxes]);
};

export default function SentFax() {
  const faxSearch = useFaxSearch();
  const faxStore = useFaxStore(faxSearch.state);
  const faxesIds = useFaxesIds(faxStore.faxes);
  const selection = useSelection<string>(faxesIds);

  const viewFaxPdf = useViewFaxPdf();

  return (
    <>
      <SentFaxListSearch
        onFiltersChange={faxSearch.handleFiltersChange}
        onSortChange={faxSearch.handleSortChange}
        sortBy={faxSearch.state.sortBy}
        sortDir={faxSearch.state.sortDir}
      />
      <SentFaxListTable
        count={faxStore.count}
        items={faxStore.faxes}
        onPageChange={faxSearch.handlePageChange}
        onRowsPerPageChange={faxSearch.handleRowsPerPageChange}
        page={faxSearch.state.page}
        rowsPerPage={faxSearch.state.rowsPerPage}
        selected={selection.selected}
        isLoading={faxStore.isLoading}
        handleViewFax={viewFaxPdf.handleView}
      />

      {viewFaxPdf.dialog.data && (
        <FaxPdfViewer
          sFaxDetailsID={viewFaxPdf.dialog.data.sFaxDetailsID}
          sDirection={viewFaxPdf.dialog.data.sDirection}
          handleClose={viewFaxPdf.dialog.handleClose}
          open={viewFaxPdf.dialog.open}
        />
      )}
    </>
  );
}
