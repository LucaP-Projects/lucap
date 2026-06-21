export interface PaginationParams {
  page?: number;
  limit?: number;
  query?: string;
}

export enum ErrorCodes {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  INTERNAL_SERVER_ERROR = 500
}
export enum ErrorMessages {
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  BAD_REQUEST = 'Bad Request',
  INTERNAL_SERVER_ERROR = 'Internal Server Error'
}
