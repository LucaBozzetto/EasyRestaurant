export interface Statistic {
  _id: string;
  user: string;
  customersServed?: number;
  dishesPrepared?: number;
  customersHistory?: [{date: string, customers: number}];
  tags?: any;
}
