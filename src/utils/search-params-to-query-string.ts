export const searchParamsToUrlQueryString = (searchParams: URLSearchParams) => {
  let query: string = '';
  for (const [key, value] of searchParams.entries()) {
    query += `${key}=${value}&`;
  }
  return query;
};
