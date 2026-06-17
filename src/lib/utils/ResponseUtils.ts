export const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.Error ||
    error?.response?.data?.error ||
    error?.message ||
    "An error occurred"
  );
};

export const extractData = <T>(response: any): T => {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.error ?? `${typeof response.data} request failed`;
    throw new Error(message);
  }
  return result.data as T;
};
