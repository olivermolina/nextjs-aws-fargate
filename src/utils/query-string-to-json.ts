
export const queryStringToJson = (queryString: string) => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}
