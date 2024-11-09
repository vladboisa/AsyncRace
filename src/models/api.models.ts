export interface Car {
  name: string;
  color: string;
  id?: number;
}

export interface CarsResponse {
  items: Car[];
  count: string | null;
}

export interface Speed {
  velocity: number;
  distance: number;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
  car?: Car;
}
export interface WinnersResponse {
  items: Winner[];
  count: string;
}
export enum CarStatus {
  'started',
  'stopped',
  'drive',
}
export type CarEngineStatus = {
  success: boolean;
};
