import { HttpParams } from '@angular/common/http';

export interface HttpHeadersConfig {
  [name: string]: string | number | (string | number)[];
}
export const defaultHeaders: HttpHeadersConfig = {
  'Content-Type': 'application/json',
};
export const defaultParams = (page: number, LIMIT_PAGE: number): HttpParams => {
  return new HttpParams().set('_page', page).set('_limit', LIMIT_PAGE);
};
