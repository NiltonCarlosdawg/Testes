import api from '../axios'


export enum USERSTATUS {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

export interface User {
  id: string;
  email: string;
  telefone: string | null;
  passwordHash: string;
  primeiroNome: string;
  ultimoNome: string;
  avatarUrl: string | null;
  status: USERSTATUS;
  emailVerificado: boolean;
  telefoneVerificado: boolean;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  nome: string
  email: string
  password: string
}

/**
 * Registrar usuário
 */
export const register = async (
  payload: RegisterDTO
): Promise<ApiResponse<AuthResponse>> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload)
  return data
}

/**
 * Login usuário
 */
export const login = async (
  payload: LoginDTO
): Promise<ApiResponse<AuthResponse>> => {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return data
}

/**
 * Ver perfil do usuário autenticado
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const { data } = await api.get<ApiResponse<User>>('/auth/me')
  return data
}

/**
 * Logout usuário
 */
export const logout = async (): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/logout')
  return data
}
