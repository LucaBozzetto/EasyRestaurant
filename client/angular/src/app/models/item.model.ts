export enum ItemType {
  Food = 'food',
  Beverage = 'beverage',
  Extra = 'extra',
}

export interface Item {
  _id: string;
  name: string;
  price: number;
  type: ItemType;
  tag?: string;
  timeRequired?: number;
}
