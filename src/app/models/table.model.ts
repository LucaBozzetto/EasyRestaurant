export interface Table {
    _id: string;
    tableNumber: number;
    seats: number;
    free: boolean;
    waiter?: string;
    occupiedAt?: Date;
    orders?: any;
    customers?: number;
}
