export interface Car {
  name: string;
  color: string;
  id?: number;
}

export type Speed = {
  velocity: number;
  distance: number;
};

export interface Winner {
  id: number;
  wins: number;
  time: number;
  car?: Car;
}
export enum CarStatus {
  started = 'started',
  stopped = 'stopped',
  drive = 'drive',
}
export type CarEngineStatus = {
  success: boolean;
};
