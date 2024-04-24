import { trpc } from 'src/app/_trpc/client';
import { useEffect, useState } from 'react';

export const useSignedUrlFile = (id?: string | null, isSubFiles?: boolean) => {
  const [itemId, setItemId] = useState<string | null>(id || null);

  const { data } = trpc.user.getSignedUrlFile.useQuery(
    {
      id: itemId || '',
      isSubFiles,
    },
    {
      enabled: !!itemId,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (id) {
      setItemId(id);
    }
  }, [id]);

  return {
    url: data || '',
    setItemId,
  };
};
