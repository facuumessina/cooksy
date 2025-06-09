import api from './api';
import { handleApiError } from './errorHandler';
import {
    LoginDTO,
    RecoverPasswordDTO,
    RegisterStep1DTO,
    RegisterStep2DTO,
    ResetPasswordDTO,
} from './types';

export const login = async (data: LoginDTO) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'login');
  }
};

export const registerStep1 = async (data: RegisterStep1DTO) => {
  try {
    const res = await api.post('/auth/register-step1', data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'registerStep1');
  }
};

export const registerStep2 = async (data: RegisterStep2DTO) => {
  try {
    const res = await api.post('/auth/register-step2', data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'registerStep2');
  }
};

export const recoverPassword = async (data: RecoverPasswordDTO) => {
  try {
    const res = await api.post('/auth/recover-password', data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'recoverPassword');
  }
};

export const resetPassword = async (data: ResetPasswordDTO) => {
  try {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'resetPassword');
  }
};