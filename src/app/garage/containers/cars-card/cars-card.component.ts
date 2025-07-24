import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Speed, Winner } from '../../../../models/api.models';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  DestroyRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Car } from '../../../../models/api.models';
import { CarsEngineService } from '../../../services/core/cars/cars-engine.service';
import { catchError, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { AnimationService } from '../../../services/feature/animation.service';
import { ErrorsService } from '../../../services/errors.service';
import { HttpErrorResponse } from '@angular/common/http';
import { WinnersService } from '../../../services/core/winners/winners.service';

@Component({
  selector: 'app-cars-card',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="cars-card">
      <div class="cars-card-buttons">
        <button (click)="selectSingleCar(carSingle)">Select</button>
        <button (click)="handleOnPlay()" [disabled]="isPlaying">
          <mat-icon aria-label="Play icon" inline="true" fontIcon="play_arrow"></mat-icon>
        </button>
        <button (click)="handleDelete()">Remove</button>
        <button (click)="onStopClick()" [disabled]="!isPlaying">
          <mat-icon aria-label="Replay icon" inline="true" fontIcon="replay"></mat-icon>
        </button>
      </div>
      <div class="cars-card-track">
        <h5 class="cars-card-track-name">{{ carSingle.name }}</h5>
        <svg
          class="car"
          #carSvg
          [style.fill]="carSingle.color"
          xmlns="http://www.w3.org/2000/svg"
          xml:space="preserve"
          [style.width]="CAR_WIDTH"
          height="70"
          viewBox="0 0 6.7 4"
        >
          <g>
            <g id="_678628480">
              <path
                d="M4.595 3.228c-.366-.22-.708-.34-1.102-.37-.402-.03-.862.034-1.46.182a1.93 1.93 0 0 1-.205.031 2.183 2.183 0 0 0-.155.022l-.017.002a.672.672 0 0 0-.293.076.393.393 0 0 0-.141.123.235.235 0 0 0-.007.256l.02.039-.012.042c-.012.043-.008.07.01.085.029.024.084.04.16.047a.43.43 0 0 0 .02.215c-.138-.009-.246-.04-.317-.099-.078-.065-.11-.152-.087-.266a.444.444 0 0 1 .036-.436.605.605 0 0 1 .215-.193.882.882 0 0 1 .377-.101c.044-.01.104-.016.166-.023.07-.009.143-.017.18-.026.62-.154 1.1-.22 1.525-.188.42.03.781.155 1.164.38.194-.022.438.038.652.133.259.114.483.285.536.431v.075l-.048.12a.24.24 0 0 1 .048.12c.005.103-.05.159-.205.14l-.454-.008a.425.425 0 0 0 .052-.212l.325.006-.008-.01.022-.058.052-.132c-.057-.087-.218-.195-.406-.277-.196-.087-.415-.14-.57-.112l-.073-.014zm-.149.797L2.21 3.991a.425.425 0 0 0 .027-.212l2.163.033a.435.435 0 0 0 .046.213z"
              />
              <path
                d="M4.826 3.405a.425.425 0 0 1 .302.729.425.425 0 0 1-.728-.302.425.425 0 0 1 .426-.427zm.151.276a.213.213 0 0 0-.364.151.213.213 0 0 0 .364.15.213.213 0 0 0 0-.3z"
              />
              <path
                d="M1.813 3.405a.425.425 0 0 1 .302.729.425.425 0 0 1-.728-.302.425.425 0 0 1 .426-.427zm.151.276a.213.213 0 0 0-.364.151.213.213 0 0 0 .364.15.213.213 0 0 0 0-.3z"
              />
              <path d="m2.543 2.753.276.24 1.53.203.245-.15.111.182-.276.17-.07.014-1.6-.213-.055-.025-.3-.26z" />
            </g>
          </g>
          <path style="fill:none" d="M0 0h6.827v6.827H0z" />
        </svg>
        <svg
          class="finish"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="-3.2 -3.2 36.40 28.40"
        >
          <g>
            <polyline
              style="fill:none;stroke:#000000;stroke-width:2;stroke-miterlimit:10;"
              points="6,28 6,5 26,5 26,19 6,19 "
            ></polyline>
            <rect x="22" y="5" width="4" height="4"></rect>
            <rect x="19" y="15" width="3" height="4"></rect>
            <rect x="19" y="9" width="3" height="3"></rect>
            <rect x="13" y="15" width="3" height="4"></rect>
            <rect x="13" y="9" width="3" height="3"></rect>
            <rect x="6" y="15" width="4" height="4"></rect>
            <rect x="6" y="9" width="4" height="3"></rect>
            <rect x="22" y="12" width="4" height="3"></rect>
            <rect x="16" y="12" width="3" height="3"></rect>
            <rect x="10" y="12" width="3" height="3"></rect>
            <rect x="16" y="5" width="3" height="4"></rect>
            <rect x="10" y="5" width="3" height="4"></rect>
          </g>
        </svg>
      </div>
    </div>
  `,
  styleUrl: './cars-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarsCardComponent {
  private readonly carsEngineService = inject(CarsEngineService);
  private readonly animationCarService = inject(AnimationService);
  private readonly winnersService = inject(WinnersService);
  private readonly errorsService = inject(ErrorsService);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly GRID_BUTTONS_WIDTH = 100;
  protected readonly CAR_WIDTH = 100;

  isPlaying = false;
  animationFrame!: number;
  @Input({ required: true }) carSingle!: Car;
  @Output() emittedCar = new EventEmitter<Car>();
  @Output() deletedCar = new EventEmitter<Car>();
  @ViewChild('carSvg', { static: true }) carSvgRef!: ElementRef<SVGElement>;

  selectSingleCar(singleCar: Car): void {
    if (this.carSingle) {
      this.emittedCar.emit(singleCar);
    }
  }
  handleDelete(): void {
    if (confirm(`Are you really wan't to delete ${this.carSingle.name}?`)) {
      this.deletedCar.emit({ ...this.carSingle });
    }
  }
  handleOnPlay(): void {
    this.onPlayClick().pipe(take(1)).subscribe();
  }
  onPlayClick(): Observable<Winner> {
    const startTime = Date.now();
    this.isPlaying = true;
    return this.carsEngineService.getCarVelocity(this.carSingle.id)?.pipe(
      take(1),
      switchMap((speed: Speed) =>
        this.startCarAnimation(speed).pipe(
          map((): Winner => {
            const timeTaken = Date.now() - startTime;
            const winner: Winner = {
              name: this.carSingle.name,
              id: this.carSingle.id,
              success: true,
              time: timeTaken,
              wins: 1,
            };
            this.winnersService.handleWinnerAfterRace(winner).subscribe({
              error: (err) => console.error('Error handling winner:', err),
            });
            return winner;
          })
        )
      ),
      catchError((err) => {
        this.handleAnimationError(err);
        return of({ name: this.carSingle.name, id: this.carSingle.id, success: false, time: 0, wins: 0 });
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }
  onStopClick(): void {
    if (!this.isPlaying) return;
    this.carsEngineService
      .stopCar(this.carSingle.id)
      .pipe(
        tap(() => {
          this.animationCarService.cancelAnimation();
          this.resetCarPosition().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
  private startCarAnimation(speed: Speed): Observable<void> {
    const speedMultiplier = 1500;
    const duration = speed.distance / (speed.velocity * speedMultiplier);
    const finishX = this.getFinishXPosition();
    const finishPositionVW = this.calculateFinishViewportWidth(finishX);

    return new Observable<void>((observer) => {
      this.animationCarService.animateCar(
        duration,
        (progress) => {
          const position = progress * finishPositionVW;
          requestAnimationFrame(() => {
            this.carSvgRef.nativeElement.style.transform = `translateX(${position}vw)`;
          });
        },
        () => {
          observer.next();
          observer.complete();
        }
      );
    });
  }
  private handleAnimationError(error: HttpErrorResponse): void {
    this.isPlaying = false;
    this.errorsService.handleEngineError(error);
  }

  private calculateFinishViewportWidth(finishX: number): number {
    const distanceForTrack = finishX - this.CAR_WIDTH - this.GRID_BUTTONS_WIDTH;
    const finish_VW_Percentage = (distanceForTrack / window.innerWidth) * 100;
    return finish_VW_Percentage;
  }

  private getFinishXPosition(): number {
    const finishElement = document.querySelector<SVGElement>('.finish');
    if (finishElement) {
      const finishRect = finishElement.getBoundingClientRect();
      return finishRect.left;
    }
    return window.innerWidth;
  }
  resetCarPosition(): Observable<void> {
    return new Observable<void>((observer) => {
      this.animationCarService.animateCar(
        1,
        () => {
          requestAnimationFrame(() => {
            this.carSvgRef.nativeElement.style.transform = `translateX(${0}vw)`;
          });
        },
        () => {
          this.isPlaying = false;
          this.cdRef.markForCheck();
          observer.next();
          observer.complete();
        }
      );
    });
  }
}
