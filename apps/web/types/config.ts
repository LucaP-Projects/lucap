export type SMTPConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
};

export type NotificationConfig = {
  paymentReminders: boolean;
  paymentReceived: boolean;
  subscriptionExpiring: boolean;
  daysBeforeExpiration: number;
  adminNewCustomerAlert: boolean;
  adminPaymentAlert: boolean;
};

export type SystemConfig = {
  paymentEventTypes: {
    oneTime: boolean;
    subscription: boolean;
    installment: boolean;
  };
  allowSubCustomers: boolean;
  maxSubCustomersPerCustomer: number;
  currency: string;
  defaultPaymentTerms: number; // days
  systemEmail: string;
  smtp: SMTPConfig;
  notifications: NotificationConfig;
};
