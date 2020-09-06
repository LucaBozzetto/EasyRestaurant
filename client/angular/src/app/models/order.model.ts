import { ElementER } from './element.model';

export enum OrderStatus {
  Preparation = 'preparation',
  BeverageReady = 'beverageready',
  FoodReady = 'foodready',
  Completed = 'completed',
  Checkedout = 'checkedout',
}

export interface Order {
  _id: string;
  orderNumber: number;
  status: OrderStatus;
  submittedAt: string;
  waiter: string;
  table: string;
  tableNumber: number;
  food?: ElementER[];
  beverage?: ElementER[];
}
