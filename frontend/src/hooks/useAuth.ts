"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import Cookies from 'js-cookie';
import { TCreateUserInput } from '@/schema/user.schema';
import { TUserResponse } from '@/types/user.types';

// === Tipos da API ===
export interface AuthResponse {
  status: string;
  message?: string;
  data: {
    access_token: string;
    user: TUserResponse;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends TCreateUserInput {}

// === Hooks ===

export const useGetProfile = () => {
  return useQuery<AuthResponse['data']>({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await api.get<AuthResponse>('/auth/me');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse['data'], Error, RegisterDTO>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse['data'], Error, LoginDTO>({
    mutationFn: async (data) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      Cookies.set('access_token', data.access_token, { 
        expires: 1, 
        secure: true, 
        sameSite: 'strict' 
      });
      Cookies.set("user", JSON.stringify(data.user));
      queryClient.setQueryData(['auth', 'profile'], data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error>({
    mutationFn: async () => {
      const response = await api.post<{ message: string }>('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      Cookies.remove('access_token');
      Cookies.remove('user');
      queryClient.clear();
    },
  });
};

export const useGoogleLogin = () => {
  return useMutation<AuthResponse['data'], Error, string>({
    mutationFn: async (idToken: string) => {
      const response = await api.post<AuthResponse>('/auth/login/google', { idToken });
      return response.data.data;
    },
    onSuccess: (data) => {
      Cookies.set('access_token', data.access_token, { expires: 1, secure: true, sameSite: 'strict' });
      Cookies.set("user", JSON.stringify(data.user));
    },
  });
};

export const useGetUsers = (page = 1, limit = 10, search: string = '') => {
  return useQuery({
    queryKey: ['users', { page, limit, search }],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: { page, limit, search },
      });
      return response.data;
    },
  });
};