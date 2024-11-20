import { Injectable } from '@angular/core';
import { Car } from '../../../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class RandomCarsService {
  private readonly CAR_BRANDS = [
    'Tesla',
    'Ford',
    'Chevrolet',
    'BMW',
    'Audi',
    'Toyota',
    'Honda',
    'Mercedes',
    'Nissan',
    'Volkswagen',
  ];
  private readonly CAR_MODELS = [
    'Model S',
    'Mustang',
    'Corvette',
    'X5',
    'A4',
    'Camry',
    'Civic',
    'C-Class',
    'Altima',
    'Golf',
  ];

  private generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  private generateRandomCarName(): string {
    const brand = this.CAR_BRANDS[Math.floor(Math.random() * this.CAR_BRANDS.length)];
    const model = this.CAR_MODELS[Math.floor(Math.random() * this.CAR_MODELS.length)];
    return `${brand} ${model}`;
  }
  createArrayCars(amount = 100) {
    const randomCars: Car[] = Array.from({ length: amount }).map(() => ({
      name: this.generateRandomCarName(),
      color: this.generateRandomColor(),
    }));
    return randomCars;
  }
}
