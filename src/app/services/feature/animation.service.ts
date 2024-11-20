import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  private animationFrameId!: number;

  animateCar(duration: number, onProgress: (progress: number) => void, onComplete: () => void): void {
    const startTime = performance.now();

    const animate = (time: number): void => {
      const elapsedTime = (time - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);
      onProgress(progress);
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }
  cancelAnimation(): void {
    cancelAnimationFrame(this.animationFrameId);
  }
}
