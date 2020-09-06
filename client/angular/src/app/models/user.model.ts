export enum Role {
  Waiter = 'waiter',
  Bar = 'bar',
  Cook = 'cook',
  Cashier = 'cashier',
}

export class User {
  constructor(
    public username: string,
    public name: string,
    public surname: string,
    public role: Role,
    public admin: boolean,
    public hired: Date,
    // tslint:disable-next-line: variable-name
    public _id: string,
    public wage?: number,
  ) {}
}
