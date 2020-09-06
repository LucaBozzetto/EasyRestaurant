import { Item } from './item.model';

export enum ElementERStatus {
  Waiting = 'waiting',
  Preparation = 'preparation',
  Completed = 'completed',
}

export interface ElementER {
  _id: string;
  status: ElementERStatus;
  quantity: number;
  item: Item;
  extra?: Item[];
  note?: string;
}
