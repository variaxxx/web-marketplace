export interface FindManyApiResponse<T = any> {
  total: number;
  count: number;
  items: T[];
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string[];
  data: T;
}
