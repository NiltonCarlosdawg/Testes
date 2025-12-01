export type TQueryRequest = {
  page: number;
  limit: number;
  search?: string;
}

export type TIdParam = {
  id: string;
}

export type TPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type TFindAllResponse<T> = {
  data: T[];
  total: number;
}

export interface IFAResponseService<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  }
}


export type TUpdateQuery<T> = {
  id: string;
  data: Partial<T>;
}
