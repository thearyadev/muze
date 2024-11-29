export type APIResponse<T> = {
  status_code: number;
  content?: T;
  error?: string;
}
