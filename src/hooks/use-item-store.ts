import { useParams } from 'next/navigation';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from 'react';
import { trpc } from '../app/_trpc/client';
import { FileWithUser } from 'src/types/user';
import toast from 'react-hot-toast';
import { Prisma } from '@prisma/client';
import { useSearchParams } from './use-search-params';

export type View = 'grid' | 'list';

interface Filters {
  query?: string;
}

type SortDir = 'asc' | 'desc';

interface ItemsSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDir?: SortDir;
}

interface ItemsStoreState {
  items: FileWithUser[];
  itemsCount: number;
}

export const useItemsStore = (searchState: ItemsSearchState, userId?: string) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectedFolderId = searchParams.get('folderId');

  // Use userId from the hook's parameter if provided, otherwise fallback to customerId from URL params
  // const effectiveUserId = userId || params.customerId;

  let effectiveUserId: string | undefined = userId;

  if (!effectiveUserId) {
    // If params.customerId is defined and is an array, use the first element. Otherwise, use it as is.
    effectiveUserId = Array.isArray(params.customerId) ? params.customerId[0] : params.customerId;
  }

  const [state, setState] = useState<ItemsStoreState>({
    items: [],
    itemsCount: 0,
  });

  const { data, isLoading, refetch } = trpc.user.listFiles.useQuery(
    {
      query: searchState.filters.query,
      userId: effectiveUserId, // Use the effectiveUserId instead of params.customerId! as string,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      sortDir: searchState.sortDir || Prisma.SortOrder.asc,
    },
    {
      enabled: !selectedFolderId,
    }
  );

  const {
    data: subFilesData,
    isLoading: subFilesIsLoading,
    refetch: subFilesRefetch,
  } = trpc.user.listSubFiles.useQuery(
    {
      query: searchState.filters.query,
      folderFileId: selectedFolderId!,
      rowsPerPage: searchState.rowsPerPage,
      page: searchState.page,
      sortDir: searchState.sortDir || Prisma.SortOrder.asc,
    },
    {
      enabled: !!selectedFolderId,
    }
  );

  const mutation = trpc.user.deleteFile.useMutation();
  const mutationShareFile = trpc.user.shareFile.useMutation();
  const handleShareFile = useCallback(async (itemId: string, shareWithPatient: boolean) => {
    try {
      await mutationShareFile.mutateAsync({
        id: itemId,
        shareWithPatient: shareWithPatient,
      });

      if (shareWithPatient) {
        toast.success('File shared with patient');
      } else {
        toast.success('File unshared with patient');
      }
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const handleDelete = useCallback(
    async (itemId: string) => {
      try {
        setState((prevState) => {
          return {
            ...prevState,
            items: prevState.items.filter((item: { id: string }) => item.id !== itemId),
          };
        });

        await mutation.mutateAsync({
          id: itemId,
          isSubFile: !!selectedFolderId,
        });

        if (!selectedFolderId) {
          await refetch();
        } else {
          await subFilesRefetch();
        }
        toast.success('File deleted successfully');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [selectedFolderId],
  );

  useEffect(() => {
    if (!selectedFolderId && data) {
      const folder = data.items.find((item) => item.type === 'folder');
      const files = data.items.filter((item) => item.type !== 'folder');

      setState({
        items: [...(folder ? [folder] : []), ...files],
        itemsCount: data.meta.totalRowCount,
      });
    }
    if (selectedFolderId && subFilesData) {
      setState({
        items: subFilesData.items.map(item => ({ ...item, user: item.file.user })),
        itemsCount: subFilesData.meta.totalRowCount,
      });
    }
  }, [data, subFilesData, selectedFolderId, effectiveUserId]);

  return {
    ...state,
    handleDelete,
    isLoading: selectedFolderId ? subFilesIsLoading : isLoading,
    refetch: selectedFolderId ? subFilesRefetch : refetch,
    handleShareFile,
    selectedFolderId,
    patientId: effectiveUserId,
  };
};

export const useItemsSearch = () => {
  const [state, setState] = useState<ItemsSearchState>({
    filters: {
      query: undefined,
    },
    page: 0,
    rowsPerPage: 9,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
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
