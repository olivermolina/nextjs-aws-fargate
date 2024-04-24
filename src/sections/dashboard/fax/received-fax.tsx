import React, { useMemo, useState } from 'react';
import { trpc } from '../../../app/_trpc/client';
import { useSelection } from '../../../hooks/use-selection';
import dayjs from 'dayjs';
import { ReceivedFaxListSearch } from './received-fax-list-search';
import { ReceivedFaxListTable } from './received-fax-list-table';
import FaxPdfViewer from './fax-pdf-viewer';
import { useViewFaxPdf } from '../../../hooks/use-view-fax-pdf';

interface Filters {
  from?: Date;
  to?: Date;
}

interface FaxSearchState {
  filters: Filters;
}

const useFaxSearch = () => {
  const [state, setState] = useState<FaxSearchState>({
    filters: {
      // default to first and last day of the current month
      from: dayjs().startOf('month').toDate(),
      to: dayjs().endOf('month').toDate(),
    },
  });

  const handleSetFilters = (filters: Filters) => {
    setState({
      filters,
    });
  };

  return {
    state,
    handleSetFilters,
  };
};

const useFaxStore = (searchState: FaxSearchState) => {
  const { data, refetch, isLoading, isFetching } = trpc.fax.receivedList.useQuery({
    from: searchState.filters.from || dayjs().startOf('month').toDate(),
    to: searchState.filters.to || dayjs().endOf('month').toDate(),
  });

  return {
    data,
    refetch,
    isLoading: isLoading || isFetching,
  };
};

export default function ReceivedFax() {
  const faxSearch = useFaxSearch();
  const faxStore = useFaxStore(faxSearch.state);
  const faxesIds = useMemo(() => {
    if (!faxStore.data) return [] as string[];

    return faxStore.data.map((fax) => fax.FileName);
  }, [faxStore.data]);
  const selection = useSelection<string>(faxesIds);
  const viewFaxPdf = useViewFaxPdf();

  return (
    <>
      <ReceivedFaxListSearch onFiltersChange={faxSearch.handleSetFilters} />
      <ReceivedFaxListTable
        count={faxStore.data?.length || 0}
        items={faxStore.data || []}
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
