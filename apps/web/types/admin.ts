export type PaymentMethods =
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CHEQUE'
  | 'OTHER';
export type BusinessType = 'LLC' | 'Corporation' | 'Non-Profit' | 'Other';
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'CNY';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface NotificationConfig {
  paymentReminders: boolean;
  paymentReceived: boolean;
  subscriptionExpiring: boolean;
  daysBeforeExpiration: number;
  adminNewCustomerAlert: boolean;
  adminPaymentAlert: boolean;
  emailTemplates?: {
    welcome?: string;
    paymentConfirmation?: string;
    subscriptionReminder?: string;
    customTemplates?: Record<string, string>;
  };
}

export interface SubscriptionConfig {
  enableTrialPeriod: boolean;
  trialPeriodDays?: number;
  allowMultipleSubscriptions: boolean;
  enableAutomaticRenewal: boolean;
  gracePeriodDays: number;
  defaultPaymentTerms: number;
  paymentMethods: PaymentMethods[];
  cancelPolicy?: {
    allowCancellation: boolean;
    refundPolicy: 'none' | 'prorated' | 'full';
    minimumPeriod?: number;
  };
}

export interface PaymentConfig {
  defaultCurrency: CurrencyCode;
  supportedCurrencies: CurrencyCode[];
  paymentMethods: PaymentMethods[];
  taxSettings: {
    enableTax: boolean;
    defaultTaxRate?: number;
    taxIdentifier?: string;
    taxCalculation: 'inclusive' | 'exclusive';
  };
  invoiceSettings: {
    prefix: string;
    startingNumber: number;
    nextNumber: number;
    footer?: string;
    terms?: string;
    dueTerms: number;
  };
}

export interface OrganizationConfig {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  phone2?: string;
  fax?: string;
  address?: string;
  website?: string;
  taxId?: string;
  businessType: BusinessType;
  currency: CurrencyCode;
  timezone: string;
  fiscalYearStart?: string;
  branding?: {
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    customCss?: string;
  };
  legal?: {
    termsUrl?: string;
    privacyUrl?: string;
    companyNumber?: string;
  };
  active: boolean;
}

export interface CustomerConfig {
  allowSubCustomers: boolean;
  maxSubCustomersPerCustomer: number;
  idCardSettings?: {
    enabled: boolean;
    template?: string;
    fields: string[];
  };
  approvalProcess?: {
    requireApproval: boolean;
    autoApprove: boolean;
    approverRoles: string[];
  };
}

export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge?: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions?: number;
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: ('email' | 'authenticator' | 'sms')[];
  };
  ipRestrictions?: string[];
}

export interface IntegrationConfig {
  payment?: {
    lemonsqueezy?: {
      enabled: boolean;
      apiKey?: string;
      secretKey?: string;
      sandbox: boolean;
    };
    konnect?: {
      enabled: boolean;
      apiKey?: string;
      secretKey?: string;
      sanbox: boolean;
      addPaymentFeesToAmount?: boolean; // Add payment fees to the invoice amount
    };
  };
  email?: {
    smtp?: SMTPConfig;
    sendgrid?: {
      enabled: boolean;
      apiKey?: string;
      fromEmail?: string;
    };
  };
  storage?: {
    type: 's3' | 'local';
    config: Record<string, any>;
  };
}

export interface SystemConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  maintenanceMode: boolean;
  features: {
    subscriptions: boolean;
    payments: boolean;
    subCustomers: boolean;
    communications: boolean;
    installments: 'coming_soon';
    vendorStore: 'coming_soon';
  };
  debugging?: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    storage: number; // days to keep logs
  };
}

export interface AdminConfiguration {
  organization: OrganizationConfig;
  customers: CustomerConfig;
  subscriptions: SubscriptionConfig;
  payments: PaymentConfig;
  notifications: NotificationConfig;
  security: SecurityConfig;
  integrations: IntegrationConfig;
  system: SystemConfig;
}

// Helper type for config keys
export type ConfigKey = keyof AdminConfiguration;

// Helper type for partial updates
export type PartialAdminConfig = Partial<AdminConfiguration>;

// Helper type for config updates
export interface ConfigUpdate {
  key: ConfigKey;
  value: any;
  updatedBy: string;
  updatedAt: Date;
}

// Helper function to validate configuration
export function validateConfig(config: Partial<AdminConfiguration>): boolean {
  // Add your validation logic here
  return true;
}

// Helper function to get default configuration
export function getDefaultConfig(): AdminConfiguration {
  return {
    organization: {
      name: '',
      email: '',
      businessType: 'LLC',
      currency: 'USD',
      timezone: 'UTC',
      active: true
    },
    customers: {
      allowSubCustomers: true,
      maxSubCustomersPerCustomer: 5,
      approvalProcess: {
        requireApproval: false,
        autoApprove: false,
        approverRoles: []
      }
    },
    subscriptions: {
      enableTrialPeriod: false,
      allowMultipleSubscriptions: false,
      enableAutomaticRenewal: true,
      gracePeriodDays: 7,
      defaultPaymentTerms: 30,
      paymentMethods: ['CREDIT_CARD', 'BANK_TRANSFER']
    },
    payments: {
      defaultCurrency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      paymentMethods: ['CREDIT_CARD', 'BANK_TRANSFER'],
      taxSettings: {
        enableTax: false,
        taxCalculation: 'exclusive'
      },
      invoiceSettings: {
        prefix: 'INV',
        startingNumber: 1000,
        nextNumber: 1000,
        dueTerms: 30
      }
    },
    notifications: {
      paymentReminders: true,
      paymentReceived: true,
      subscriptionExpiring: true,
      daysBeforeExpiration: 7,
      adminNewCustomerAlert: true,
      adminPaymentAlert: true
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      sessionSettings: {
        timeout: 3600
      },
      twoFactorAuth: {
        enabled: false,
        required: false,
        methods: ['email']
      }
    },
    integrations: {
      payment: {
        lemonsqueezy: {
          enabled: true,
          sandbox: false
        },
        konnect: {
          enabled: true,
          sanbox: false
        }
      },
      email: {
        smtp: {
          host: '',
          port: 587,
          secure: true,
          auth: {
            user: '',
            pass: ''
          },
          from: ''
        }
      },
      storage: {
        type: 'local',
        config: {}
      }
    },
    system: {
      version: '1.0.0',
      environment: 'development',
      maintenanceMode: false,
      features: {
        subscriptions: true,
        payments: true,
        subCustomers: true,
        communications: true,
        installments: 'coming_soon',
        vendorStore: 'coming_soon'
      }
    }
  };
}
