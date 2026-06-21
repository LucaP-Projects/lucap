export interface Payment {
  id: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: string;
  reference?: string;
}
