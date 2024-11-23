import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  showLoader(): void {
    this.loadingSubject.next(true);
  }

  hideLoader(): void {
    this.loadingSubject.next(false);
  }
}
