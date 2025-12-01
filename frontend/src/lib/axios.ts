import axios from 'axios';

function getToken(): string | undefined {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = require('next/headers');
      const cookieStore = cookies();
      const token = cookieStore.get('access_token')?.value;
      return token;
    } catch (error) {
      return undefined;
    }
  }
  
  // Client-side
  try {
    const Cookies = require('js-cookie');
    const token = Cookies.get('access_token'); 
    return token;
  } catch (error) {
    return undefined;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Só redireciona no client-side
      if (typeof window !== 'undefined') {
        const Cookies = require('js-cookie');
        Cookies.default.remove('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;