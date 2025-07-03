import { isAxiosError } from 'axios';
import { Alert } from 'react-native';

export const handleApiError = (error: unknown, context?: string) => {
  let message = 'Ocurrió un error. Inténtalo de nuevo.';

  if (isAxiosError(error)) {
    message = error.response?.data?.message || error.message;
  }

  console.error(`❌ Error${context ? ` [${context}]` : ''}:`, error);
  Alert.alert('Error', message);
  throw new Error(message);
};