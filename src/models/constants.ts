export interface HttpHeadersConfig {
  [name: string]: string | number | (string | number)[];
}
export const defaultHeaders: HttpHeadersConfig = {
  'Content-Type': 'application/json',
};
