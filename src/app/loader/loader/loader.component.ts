import { ChangeDetectionStrategy, Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { LoaderService } from '../../services/feature/loader.service';
import { tap } from 'rxjs/internal/operators/tap';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule, AsyncPipe, NgIf],
  template: ` <div *ngIf="loading$ | async" class="spinner-overlay">
    <mat-spinner mode="indeterminate" />
  </div>`,
  styles: `
    .spinner-overlay {
      position: fixed;
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 9999;
    }
  `,
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly loaderService = inject(LoaderService);
  loading$: Observable<boolean> = this.loaderService.loading$;
  @Input()
  detectRouteTransitions = false;

  ngOnInit(): void {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof RouteConfigLoadStart) {
              this.loaderService.showLoader();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loaderService.hideLoader();
            }
          })
        )
        .subscribe();
    }
  }
}
