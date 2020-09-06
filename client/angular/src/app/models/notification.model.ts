export interface NotificationER {
  _id: string;
  orderNumber: number;
  table: string;
  tableNumber: number;
  bar: boolean;
  waiter: string;
  message?: string;
}
