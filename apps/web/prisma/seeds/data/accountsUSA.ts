// [TODO] in case we integrate to the usa plan
// and use this prisma model instead
// model AccountType {
//   id          String              @id @default(cuid())
//   name        String
//   code        String
//   description String?
//   detailTypes AccountDetailType[]
//   accounts    Account[]
//   active      Boolean             @default(true)
//   createdAt   DateTime            @default(now())
//   updatedAt   DateTime            @updatedAt
//   Company     Company             @relation(fields: [companyId], references: [id])
//   companyId   String

//   @@unique([name, companyId])
//   @@unique([code, companyId])
//   @@index([active])
// }

// model AccountDetailType {
//   id            String      @id @default(cuid())
//   name          String
//   code          String
//   description   String?
//   accountType   AccountType @relation(fields: [accountTypeId], references: [id])
//   accountTypeId String
//   accounts      Account[]
//   active        Boolean     @default(true)
//   createdAt     DateTime    @default(now())
//   updatedAt     DateTime    @updatedAt
//   Company       Company     @relation(fields: [companyId], references: [id])
//   companyId     String

//   @@unique([name, companyId])
//   @@unique([code, companyId])
//   @@index([accountTypeId])
//   @@index([active])
// }

// model Account {
//   id                  String            @id @default(cuid())
//   name                String            @db.VarChar(100)
//   accountType         AccountType       @relation(fields: [accountTypeId], references: [id])
//   accountTypeId       String
//   detailType          AccountDetailType @relation(fields: [detailTypeId], references: [id])
//   detailTypeId        String
//   description         String?           @db.VarChar(500)
//   parentId            String?
//   parent              Account?          @relation("AccountHierarchy", fields: [parentId], references: [id])
//   subAccounts         Account[]         @relation("AccountHierarchy")
//   isSubAccount        Boolean           @default(false)
//   balance             Float             @default(0)
//   asOfDate            DateTime?
//   incomeItems         Item[]            @relation("ItemIncomeAccount")
//   expenseItems        Item[]            @relation("ItemExpenseAccount")
//   inventoryAssetItems Item[]            @relation("ItemInventoryAssetAccount")
//   active              Boolean           @default(true)
//   createdAt           DateTime          @default(now())
//   updatedAt           DateTime          @updatedAt
//   Company             Company           @relation(fields: [companyId], references: [id])
//   companyId           String

//   @@unique([name, companyId])
//   @@index([accountTypeId])
//   @@index([detailTypeId])
//   @@index([parentId])
//   @@index([active])
// }
// import { SeedModule } from '../types';
// import { prisma } from '../utils';

// const seedAccounts: SeedModule = {
//   name: 'accounts',
//   dependencies: [], // This module has no dependencies
//   seed: async (context) => {
//     if (!context.companyId) {
//       throw new Error('Company ID not found in context');
//     }
//     const accountTypes = await Promise.all([
//       prisma.accountType.create({
//         data: {
//           companyId: context.companyId,
//           name: 'Accounts Receivable',
//           code: 'AR',
//           description: 'Tracks money owed to your business',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Accounts Receivable',
//                 code: 'ACCOUNTS_RECEIVABLE',
//                 description: 'Standard accounts receivable account'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Accounts Payable',
//           code: 'AP',
//           companyId: context.companyId,
//           description: 'Tracks money your business owes',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Accounts Payable',
//                 code: 'ACCOUNTS_PAYABLE',
//                 description: 'Standard accounts payable account'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Other Current Assets',
//           code: 'OCA',
//           companyId: context.companyId,
//           description: 'Tracks current assets other than A/R and bank accounts',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Allowance for Bad Debts',
//                 code: 'ALLOWANCE_FOR_BAD_DEBTS',
//                 description: 'Estimated uncollectible amounts'
//               },
//               {
//                 name: 'Development Costs',
//                 code: 'DEVELOPMENT_COSTS',
//                 description: 'Costs related to development activities'
//               },
//               {
//                 name: 'Employee Cash Advances',
//                 code: 'EMPLOYEE_CASH_ADVANCES',
//                 description: 'Money advanced to employees'
//               },
//               {
//                 name: 'Inventory',
//                 code: 'INVENTORY',
//                 description: 'Goods held for sale'
//               },
//               {
//                 name: 'Investment - Mortgage/Real Estate Loans',
//                 code: 'INVESTMENT_MORTGAGE_REAL_ESTATE_LOANS',
//                 description: 'Real estate investment loans'
//               },
//               {
//                 name: 'Investment - Tax Exempt Securities',
//                 code: 'INVESTMENT_TAX_EXEMPT_SECURITIES',
//                 description: 'Tax-exempt investment securities'
//               },
//               {
//                 name: 'Investment - US Government Obligations',
//                 code: 'INVESTMENT_US_GOVERNMENT_OBLIGATIONS',
//                 description: 'Government securities investments'
//               },
//               {
//                 name: 'Other Investments',
//                 code: 'INVESTMENTS_OTHER',
//                 description: 'Other investment types'
//               },
//               {
//                 name: 'Loans to Officers',
//                 code: 'LOANS_TO_OFFICERS',
//                 description: 'Loans given to company officers'
//               },
//               {
//                 name: 'Loans to Others',
//                 code: 'LOANS_TO_OTHERS',
//                 description: 'Loans given to other parties'
//               },
//               {
//                 name: 'Loans to Stockholders',
//                 code: 'LOANS_TO_STOCKHOLDERS',
//                 description: 'Loans given to stockholders'
//               },
//               {
//                 name: 'Other Current Assets',
//                 code: 'OTHER_CURRENT_ASSETS',
//                 description: 'Miscellaneous current assets'
//               },
//               {
//                 name: 'Prepaid Expenses',
//                 code: 'PREPAID_EXPENSES',
//                 description: 'Expenses paid in advance'
//               },
//               {
//                 name: 'Retainage',
//                 code: 'RETAINAGE',
//                 description: 'Amount withheld from payment until conditions met'
//               },
//               {
//                 name: 'Undeposited Funds',
//                 code: 'UNDEPOSITED_FUNDS',
//                 description: 'Payments received but not yet deposited'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Bank',
//           code: 'BANK',
//           companyId: context.companyId,
//           description: 'Tracks money in bank accounts',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Cash on Hand',
//                 code: 'CASH_ON_HAND',
//                 description: 'Physical cash held'
//               },
//               {
//                 name: 'Checking',
//                 code: 'CHECKING',
//                 description: 'Business checking accounts'
//               },
//               {
//                 name: 'Money Market',
//                 code: 'MONEY_MARKET',
//                 description: 'Money market accounts'
//               },
//               {
//                 name: 'Rents Held in Trust',
//                 code: 'RENTS_HELD_IN_TRUST',
//                 description: 'Rental payments held in trust'
//               },
//               {
//                 name: 'Savings',
//                 code: 'SAVINGS',
//                 description: 'Business savings accounts'
//               },
//               {
//                 name: 'Trust Account',
//                 code: 'TRUST_ACCOUNT',
//                 description: 'Trust accounts'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           companyId: context.companyId,
//           name: 'Fixed Assets',
//           code: 'FA',
//           description: 'Tracks long-term assets',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Accumulated Amortization',
//                 code: 'ACCUMULATED_AMORTIZATION',
//                 description: 'Total amortization of assets'
//               },
//               {
//                 name: 'Accumulated Depletion',
//                 code: 'ACCUMULATED_DEPLETION',
//                 description: 'Total depletion of natural resources'
//               },
//               {
//                 name: 'Accumulated Depreciation',
//                 code: 'ACCUMULATED_DEPRECIATION',
//                 description: 'Total depreciation of assets'
//               },
//               {
//                 name: 'Buildings',
//                 code: 'BUILDINGS',
//                 description: 'Company buildings'
//               },
//               {
//                 name: 'Depletable Assets',
//                 code: 'DEPLETABLE_ASSETS',
//                 description: 'Natural resources that can be depleted'
//               },
//               {
//                 name: 'Computers',
//                 code: 'FIXED_ASSET_COMPUTERS',
//                 description: 'Computer equipment'
//               },
//               {
//                 name: 'Copiers',
//                 code: 'FIXED_ASSET_COPIERS',
//                 description: 'Copy machines'
//               },
//               {
//                 name: 'Furniture',
//                 code: 'FIXED_ASSET_FURNITURE',
//                 description: 'Office furniture'
//               },
//               {
//                 name: 'Tools and Equipment',
//                 code: 'FIXED_ASSET_OTHER_TOOLS_EQUIPMENT',
//                 description: 'Various tools and equipment'
//               },
//               {
//                 name: 'Phone Equipment',
//                 code: 'FIXED_ASSET_PHONE',
//                 description: 'Telephone systems'
//               },
//               {
//                 name: 'Photo/Video Equipment',
//                 code: 'FIXED_ASSET_PHOTO_VIDEO',
//                 description: 'Photography and video equipment'
//               },
//               {
//                 name: 'Software',
//                 code: 'FIXED_ASSET_SOFTWARE',
//                 description: 'Software assets'
//               },
//               {
//                 name: 'Furniture and Fixtures',
//                 code: 'FURNITURE_AND_FIXTURES',
//                 description: 'Office furniture and fixtures'
//               },
//               {
//                 name: 'Intangible Assets',
//                 code: 'INTANGIBLE_ASSETS',
//                 description: 'Non-physical assets'
//               },
//               {
//                 name: 'Land',
//                 code: 'LAND',
//                 description: 'Land owned by company'
//               },
//               {
//                 name: 'Leasehold Improvements',
//                 code: 'LEASEHOLD_IMPROVEMENTS',
//                 description: 'Improvements to leased property'
//               },
//               {
//                 name: 'Machinery and Equipment',
//                 code: 'MACHINERY_AND_EQUIPMENT',
//                 description: 'Production machinery and equipment'
//               },
//               {
//                 name: 'Other Fixed Assets',
//                 code: 'OTHER_FIXED_ASSETS',
//                 description: 'Miscellaneous fixed assets'
//               },
//               {
//                 name: 'Vehicles',
//                 code: 'VEHICLES',
//                 description: 'Company vehicles'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           companyId: context.companyId,
//           name: 'Other Assets',
//           code: 'OA',
//           description: 'Tracks other long-term assets',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Accumulated Amortization of Other Assets',
//                 code: 'ACCUMULATED_AMORTIZATION_OF_OTHER_ASSETS',
//                 description: 'Total amortization of other assets'
//               },
//               {
//                 name: 'Goodwill',
//                 code: 'GOODWILL',
//                 description: 'Intangible value of acquired business'
//               },
//               {
//                 name: 'Lease Buyout',
//                 code: 'LEASE_BUYOUT',
//                 description: 'Cost to buy out a lease'
//               },
//               {
//                 name: 'Licenses',
//                 code: 'LICENSES',
//                 description: 'Business licenses'
//               },
//               {
//                 name: 'Organizational Costs',
//                 code: 'ORGANIZATIONAL_COSTS',
//                 description: 'Costs to organize the business'
//               },
//               {
//                 name: 'Other Long-term Assets',
//                 code: 'OTHER_LONG_TERM_ASSETS',
//                 description: 'Miscellaneous long-term assets'
//               },
//               {
//                 name: 'Security Deposits',
//                 code: 'SECURITY_DEPOSITS',
//                 description: 'Deposits held by others'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           companyId: context.companyId,
//           name: 'Credit Card',
//           code: 'CC',
//           description: 'Tracks credit card accounts',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Credit Card',
//                 code: 'CREDIT_CARD',
//                 description: 'Business credit card accounts'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Other Current Liabilities',
//           code: 'OCL',
//           companyId: context.companyId,
//           description: 'Tracks current liabilities other than A/P',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Deferred Revenue',
//                 code: 'DEFERRED_REVENUE',
//                 description: 'Revenue received but not yet earned'
//               },
//               {
//                 name: 'Federal Income Tax Payable',
//                 code: 'FEDERAL_INCOME_TAX_PAYABLE',
//                 description: 'Federal income taxes owed'
//               },
//               {
//                 name: 'Insurance Payable',
//                 code: 'INSURANCE_PAYABLE',
//                 description: 'Insurance premiums owed'
//               },
//               {
//                 name: 'Line of Credit',
//                 code: 'LINE_OF_CREDIT',
//                 description: 'Business line of credit'
//               },
//               {
//                 name: 'Loan Payable',
//                 code: 'LOAN_PAYABLE',
//                 description: 'Short-term loans due'
//               },
//               {
//                 name: 'Other Current Liabilities',
//                 code: 'OTHER_CURRENT_LIABILITIES',
//                 description: 'Miscellaneous current liabilities'
//               },
//               {
//                 name: 'Payroll Clearing',
//                 code: 'PAYROLL_CLEARING',
//                 description: 'Temporary account for payroll transactions'
//               },
//               {
//                 name: 'Payroll Tax Payable',
//                 code: 'PAYROLL_TAX_PAYABLE',
//                 description: 'Payroll taxes owed'
//               },
//               {
//                 name: 'Prepaid Expenses Payable',
//                 code: 'PREPAID_EXPENSES_PAYABLE',
//                 description: 'Prepaid expenses due'
//               },
//               {
//                 name: 'Rents in Trust - Liability',
//                 code: 'RENTS_IN_TRUST_LIABILITY',
//                 description: 'Liability for rents held in trust'
//               },
//               {
//                 name: 'Sales Tax Payable',
//                 code: 'SALES_TAX_PAYABLE',
//                 description: 'Sales taxes collected but not yet paid'
//               },
//               {
//                 name: 'State/Local Income Tax Payable',
//                 code: 'STATE_LOCAL_INCOME_TAX_PAYABLE',
//                 description: 'State/local income taxes owed'
//               },
//               {
//                 name: 'Trust Accounts - Liabilities',
//                 code: 'TRUST_ACCOUNTS_LIABILITIES',
//                 description: 'Liabilities for trust accounts'
//               },
//               {
//                 name: 'Undistributed Tips',
//                 code: 'UNDISTRIBUTED_TIPS',
//                 description: 'Tips collected but not yet distributed'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Long Term Liabilities',
//           code: 'LTL',
//           companyId: context.companyId,
//           description: 'Tracks long-term debts and obligations',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Notes Payable',
//                 code: 'NOTES_PAYABLE',
//                 description: 'Long-term notes due'
//               },
//               {
//                 name: 'Other Long-term Liabilities',
//                 code: 'OTHER_LONG_TERM_LIABILITIES',
//                 description: 'Miscellaneous long-term liabilities'
//               },
//               {
//                 name: 'Shareholder Notes Payable',
//                 code: 'SHAREHOLDER_NOTES_PAYABLE',
//                 description: 'Notes payable to shareholders'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Equity',
//           companyId: context.companyId,
//           code: 'EQ',
//           description: 'Tracks owner investments and business earnings',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Accumulated Adjustment',
//                 code: 'ACCUMULATED_ADJUSTMENT',
//                 description: 'Cumulative adjustments to equity'
//               },
//               {
//                 name: 'Common Stock',
//                 code: 'COMMON_STOCK',
//                 description: 'Common stock issued'
//               },
//               {
//                 name: 'Estimated Taxes',
//                 code: 'ESTIMATED_TAXES',
//                 description: 'Estimated tax payments'
//               },
//               {
//                 name: 'Health Insurance Premium',
//                 code: 'HEALTH_INSURANCE_PREMIUM',
//                 description: 'Health insurance premium payments'
//               },
//               {
//                 name: 'Health Savings Account Contribution',
//                 code: 'HEALTH_SAVINGS_ACCOUNT_CONTRIBUTION',
//                 description: 'HSA contributions'
//               },
//               {
//                 name: 'Opening Balance Equity',
//                 code: 'OPENING_BALANCE_EQUITY',
//                 description: 'Initial equity balance'
//               },
//               {
//                 name: "Owner's Equity",
//                 code: 'OWNERS_EQUITY',
//                 description: "Owner's investment in business"
//               },
//               {
//                 name: 'Paid-in Capital/Surplus',
//                 code: 'PAID_IN_CAPITAL_OR_SURPLUS',
//                 description: 'Additional paid-in capital'
//               },
//               {
//                 name: 'Partner Contributions',
//                 code: 'PARTNER_CONTRIBUTIONS',
//                 description: 'Capital contributed by partners'
//               },
//               {
//                 name: 'Partner Distributions',
//                 code: 'PARTNER_DISTRIBUTIONS',
//                 description: 'Distributions to partners'
//               },
//               {
//                 name: "Partners' Equity",
//                 code: 'PARTNERS_EQUITY',
//                 description: 'Partner ownership stakes'
//               },
//               {
//                 name: 'Personal Expense',
//                 code: 'PERSONAL_EXPENSE',
//                 description: 'Personal expenses paid'
//               },
//               {
//                 name: 'Personal Income',
//                 code: 'PERSONAL_INCOME',
//                 description: 'Personal income received'
//               },
//               {
//                 name: 'Preferred Stock',
//                 code: 'PREFERRED_STOCK',
//                 description: 'Preferred stock issued'
//               },
//               {
//                 name: 'Retained Earnings',
//                 code: 'RETAINED_EARNINGS',
//                 description: 'Accumulated earnings retained'
//               },
//               {
//                 name: 'Treasury Stock',
//                 code: 'TREASURY_STOCK',
//                 description: 'Company stock repurchased'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Income',
//           code: 'INC',
//           companyId: context.companyId,
//           description: 'Tracks revenue from primary business activities',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Discounts/Refunds Given',
//                 code: 'DISCOUNTS_REFUNDS_GIVEN',
//                 description: 'Customer discounts and refunds'
//               },
//               {
//                 name: 'Non-Profit Income',
//                 code: 'NON_PROFIT_INCOME',
//                 description: 'Income for non-profit organizations'
//               },
//               {
//                 name: 'Other Primary Income',
//                 code: 'OTHER_PRIMARY_INCOME',
//                 description: 'Other main business income'
//               },
//               {
//                 name: 'Sales of Product Income',
//                 code: 'SALES_OF_PRODUCT_INCOME',
//                 description: 'Revenue from product sales'
//               },
//               {
//                 name: 'Service Fee Income',
//                 code: 'SERVICE_FEE_INCOME',
//                 description: 'Revenue from services'
//               },
//               {
//                 name: 'Unapplied Cash Payment Income',
//                 code: 'UNAPPLIED_CASH_PAYMENT_INCOME',
//                 description: 'Unallocated cash payments'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Other Income',
//           code: 'OI',
//           companyId: context.companyId,
//           description: 'Tracks income from secondary sources',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Dividend Income',
//                 code: 'DIVIDEND_INCOME',
//                 description: 'Income from dividends'
//               },
//               {
//                 name: 'Interest Earned',
//                 code: 'INTEREST_EARNED',
//                 description: 'Income from interest'
//               },
//               {
//                 name: 'Other Investment Income',
//                 code: 'OTHER_INVESTMENT_INCOME',
//                 description: 'Other investment-related income'
//               },
//               {
//                 name: 'Other Miscellaneous Income',
//                 code: 'OTHER_MISCELLANEOUS_INCOME',
//                 description: 'Miscellaneous income sources'
//               },
//               {
//                 name: 'Tax-Exempt Interest',
//                 code: 'TAX_EXEMPT_INTEREST',
//                 description: 'Interest from tax-exempt investments'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Cost of Goods Sold',
//           code: 'COGS',
//           companyId: context.companyId,
//           description: 'Tracks direct costs of products/services sold',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Cost of Labor - COS',
//                 code: 'COST_OF_LABOR_COS',
//                 description: 'Direct labor costs'
//               },
//               {
//                 name: 'Equipment Rental - COS',
//                 code: 'EQUIPMENT_RENTAL_COS',
//                 description: 'Equipment rental for production'
//               },
//               {
//                 name: 'Other Costs of Service - COS',
//                 code: 'OTHER_COSTS_OF_SERVICES_COS',
//                 description: 'Other direct service costs'
//               },
//               {
//                 name: 'Shipping/Freight/Delivery - COS',
//                 code: 'SHIPPING_FREIGHT_AND_DELIVERY_COS',
//                 description: 'Shipping costs for goods sold'
//               },
//               {
//                 name: 'Supplies and Materials - COGS',
//                 code: 'SUPPLIES_AND_MATERIALS_COGS',
//                 description: 'Direct materials and supplies'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Expenses',
//           code: 'EXP',
//           companyId: context.companyId,
//           description: 'Tracks operating expenses',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Advertising/Promotional',
//                 code: 'ADVERTISING_PROMOTIONAL',
//                 description: 'Marketing and advertising costs'
//               },
//               {
//                 name: 'Auto',
//                 code: 'AUTO',
//                 description: 'Automobile expenses'
//               },
//               {
//                 name: 'Bad Debts',
//                 code: 'BAD_DEBTS',
//                 description: 'Uncollectible receivables'
//               },
//               {
//                 name: 'Bank Charges',
//                 code: 'BANK_CHARGES',
//                 description: 'Bank fees and charges'
//               },
//               {
//                 name: 'Charitable Contributions',
//                 code: 'CHARITABLE_CONTRIBUTIONS',
//                 description: 'Donations to charities'
//               },
//               {
//                 name: 'Communication',
//                 code: 'COMMUNICATION',
//                 description: 'Phone and internet expenses'
//               },
//               {
//                 name: 'Cost of Labor',
//                 code: 'COST_OF_LABOR',
//                 description: 'General labor costs'
//               },
//               {
//                 name: 'Dues and Subscriptions',
//                 code: 'DUES_AND_SUBSCRIPTIONS',
//                 description: 'Membership and subscription fees'
//               },
//               {
//                 name: 'Entertainment',
//                 code: 'ENTERTAINMENT',
//                 description: 'Business entertainment expenses'
//               },
//               {
//                 name: 'Entertainment Meals',
//                 code: 'ENTERTAINMENT_MEALS',
//                 description: 'Business meal expenses'
//               },
//               {
//                 name: 'Equipment Rental',
//                 code: 'EQUIPMENT_RENTAL',
//                 description: 'General equipment rental'
//               },
//               {
//                 name: 'Finance Costs',
//                 code: 'FINANCE_COSTS',
//                 description: 'Financing-related expenses'
//               },
//               {
//                 name: 'Insurance',
//                 code: 'INSURANCE',
//                 description: 'Business insurance expenses'
//               },
//               {
//                 name: 'Interest Paid',
//                 code: 'INTEREST_PAID',
//                 description: 'Interest expenses'
//               },
//               {
//                 name: 'Legal and Professional Fees',
//                 code: 'LEGAL_AND_PROFESSIONAL_FEES',
//                 description: 'Legal and professional services'
//               },
//               {
//                 name: 'Office/General Administrative Expenses',
//                 code: 'OFFICE_GENERAL_ADMINISTRATIVE_EXPENSES',
//                 description: 'General office expenses'
//               },
//               {
//                 name: 'Other Business Expenses',
//                 code: 'OTHER_BUSINESS_EXPENSES',
//                 description: 'Miscellaneous business expenses'
//               },
//               {
//                 name: 'Other Miscellaneous Service Cost',
//                 code: 'OTHER_MISCELLANEOUS_SERVICE_COST',
//                 description: 'Other service-related costs'
//               },
//               {
//                 name: 'Payroll Expenses',
//                 code: 'PAYROLL_EXPENSES',
//                 description: 'General payroll costs'
//               },
//               {
//                 name: 'Payroll Tax Expenses',
//                 code: 'PAYROLL_TAX_EXPENSES',
//                 description: 'Employer payroll taxes'
//               },
//               {
//                 name: 'Rent or Lease of Buildings',
//                 code: 'RENT_OR_LEASE_OF_BUILDINGS',
//                 description: 'Building rental expenses'
//               },
//               {
//                 name: 'Repair and Maintenance',
//                 code: 'REPAIR_AND_MAINTENANCE',
//                 description: 'Maintenance expenses'
//               },
//               {
//                 name: 'Shipping/Freight/Delivery',
//                 code: 'SHIPPING_FREIGHT_AND_DELIVERY',
//                 description: 'General shipping costs'
//               },
//               {
//                 name: 'Supplies and Materials',
//                 code: 'SUPPLIES_AND_MATERIALS',
//                 description: 'Office supplies and materials'
//               },
//               {
//                 name: 'Taxes Paid',
//                 code: 'TAXES_PAID',
//                 description: 'General tax expenses'
//               },
//               {
//                 name: 'Travel',
//                 code: 'TRAVEL',
//                 description: 'Business travel expenses'
//               },
//               {
//                 name: 'Travel Meals',
//                 code: 'TRAVEL_MEALS',
//                 description: 'Meals during business travel'
//               },
//               {
//                 name: 'Unapplied Cash Bill Payment Expense',
//                 code: 'UNAPPLIED_CASH_BILL_PAYMENT_EXPENSE',
//                 description: 'Unallocated bill payments'
//               },
//               {
//                 name: 'Utilities',
//                 code: 'UTILITIES',
//                 description: 'Utility expenses'
//               }
//             ]
//           }
//         }
//       }),

//       prisma.accountType.create({
//         data: {
//           name: 'Other Expense',
//           code: 'OE',
//           companyId: context.companyId,
//           description: 'Tracks non-operating expenses',
//           detailTypes: {
//             create: [
//               {
//                 name: 'Amortization',
//                 code: 'AMORTIZATION',
//                 description: 'Amortization expenses'
//               },
//               {
//                 name: 'Depreciation',
//                 code: 'DEPRECIATION',
//                 description: 'Depreciation expenses'
//               },
//               {
//                 name: 'Exchange Gain or Loss',
//                 code: 'EXCHANGE_GAIN_OR_LOSS',
//                 description: 'Currency exchange differences'
//               },
//               {
//                 name: 'Gas and Fuel',
//                 code: 'GAS_AND_FUEL',
//                 description: 'Fuel expenses'
//               },
//               {
//                 name: 'Home Office',
//                 code: 'HOME_OFFICE',
//                 description: 'Home office expenses'
//               },
//               {
//                 name: 'Homeowner Rental Insurance',
//                 code: 'HOMEOWNER_RENTAL_INSURANCE',
//                 description: 'Insurance for rental properties'
//               },
//               {
//                 name: 'Mortgage Interest - Home Office',
//                 code: 'MORTGAGE_INTEREST_HOME_OFFICE',
//                 description: 'Home office mortgage interest'
//               },
//               {
//                 name: 'Other Home Office Expenses',
//                 code: 'OTHER_HOME_OFFICE_EXPENSES',
//                 description: 'Miscellaneous home office costs'
//               },
//               {
//                 name: 'Other Miscellaneous Expense',
//                 code: 'OTHER_MISCELLANEOUS_EXPENSE',
//                 description: 'Other miscellaneous expenses'
//               },
//               {
//                 name: 'Other Vehicle Expenses',
//                 code: 'OTHER_VEHICLE_EXPENSES',
//                 description: 'Miscellaneous vehicle expenses'
//               },
//               {
//                 name: 'Parking and Tolls',
//                 code: 'PARKING_AND_TOLLS',
//                 description: 'Parking and toll expenses'
//               },
//               {
//                 name: 'Penalties and Settlements',
//                 code: 'PENALTIES_AND_SETTLEMENTS',
//                 description: 'Fines and settlement costs'
//               },
//               {
//                 name: 'Property Tax - Home Office',
//                 code: 'PROPERTY_TAX_HOME_OFFICE',
//                 description: 'Home office property taxes'
//               },
//               {
//                 name: 'Rent and Lease - Home Office',
//                 code: 'RENT_AND_LEASE_HOME_OFFICE',
//                 description: 'Home office rental costs'
//               },
//               {
//                 name: 'Repairs and Maintenance - Home Office',
//                 code: 'REPAIRS_AND_MAINTENANCE_HOME_OFFICE',
//                 description: 'Home office maintenance'
//               },
//               {
//                 name: 'Utilities - Home Office',
//                 code: 'UTILITIES_HOME_OFFICE',
//                 description: 'Home office utilities'
//               },
//               {
//                 name: 'Vehicle',
//                 code: 'VEHICLE',
//                 description: 'General vehicle expenses'
//               },
//               {
//                 name: 'Vehicle Insurance',
//                 code: 'VEHICLE_INSURANCE',
//                 description: 'Vehicle insurance costs'
//               },
//               {
//                 name: 'Vehicle Lease',
//                 code: 'VEHICLE_LEASE',
//                 description: 'Vehicle lease payments'
//               },
//               {
//                 name: 'Vehicle Loan',
//                 code: 'VEHICLE_LOAN',
//                 description: 'Vehicle loan payments'
//               },
//               {
//                 name: 'Vehicle Loan Interest',
//                 code: 'VEHICLE_LOAN_INTEREST',
//                 description: 'Vehicle loan interest'
//               },
//               {
//                 name: 'Vehicle Registration',
//                 code: 'VEHICLE_REGISTRATION',
//                 description: 'Vehicle registration fees'
//               },
//               {
//                 name: 'Vehicle Repairs',
//                 code: 'VEHICLE_REPAIRS',
//                 description: 'Vehicle repair costs'
//               },
//               {
//                 name: 'Wash and Road Services',
//                 code: 'WASH_AND_ROAD_SERVICES',
//                 description: 'Vehicle washing and road services'
//               }
//             ]
//           }
//         }
//       })
//     ]);

//     console.log('Seed data created successfully');
//   }
// };
// export default seedAccounts;
