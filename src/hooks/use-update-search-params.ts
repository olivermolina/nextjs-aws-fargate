import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from './use-search-params';
import { usePathname } from './use-pathname';

export const useUpdateSearchParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathname = usePathname();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const updateSearchParams = useCallback(
    (name: string, value: string) => {
      const newQueryString = createQueryString(name, value);
      router.push(pathname + '?' + newQueryString);
    },
    [router, createQueryString, pathname],
  );

  const removeSearchParams = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(name);
      const newQueryString = params.toString();
      router.push(pathname + '?' + newQueryString);
    },
    [router, pathname],
  );

  const replaceSearchParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const urlSearchParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          urlSearchParams.set(key, value);
        } else {
          urlSearchParams.delete(key);
        }
      });

      const newQueryString = urlSearchParams.toString();

      router.push(pathname + '?' + newQueryString);
    },
    [router, pathname],
  );

  return { updateSearchParams, removeSearchParams, replaceSearchParams };
};
