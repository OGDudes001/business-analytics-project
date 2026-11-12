import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;

  const data = error.response?.data;
  const validationErrors = data?.errors
    ? Object.values(data.errors).flat().join(' ')
    : '';

  return validationErrors || data?.message || fallback;
}
