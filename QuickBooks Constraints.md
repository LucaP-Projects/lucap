# QuickBooks Online API — Complete Constraints Reference

**Auto-generated from QBO API documentation**

## Legend

| Symbol | Meaning |
|--------|--------|
| R | Required (always) |
| CR | Conditionally Required |
| RO | Read Only (system-calculated) |
| O | Optional |
| R/U | Required for update (create = O, update = R) |

**Total documents: 73  |  Total constraints: ~2,100+**

---

# Transaction ENTITIES

## Bill

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| APAccountRef | ReferenceType | O | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| SalesTermRef | ReferenceType | O | Reference to the Term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more transactions linked to this Bill object. The LinkedTxn.TxnType can be set to PurchaseOrder , BillPaymentCheck , or ReimburseCharge . Use LinkedTxn.TxnId as the ID of the transaction. |
| TotalAmt | BigDecimal | O | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, a custom value can be provided. If no value is supplied, the resulting DocNumber is null. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details of all taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| IncludeInAnnualTPAR | Boolean | O | Include the supplier in the annual TPAR. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Bill was created from. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the bill is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | The minimum line item required for the request. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| APAccountRef | ReferenceType | O | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| SalesTermRef | ReferenceType | O | Reference to the Term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more transactions linked to this Bill object. The LinkedTxn.TxnType can be set to PurchaseOrder , BillPaymentCheck , or ReimburseCharge . Use LinkedTxn.TxnId as the ID of the transaction. |
| TotalAmt | BigDecimal | O | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, a custom value can be provided. If no value is supplied, the resulting DocNumber is null. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details of all taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| IncludeInAnnualTPAR | Boolean | O | Include the supplier in the annual TPAR. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Bill was created from. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the bill is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |

**Total: 49 constraints**

---

## Billpayment

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique Identifier for an Intuit entity (object). Sort order is ASC by default. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items representing zero or more Bill , VendorCredit , and JournalEntry objects linked to this BillPayment object. Use Line.LinkedTxn.TxnId as the ID in a separate Bill, VendorCredit, or JournalEntry read request to retrieve details of the linked object. LinkedTxnLine: |
| TotalAmt | BigDecimal | R | Indicates the total amount associated with this payment. This includes the total of all the payments from the payment line details. If TotalAmt is greater than the total on the lines being paid, the overpayment is treated as a credit and exposed as such on the QuickBooks UI. It cannot be negative. |
| PayType | BillPaymentTypeEnum | R | The payment type. Valid values include: Check , CreditCard |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here .Required if multicurrency is enabled for the company |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, a custom value can be provided. If no value is supplied, the resulting DocNumber is null. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the form. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| APAccountRef | ReferenceType | O | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ProcessBillPayment | Boolean | O | Indicates that the payment should be processed by merchant account service. Valid for QuickBooks companies with credit card processing. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CheckPayment | BillPaymentCheck | Information about a check payment for the transaction. Not applicable to Estimate and SalesOrder. Used when PayType is Check . |  |
| CreditCardPayment | BillPaymentCreditCard | Information about a credit card payment for the transaction. Not applicable to Estimate and SalesOrder. Used when PayType is CreditCard . |  |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. |
| TotalAmt | BigDecimal | R | Indicates the total amount of the associated with this payment. This includes the total of all the payments from the BillPayment Details. |
| Line [0..n] | Line | R | Individual line items representing zero or more Bill , VendorCredit , and JournalEntry objects linked to this BillPayment object. Valid Line types include: LinkedTxnLine: |
| PayType | BillPaymentTypeEnum | R | The payment type. Valid values include: Check , CreditCard |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| CreditCardPayment | BillPaymentCreditCard | CR | Information about a credit card payment for the transaction. Not applicable to Estimate and SalesOrder. Required when PayType is CreditCard . |
| CheckPayment | BillPaymentCheck | CR | Reference to the vendor for this transaction. Required when PayType is Check . |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| sparse | String | R | Include and set to true to void an object. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique Identifier for an Intuit entity (object). Sort order is ASC by default. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items representing zero or more Bill , VendorCredit , and JournalEntry objects linked to this BillPayment object. Use Line.LinkedTxn.TxnId as the ID in a separate Bill, VendorCredit, or JournalEntry read request to retrieve details of the linked object. LinkedTxnLine: |
| TotalAmt | BigDecimal | R | Indicates the total amount associated with this payment. This includes the total of all the payments from the payment line details. If TotalAmt is greater than the total on the lines being paid, the overpayment is treated as a credit and exposed as such on the QuickBooks UI. It cannot be negative. |
| PayType | BillPaymentTypeEnum | R | The payment type. Valid values include: Check , CreditCard |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here .Required if multicurrency is enabled for the company |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, a custom value can be provided. If no value is supplied, the resulting DocNumber is null. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the form. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| APAccountRef | ReferenceType | O | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ProcessBillPayment | Boolean | O | Indicates that the payment should be processed by merchant account service. Valid for QuickBooks companies with credit card processing. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CheckPayment | BillPaymentCheck | Information about a check payment for the transaction. Not applicable to Estimate and SalesOrder. Used when PayType is Check . |  |
| CreditCardPayment | BillPaymentCreditCard | Information about a credit card payment for the transaction. Not applicable to Estimate and SalesOrder. Used when PayType is CreditCard . |  |

**Total: 46 constraints**

---

## Changeorder

### Business Rules

1. A change order must be scoped to an existing project. ProjectRef is required on every create and update request.
1. A change order must reference an existing project estimate via LinkedTxn on each line. The referenced estimate must itself carry a ProjectRef.
1. Every line must include a LinkedTxn entry with TxnType: "Estimate" pointing to the parent estimate. Omitting this causes the transaction to be treated as a standalone estimate.
1. All lines within a single change order must reference the same parent estimate. Mixing references to multiple estimates is not supported.
1. CustomerRef must match the customer on the parent project estimate.
1. TotalAmt is computed by the system from line amounts and is read-only. Do not include it in create or update requests.
1. The Line array uses full-replace behavior on update. Send the complete desired state of all lines; lines omitted from the update request will be deleted.
1. Available for US companies on QuickBooks Online Advanced with the Construction Pack or Intuit Enterprise Suite. Requires the Projects feature to be enabled in company settings.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| LinkedTxn [0..n] | LinkedTxn | R | One or more linked transaction references at the header level, reflecting the parent project estimate. Also appears on each line item. Use LinkedTxn.TxnId as the ID in a separate Estimate read request to retrieve details of the linked object. TxnType must always be Estimate . |
| Line [0..n] | Line | R | Individual line items describing the work being added or removed. Supports SalesItemLineDetail and SubTotalLineDetail line types. Every line must include a LinkedTxn array referencing the parent project estimate with TxnType: "Estimate" . All lines must reference the same parent estimate. The Line array uses full-replace behavior on update — lines omitted from an update request are deleted. |
| ProjectRef | ReferenceType | R | Reference to the project this change order belongs to. Must reference an active project. Without a valid ProjectRef , the change order will not appear in the Projects dashboard. |
| CustomerRef | ReferenceType | R | Reference to the customer associated with this change order. Must match the customer on the parent project estimate. Use Customer.Id and Customer.DisplayName from the Customer object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fail. Only the latest version of the object is maintained by QuickBooks Online. |
| BillEmail | EmailAddress | CR | Email address where the change order is sent. Required when EmailStatus is set to NeedToSend . |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If not supplied, the current date on the server is used. Sort order is ASC by default. |
| PrintStatus | String | O | Printing status of the change order. Valid values: NotSet , NeedToPrint , PrintComplete . |
| TxnStatus | String | O | Current status of the change order. Valid values: Pending (default — created but not yet reviewed), Accepted (customer approved; project contracted total increases accordingly), Closed (converted to an Invoice or manually closed), Rejected (customer declined; does not affect project total). |
| AcceptedDate | Date | O | Date the change order was accepted. Populated when TxnStatus is set to Accepted . |
| ExpirationDate | Date | O | Date by which the change order must be accepted before it expires. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, sales tax is calculated first and then any discount is applied. If true , the discount is subtracted first and then sales tax is calculated. |
| DocNumber | String | O | Reference number for the change order (for example, CO-001 ). If not provided, the value is null. |
| PrivateNote | String | O | Organization-private note about the change order. This note does not appear on documents sent to the customer. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; visible on the Change Order document sent to the customer. |
| TxnTaxDetail | TxnTaxDetail | O | Tax details for the transaction. Captures sales taxes calculated based on tax codes referenced by the transaction lines. |
| AcceptedBy | String | O | Name of the customer or representative who accepted the change order. Populated when TxnStatus is set to Accepted . |
| EmailStatus | String | O | Email status of the change order. Valid values: NotSet , NeedToSend , EmailSent . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TotalCostAmt | BigDecimal | RO | Total cost amount of the transaction, calculated from the sum of all line CostAmount values. Calculated by QuickBooks business logic; any value supplied is overwritten. |
| TotalAmt | BigDecimal | RO | Total amount of the transaction including all line charges and taxes. Calculated by QuickBooks business logic from the sum of all line Amount values plus applicable tax. Do not include in create or update request bodies; any value supplied is overwritten. |
| ProjectRef | ReferenceType | R | Reference to the project this change order belongs to. The project must be active. Without a valid ProjectRef , the change order will not appear in the Projects dashboard. |
| Line | Change Order line object | R | Individual line items describing the work being added or removed. Each line must include a LinkedTxn array referencing the parent project estimate with TxnType: "Estimate" . All lines must reference the same parent estimate. Supports SalesItemLineDetail line type. |
| CustomerRef | ReferenceType | R | Reference to the customer associated with this change order. Must match the customer on the parent project estimate. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| BillEmail | EmailAddress | CR | Email address where the change order is sent. Required when EmailStatus is set to NeedToSend . |
| DocNumber | String | O | Reference number for the change order (for example, CO-001 ). If not provided, the value is null. |
| TxnStatus | String | O | Current status of the change order. Valid values: Pending , Accepted , Closed , Rejected . |
| PrivateNote | String | O | Organization-private note about the change order. This note does not appear on documents sent to the customer. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. If not supplied, the current date on the server is used. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; visible on the Change Order document sent to the customer. |
| PrintStatus | String | O | Printing status of the change order. Valid values: NotSet , NeedToPrint , PrintComplete . |
| ExpirationDate | Date | O | Date by which the change order must be accepted before it expires. |
| EmailStatus | String | O | Email status of the change order. Valid values: NotSet , NeedToSend , EmailSent . |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| LinkedTxn [0..n] | LinkedTxn | R | One or more linked transaction references at the header level, reflecting the parent project estimate. Also appears on each line item. Use LinkedTxn.TxnId as the ID in a separate Estimate read request to retrieve details of the linked object. TxnType must always be Estimate . |
| Line [0..n] | Line | R | Individual line items describing the work being added or removed. Supports SalesItemLineDetail and SubTotalLineDetail line types. Every line must include a LinkedTxn array referencing the parent project estimate with TxnType: "Estimate" . All lines must reference the same parent estimate. The Line array uses full-replace behavior on update — lines omitted from an update request are deleted. |
| ProjectRef | ReferenceType | R | Reference to the project this change order belongs to. Must reference an active project. Without a valid ProjectRef , the change order will not appear in the Projects dashboard. |
| CustomerRef | ReferenceType | R | Reference to the customer associated with this change order. Must match the customer on the parent project estimate. Use Customer.Id and Customer.DisplayName from the Customer object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fail. Only the latest version of the object is maintained by QuickBooks Online. |
| BillEmail | EmailAddress | CR | Email address where the change order is sent. Required when EmailStatus is set to NeedToSend . |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If not supplied, the current date on the server is used. Sort order is ASC by default. |
| PrintStatus | String | O | Printing status of the change order. Valid values: NotSet , NeedToPrint , PrintComplete . |
| TxnStatus | String | O | Current status of the change order. Valid values: Pending (default — created but not yet reviewed), Accepted (customer approved; project contracted total increases accordingly), Closed (converted to an Invoice or manually closed), Rejected (customer declined; does not affect project total). |
| AcceptedDate | Date | O | Date the change order was accepted. Populated when TxnStatus is set to Accepted . |
| ExpirationDate | Date | O | Date by which the change order must be accepted before it expires. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, sales tax is calculated first and then any discount is applied. If true , the discount is subtracted first and then sales tax is calculated. |
| DocNumber | String | O | Reference number for the change order (for example, CO-001 ). If not provided, the value is null. |
| PrivateNote | String | O | Organization-private note about the change order. This note does not appear on documents sent to the customer. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; visible on the Change Order document sent to the customer. |
| TxnTaxDetail | TxnTaxDetail | O | Tax details for the transaction. Captures sales taxes calculated based on tax codes referenced by the transaction lines. |
| AcceptedBy | String | O | Name of the customer or representative who accepted the change order. Populated when TxnStatus is set to Accepted . |
| EmailStatus | String | O | Email status of the change order. Valid values: NotSet , NeedToSend , EmailSent . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TotalCostAmt | BigDecimal | RO | Total cost amount of the transaction, calculated from the sum of all line CostAmount values. Calculated by QuickBooks business logic; any value supplied is overwritten. |
| TotalAmt | BigDecimal | RO | Total amount of the transaction including all line charges and taxes. Calculated by QuickBooks business logic from the sum of all line Amount values plus applicable tax. Do not include in create or update request bodies; any value supplied is overwritten. |

**Total: 66 constraints**

---

## Creditcardpayment

### Business Rules

1. This transaction does not support multi-currency. Only payments made from home currency Bank accounts to home currency Credit Card accounts will be accepted.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CreditCardAccountRef | ReferenceType | R | Identifies the credit card account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| BankAccountRef | ReferenceType | R | Identifies the bank account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| VendorRef | ReferenceType | O | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| Memo | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| PrintStatus | String | O | Printing status of the credit-card-payment. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckNum | String | O | User entered, Check number. This field maps to the Check no. field on the Pay down credit card form. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CreditCardAccountRef | ReferenceType | R | Identifies the credit card account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| BankAccountRef | ReferenceType | R | Identifies the bank account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| VendorRef | ReferenceType | O | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| Memo | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| PrintStatus | String | O | Printing status of the credit-card-payment. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckNum | String | O | User entered, Check number. This field maps to the Check no. field on the Pay down credit card form. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |

**Total: 40 constraints**

---

## Creditmemo

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the credit-memo is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerLine is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the credit-memo. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TotalAmt | BigDecimal | O | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. US versions of QuickBooks only. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the deposit form. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| EmailStatus | String | O | Email status of the credit-memo. Valid values: NotSet , NeedToSend , EmailSent |
| BillAddr | PhysicalAddress | O | Bill-to address of the credit memo. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| RemainingCredit | Decimal | RO | Indicates the total credit amount still available to apply towards the payment. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the CreditMemo was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| Line | object | R | The minimum line item required for the request is one of the following. Sales item line type Group item line type |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the credit-memo is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerLine is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the credit-memo. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TotalAmt | BigDecimal | O | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. US versions of QuickBooks only. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the deposit form. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| EmailStatus | String | O | Email status of the credit-memo. Valid values: NotSet , NeedToSend , EmailSent |
| BillAddr | PhysicalAddress | O | Bill-to address of the credit memo. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| RemainingCredit | Decimal | RO | Indicates the total credit amount still available to apply towards the payment. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the CreditMemo was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |

**Total: 68 constraints**

---

## Deposit

### Business Rules

1. There must be at least one line item included in a create request.
1. Any transaction that funds the Undeposited Funds account can be linked to a Deposit object with a Deposit.Line.LinkedTxn element.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DepositToAccountRef | ReferenceType | R | Identifies the account to be used for this deposit. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items comprising the deposit. Specify a Line.LinkedTxn element along with DepositLine detail type if this line is to record a deposit for an existing transaction. Select UndepositedFunds account on the existing transaction to make it available for the Deposit. Possible types of transactions that can be linked to a Deposit include: Transfer , Payment (for Cash, CreditCard, and Check payment method types), SalesReceipt , RefundReceipt , JournalEntry . In addition, any expense object whose line item has AccountReceivable can be linked to a Payment and then that Payment can be linked to a Deposit object. Use Line.LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. Valid Line types include: LinkedTxn and DepositLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . The CurrencyRef can be overwritten by the Line.DepositLineDetail Entity. If the customer that you are referring to has a default currency of USD then the currency for this Deposit will always be set as USD. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate Department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| CashBack | CashBackInfo | O |  |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Deposit was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . The CurrencyRef can be overwritten by the Line.DepositLineDetail Entity. If the customer that you are referring to has a default currency of USD then the currency for this Deposit will always be set as USD. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepositToAccountRef | ReferenceType | O | Identifies the account to be used for this deposit. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. |
| Line [0..n] | Line | O | Individual line items of a transaction. Valid Line types include: DepositLine |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DepositToAccountRef | ReferenceType | R | Identifies the account to be used for this deposit. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items comprising the deposit. Specify a Line.LinkedTxn element along with DepositLine detail type if this line is to record a deposit for an existing transaction. Select UndepositedFunds account on the existing transaction to make it available for the Deposit. Possible types of transactions that can be linked to a Deposit include: Transfer , Payment (for Cash, CreditCard, and Check payment method types), SalesReceipt , RefundReceipt , JournalEntry . In addition, any expense object whose line item has AccountReceivable can be linked to a Payment and then that Payment can be linked to a Deposit object. Use Line.LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. Valid Line types include: LinkedTxn and DepositLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . The CurrencyRef can be overwritten by the Line.DepositLineDetail Entity. If the customer that you are referring to has a default currency of USD then the currency for this Deposit will always be set as USD. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate Department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| CashBack | CashBackInfo | O |  |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Deposit was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DepositToAccountRef | ReferenceType | R | Identifies the account to be used for this deposit. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items comprising the deposit. Specify a Line.LinkedTxn element along with DepositLine detail type if this line is to record a deposit for an existing transaction. Select UndepositedFunds account on the existing transaction to make it available for the Deposit. Possible types of transactions that can be linked to a Deposit include: Transfer , Payment (for Cash, CreditCard, and Check payment method types), SalesReceipt , RefundReceipt , JournalEntry . In addition, any expense object whose line item has AccountReceivable can be linked to a Payment and then that Payment can be linked to a Deposit object. Use Line.LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. Valid Line types include: LinkedTxn and DepositLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . The CurrencyRef can be overwritten by the Line.DepositLineDetail Entity. If the customer that you are referring to has a default currency of USD then the currency for this Deposit will always be set as USD. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction, as defined using location tracking in QuickBooks Online. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate Department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| CashBack | CashBackInfo | O |  |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Deposit was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |

**Total: 59 constraints**

---

## Estimate

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | TaxExcluded Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable .Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. When ProjectRef is passed in the US region for QuickBooks Online Advanced and Intuit Enterprise Suite SKUs, a project estimate is created if the user has projects enabled. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the estimate is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Date for delivery of goods or services. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TxnStatus | String | O | One of the following status settings: Accepted, Closed, Pending, Rejected, Converted |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more Invoice objects related to this transaction. Use LinkedTxn.TxnId as the ID in a separate Invoice read request to retrieve details of the linked object. |
| AcceptedDate | Date | O | Date estimate was accepted. |
| ExpirationDate | Date | O | Date by which estimate must be accepted before invalidation. |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| Line [0..n] | Line | O | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine (also used for inline Subtotal lines), DiscountLine and SubTotalLine (used for the overall transaction). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the invoice. Valid values: NotSet , NeedToSend , EmailSent |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| AcceptedBy | String | O | Name of customer who accepted the estimate. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Estimate was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| Line | Estimate line object | R | The minimum line item required for the request is one of the following. Sales item line type Group item line type |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. When ProjectRef is passed in the US region for QuickBooks Online Advanced and Intuit Enterprise Suite SKUs, a project estimate is created if the user has projects enabled. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | TaxExcluded Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable .Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. When ProjectRef is passed in the US region for QuickBooks Online Advanced and Intuit Enterprise Suite SKUs, a project estimate is created if the user has projects enabled. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the estimate is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Date for delivery of goods or services. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TxnStatus | String | O | One of the following status settings: Accepted, Closed, Pending, Rejected, Converted |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more Invoice objects related to this transaction. Use LinkedTxn.TxnId as the ID in a separate Invoice read request to retrieve details of the linked object. |
| AcceptedDate | Date | O | Date estimate was accepted. |
| ExpirationDate | Date | O | Date by which estimate must be accepted before invalidation. |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| Line [0..n] | Line | O | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine (also used for inline Subtotal lines), DiscountLine and SubTotalLine (used for the overall transaction). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the invoice. Valid values: NotSet , NeedToSend , EmailSent |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| AcceptedBy | String | O | Name of customer who accepted the estimate. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Estimate was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | TaxExcluded Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable .Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. When ProjectRef is passed in the US region for QuickBooks Online Advanced and Intuit Enterprise Suite SKUs, a project estimate is created if the user has projects enabled. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the estimate is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Date for delivery of goods or services. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TxnStatus | String | O | One of the following status settings: Accepted, Closed, Pending, Rejected, Converted |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more Invoice objects related to this transaction. Use LinkedTxn.TxnId as the ID in a separate Invoice read request to retrieve details of the linked object. |
| AcceptedDate | Date | O | Date estimate was accepted. |
| ExpirationDate | Date | O | Date by which estimate must be accepted before invalidation. |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| Line [0..n] | Line | O | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine (also used for inline Subtotal lines), DiscountLine and SubTotalLine (used for the overall transaction). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the invoice. Valid values: NotSet , NeedToSend , EmailSent |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| AcceptedBy | String | O | Name of customer who accepted the estimate. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Estimate was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |

**Total: 117 constraints**

---

## Invoice

### Business Rules

1. An invoice must have at least one Line for either a sales item or an inline subtotal.
1. An invoice must have CustomerRef populated.
1. The DocNumber attribute is populated automatically by the data service if not supplied.
1. If ShipAddr, BillAddr, or both are not provided, the appropriate customer address from the referenced Customer object is used to fill those values.
1. If you have a large number of invoice and corresponding payment records that you wish to import to the QuickBooks Online company, sort the invoice and payment records in chronological order and use the batch resource to send invoice and payments batches of 10, one after the other, to ensure any open invoices get credited with their payments.
1. If an invoice is taxable, there is a limit of 750 lines per invoice.
1. For US companies, invoices are automatically sent to the customer if the following conditions are met:
1. The company has activated online payments.
1. The company has opted in via **Account Settings > Sales > Automatically send imported invoices**.
1. The customer has a valid email address on file.
1. The invoice has CC or ACH payment enabled.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include SalesItemLine , GroupLine , DescriptionOnlyLine (also used for inline Subtotal lines), DiscountLine and SubTotalLine (used for the overall transaction). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Applicable if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| DocNumber | String | CR | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. yyyy/MM/dd is the valid date format. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Date for delivery of goods or services. |
| TrackingNum | String | O | Shipping provider's tracking number for the delivery of the goods associated with the transaction. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more related transactions to this Invoice object. The following linked relationships are supported: Links to Estimate and TimeActivity objects can be established directly to this Invoice object with UI or with the API. Create, Read, Update, and Query operations are avaialble at the API level for these types of links. Only one link can be made to an Estimate . Progress Invoicing is not supported via the API. Links to expenses incurred on behalf of the customer are returned in the response with LinkedTxn.TxnType set to ReimburseCharge , ChargeCredit or StatementCharge corresponding to billable customer expenses of type Cash , Delayed Credit , and Delayed Charge , respectively. Links to these types of transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links to payments applied to an Invoice object are returned in the response with LinkedTxn.TxnType set to Payment . Links to Payment transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Use LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| DepositToAccountRef | ReferenceType | O | Account to which money is deposited. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. Before you can use this field ensure that the company allows deposits in their invoices first. This can be found by querying the Preferences endpoint . SalesFormsPrefs.AllowDeposit must be equal to true. If you do not specify this account the payment is applied to the Undeposited Funds account. |
| AllowOnlineACHPayment | Boolean | O | Specifies if this invoice can be paid with online bank transfers and corresponds to the Bank transfer check box on the QuickBooks UI. Active when the company is payments-enabled, i.e., Preferences.SalesFormsPrefs.ETransactionPaymentEnabled is set to true . If set to true , allow invoice to be paid with online bank transfers. The Bank transfer check box is checked on the QuickBooks UI for this invoice. True by default if the company allows invoices to be paid with ACH. If set to false , online bank transfers are not allowed. The Bank transfer check box is not checked on the QuickBooks UI for this invoice. |
| TransactionLocationType | String | O | The account location. For UAE, valid values include ABUDHABI AJMAN SHARJAH DUBAI FUJAIRAH RAS_AL_KHAIMAH UMM_AL_QUWAIN OTHER_GCC |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Statement Memo field on the Invoice form in the QuickBooks Online UI. |
| BillEmailCc | EmailAddress | O | Identifies the carbon copy e-mail address where the invoice is sent. If not specified, this field is populated from that defined in Preferences.SalesFormsPrefs.SalesEmailCc . If this email address is invalid, carbon copy email is not sent. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the invoice. Valid values: NotSet , NeedToSend , EmailSent |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| Deposit | Decimal | O | The deposit made towards this invoice. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| AllowOnlineCreditCardPayment | Boolean | O | Specifies if online credit card payments are allowed for this invoice and corresponds to the Credit card check box on the QuickBooks UI. Active when the company is payments-enabled, i.e., Preferences.SalesFormsPrefs.ETransactionPaymentEnabled is set to true . If set to true , allow invoice to be paid with online credit card payments. The Credit card check box is checked on the QuickBooks UI for this invoice. True by default if the company allows invoices to be paid with credit cards. If set to false , online credit card payments are not allowed. The Credit card check box is not checked on the QuickBooks UI for this invoice. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| BillEmailBcc | EmailAddress | O | Identifies the blind carbon copy e-mail address where the invoice is sent. If not specified, this field is populated from that defined in Preferences.SalesFormsPrefs.SalesEmailBcc . If this email address is invalid, blind carbon copy email is not sent. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. If you update the CustomerRef , the address passed using BillAddr will be honored. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DeliveryInfo | DeliveryInfo | RO | Email delivery information. Returned when a request has been made to deliver email with the send operation. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| InvoiceLink | String | RO | Sharable link for the invoice sent to external customers. The link is generated only for invoices with online payment enabled and having a valid customer email address. Include query param `include=invoiceLink` to get the link back on query response. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Invoice was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. If you process a linked transaction against a specific transaction, the balance value won't change. It will remain the same. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| AllowOnlinePayment | Boolean | Deprecated flag to allow online payments. In use before AllowOnlineCreditCardPayment and AllowOnlineACHPayment flags existed and provided to maintain backward compatibility. If set to true , this invoice was created before AllowOnlinePayment was deprecated and denotes both CC and ACH payments are allowed. In addition, the AllowOnlineCreditCardPayment and AllowOnlineACHPayment flags must be set to true . If set to false , this invoice was created after the AllowOnlinePayment flag was deprecated and is not used. Do not modify. |  |
| AllowIPNPayment | Boolean | Flag to allow payments from legacy Intuit Payment Network (IPN). Provided to maintain backward compatibility and must always be set to false . Do not modify |  |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| Line [0..n] | Invoice line object | R | The minimum line item required for the request is one of the following. SalesItemLine , GroupLine and Inline subtotal using DescriptionOnlyLine |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include SalesItemLine , GroupLine , DescriptionOnlyLine (also used for inline Subtotal lines), DiscountLine and SubTotalLine (used for the overall transaction). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Applicable if multicurrency is enabled for the company. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| DocNumber | String | CR | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. yyyy/MM/dd is the valid date format. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Date for delivery of goods or services. |
| TrackingNum | String | O | Shipping provider's tracking number for the delivery of the goods associated with the transaction. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more related transactions to this Invoice object. The following linked relationships are supported: Links to Estimate and TimeActivity objects can be established directly to this Invoice object with UI or with the API. Create, Read, Update, and Query operations are avaialble at the API level for these types of links. Only one link can be made to an Estimate . Progress Invoicing is not supported via the API. Links to expenses incurred on behalf of the customer are returned in the response with LinkedTxn.TxnType set to ReimburseCharge , ChargeCredit or StatementCharge corresponding to billable customer expenses of type Cash , Delayed Credit , and Delayed Charge , respectively. Links to these types of transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links to payments applied to an Invoice object are returned in the response with LinkedTxn.TxnType set to Payment . Links to Payment transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Use LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| DepositToAccountRef | ReferenceType | O | Account to which money is deposited. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. Before you can use this field ensure that the company allows deposits in their invoices first. This can be found by querying the Preferences endpoint . SalesFormsPrefs.AllowDeposit must be equal to true. If you do not specify this account the payment is applied to the Undeposited Funds account. |
| AllowOnlineACHPayment | Boolean | O | Specifies if this invoice can be paid with online bank transfers and corresponds to the Bank transfer check box on the QuickBooks UI. Active when the company is payments-enabled, i.e., Preferences.SalesFormsPrefs.ETransactionPaymentEnabled is set to true . If set to true , allow invoice to be paid with online bank transfers. The Bank transfer check box is checked on the QuickBooks UI for this invoice. True by default if the company allows invoices to be paid with ACH. If set to false , online bank transfers are not allowed. The Bank transfer check box is not checked on the QuickBooks UI for this invoice. |
| TransactionLocationType | String | O | The account location. For UAE, valid values include ABUDHABI AJMAN SHARJAH DUBAI FUJAIRAH RAS_AL_KHAIMAH UMM_AL_QUWAIN OTHER_GCC |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Statement Memo field on the Invoice form in the QuickBooks Online UI. |
| BillEmailCc | EmailAddress | O | Identifies the carbon copy e-mail address where the invoice is sent. If not specified, this field is populated from that defined in Preferences.SalesFormsPrefs.SalesEmailCc . If this email address is invalid, carbon copy email is not sent. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the invoice. Valid values: NotSet , NeedToSend , EmailSent |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| Deposit | Decimal | O | The deposit made towards this invoice. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| AllowOnlineCreditCardPayment | Boolean | O | Specifies if online credit card payments are allowed for this invoice and corresponds to the Credit card check box on the QuickBooks UI. Active when the company is payments-enabled, i.e., Preferences.SalesFormsPrefs.ETransactionPaymentEnabled is set to true . If set to true , allow invoice to be paid with online credit card payments. The Credit card check box is checked on the QuickBooks UI for this invoice. True by default if the company allows invoices to be paid with credit cards. If set to false , online credit card payments are not allowed. The Credit card check box is not checked on the QuickBooks UI for this invoice. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| BillEmailBcc | EmailAddress | O | Identifies the blind carbon copy e-mail address where the invoice is sent. If not specified, this field is populated from that defined in Preferences.SalesFormsPrefs.SalesEmailBcc . If this email address is invalid, blind carbon copy email is not sent. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. If you update the CustomerRef , the address passed using BillAddr will be honored. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DeliveryInfo | DeliveryInfo | RO | Email delivery information. Returned when a request has been made to deliver email with the send operation. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| InvoiceLink | String | RO | Sharable link for the invoice sent to external customers. The link is generated only for invoices with online payment enabled and having a valid customer email address. Include query param `include=invoiceLink` to get the link back on query response. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Invoice was created from. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. If you process a linked transaction against a specific transaction, the balance value won't change. It will remain the same. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| AllowOnlinePayment | Boolean | Deprecated flag to allow online payments. In use before AllowOnlineCreditCardPayment and AllowOnlineACHPayment flags existed and provided to maintain backward compatibility. If set to true , this invoice was created before AllowOnlinePayment was deprecated and denotes both CC and ACH payments are allowed. In addition, the AllowOnlineCreditCardPayment and AllowOnlineACHPayment flags must be set to true . If set to false , this invoice was created after the AllowOnlinePayment flag was deprecated and is not used. Do not modify. |  |
| AllowIPNPayment | Boolean | Flag to allow payments from legacy Intuit Payment Network (IPN). Provided to maintain backward compatibility and must always be set to false . Do not modify |  |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| Line [0..n] | Invoice line object | R | The minimum line item required for the request is one of the following. SalesItemLine , GroupLine and Inline subtotal using DescriptionOnlyLine |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |

**Total: 119 constraints**

---

## Journalentry

### Business Rules

1. Accounts Receivable (A/R) account: needs to have a Customer in the Name Field. The A/R account is visible only after there are A/R transactions such as receive payments from invoices.
1. Accounts Payable (A/P) account: needs to have a Vendor in the Name Field. The A/P account is visible only after there are A/P transactions such Bill objects.
1. Tax Related considerations for global companies:
1. There are both Sales Tax and Purchase Tax.
1. On the transaction line , if TaxCodeRef is specified, TaxApplicableOn and TaxAmount are required. Each TaxCodeRef can result in one or more tax lines. For AU locale : On the transaction line, if GlobalTaxCalculation is TaxInclusive andTaxCodeRef is specified, TaxInclusiveAmt is required.
1. Any TxnTaxDetail lines specified are not overridden. That is, if a user provides incorrect values such that the total amount on debit is not equal to total amount on credit, an error is returned.
1. Not SKU specific.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. There must be at least one pair of Journal Entry Line elements, representing a debit and a credit, called distribution lines. Valid Line types include: JournalEntryLine and DescriptionOnlyLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive . Not applicable to US companies; required for non-US companies. |
| DocNumber | String | O | Reference number for the transaction. Throws an error when duplicate DocNumber is sent in the request and if Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber is true. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. If null value is sent in the request null will be saved. If there is a need to support assigning a docNumber when null, it can be achieved through include param, include=allowautodocnum |
| PrivateNote | String | O | User entered, organization-private note about the transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| TaxRateRef | ReferenceType | O | Reference to the Tax Adjustment Rate Ids for this item. Query the TaxRate list resource to determine the appropriate TaxRate object for this reference. Use TaxRate.Id and TaxRate.Name from that object for TaxRateRef.value and TaxRateRef.name, respectively. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| Adjustment | Boolean | O | Indicates whether this transaction is a journal entry adjustment. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the JournalEntry was created from. |
| TotalAmt | BigDecimal | RO | The value of this field will always be set to zero. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | The value of this field will always be set to zero. Applicable if multicurrency is enabled for the company. |
| Line [0..n] | Line | R | Individual line items of a journal entry. Two line items are required: one with PostingType set to Debit and one with PostingType set to Credit . Set Line.DetailType to JournalEntryLine for both lines. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. There must be at least one pair of Journal Entry Line elements, representing a debit and a credit, called distribution lines. Valid Line types include: JournalEntryLine and DescriptionOnlyLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive . Not applicable to US companies; required for non-US companies. |
| DocNumber | String | O | Reference number for the transaction. Throws an error when duplicate DocNumber is sent in the request and if Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber is true. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. If null value is sent in the request null will be saved. If there is a need to support assigning a docNumber when null, it can be achieved through include param, include=allowautodocnum |
| PrivateNote | String | O | User entered, organization-private note about the transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| TaxRateRef | ReferenceType | O | Reference to the Tax Adjustment Rate Ids for this item. Query the TaxRate list resource to determine the appropriate TaxRate object for this reference. Use TaxRate.Id and TaxRate.Name from that object for TaxRateRef.value and TaxRateRef.name, respectively. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| Adjustment | Boolean | O | Indicates whether this transaction is a journal entry adjustment. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the JournalEntry was created from. |
| TotalAmt | BigDecimal | RO | The value of this field will always be set to zero. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | The value of this field will always be set to zero. Applicable if multicurrency is enabled for the company. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. There must be at least one pair of Journal Entry Line elements, representing a debit and a credit, called distribution lines. Valid Line types include: JournalEntryLine and DescriptionOnlyLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive . Not applicable to US companies; required for non-US companies. |
| DocNumber | String | O | Reference number for the transaction. Throws an error when duplicate DocNumber is sent in the request and if Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber is true. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = WarnDuplicateJournalNumber before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. If null value is sent in the request null will be saved. If there is a need to support assigning a docNumber when null, it can be achieved through include param, include=allowautodocnum |
| PrivateNote | String | O | User entered, organization-private note about the transaction. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| TaxRateRef | ReferenceType | O | Reference to the Tax Adjustment Rate Ids for this item. Query the TaxRate list resource to determine the appropriate TaxRate object for this reference. Use TaxRate.Id and TaxRate.Name from that object for TaxRateRef.value and TaxRateRef.name, respectively. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| Adjustment | Boolean | O | Indicates whether this transaction is a journal entry adjustment. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the JournalEntry was created from. |
| TotalAmt | BigDecimal | RO | The value of this field will always be set to zero. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | The value of this field will always be set to zero. Applicable if multicurrency is enabled for the company. |

**Total: 59 constraints**

---

## Payment

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| TotalAmt | Decimal | R | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. If you process a linked refund transaction against a specific transaction, the totalAmt value won't change. It will remain the same. However, voiding the linked refund will change the totalAmt value to O. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| UnappliedAmt | Decimal | O | Indicates the amount that has not been applied to pay amounts owed for sales transactions. |
| DepositToAccountRef | ReferenceType | O | Identifies the account to be used for this payment. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. If you do not specify this account, payment is applied to the Undeposited Funds account. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company |
| Line [0..n] | Line | O | Zero or more transactions accounting for this payment. Values for Line.LinkedTxn.TxnType can be one of the following: Expense --Payment is reimbursement for expense paid by cash made on behalf of the customer Check --Payment is reimbursement for expense paid by check made on behalf of the customer CreditCardCredit --Payment is reimbursement for a credit card credit made on behalf of the customer JournalEntry --Payment is linked to the representative journal entry CreditMemo --Payment is linked to the credit memo the customer has with the business Invoice --The invoice to which payment is applied Use Line.LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| PaymentRefNum | String | O | The reference number for the payment received. For example, Check # for a check, envelope # for a cash donation. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| CreditCardPayment | CreditCardPayment | O | Information about a payment received by credit card. Inject with data only if the payment was transacted through Intuit Payments API. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only |
| TotalAmt | Decimal | R | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| sparse | String | R | Include and set to true to void an object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| TotalAmt | Decimal | R | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. If you process a linked refund transaction against a specific transaction, the totalAmt value won't change. It will remain the same. However, voiding the linked refund will change the totalAmt value to O. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| UnappliedAmt | Decimal | O | Indicates the amount that has not been applied to pay amounts owed for sales transactions. |
| DepositToAccountRef | ReferenceType | O | Identifies the account to be used for this payment. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepostiToAccountRef.name , respectively. If you do not specify this account, payment is applied to the Undeposited Funds account. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company |
| Line [0..n] | Line | O | Zero or more transactions accounting for this payment. Values for Line.LinkedTxn.TxnType can be one of the following: Expense --Payment is reimbursement for expense paid by cash made on behalf of the customer Check --Payment is reimbursement for expense paid by check made on behalf of the customer CreditCardCredit --Payment is reimbursement for a credit card credit made on behalf of the customer JournalEntry --Payment is linked to the representative journal entry CreditMemo --Payment is linked to the credit memo the customer has with the business Invoice --The invoice to which payment is applied Use Line.LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| PaymentRefNum | String | O | The reference number for the payment received. For example, Check # for a check, envelope # for a cash donation. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| CreditCardPayment | CreditCardPayment | O | Information about a payment received by credit card. Inject with data only if the payment was transacted through Intuit Payments API. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only |

**Total: 45 constraints**

---

## Purchase

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include ItemBasedExpenseLine (Available if Preferences.ProductAndServicesPrefs.ForPurchase is set to true ) and AccountBasedExpenseLine |
| PaymentType | String | R | Type can be Cash , Check , or CreditCard . |
| AccountRef | ReferenceType | R | Specifies the account reference to which this purchase is applied based on the PaymentType . A type of Check should have bank account, CreditCard should specify credit card account, etc. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AccountRef.value and AccountRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| PrintStatus | String | O | PrintStatus is applicable only for Check . Ignored for CreditCard charge or refund. Valid values: NotSet , NeedToPrint , PrintComplete. |
| RemitToAddr | PhysicalAddress | O | Address to which the payment should be sent. This attribute is applicable only for Check . Ignored for CreditCard charge or refund. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more transactions linked to this object. The LinkedTxn.TxnType can be set to ReimburseCharge . The LinkedTxn.TxnId can be set as the ID of the transaction. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | O | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers as follows: If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is true a custom value can be provided; duplicate values are not accepted. If no value is supplied, the resulting DocNumber is null. If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is false, resulting DocNumber is system generated by incrementing the last number by 1. For Cash/CreditCard transactions, throws an error when duplicate DocNumber is sent in the request. For Check transactions, error is thrown when duplicate DocNumber is sent in the request and Preferences:OtherPrefs:NameValue.Name = WarnDuplicateCheckNumber is true. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User-entered, organization-private note about the transaction. This field maps to the Memo field on the Expense form in the QuickBooks UI. |
| Credit | Boolean | O | False —it represents a charge. True —it represents a refund. Valid only for CreditCard payment type. Validation Rules: Valid only for CreditCard transactions. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| PurchaseEx | Internal use | O | For internal use. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| EntityRef | ReferenceType, | O | Specifies the party with whom an expense is associated. Can be Customer , Vendor, or Employee. Query the corresponding name list resource of the associated type to determine the appropriate object for this reference. Use the Id and DisplayName values from that object for EntityRef.value and EntityRef.name , respectively. Set EntityRef.type to the type of object associated with this expense. For example, if this object represents a purchase from a vendor, then set EntityRef.type to Vendor and query the Vendor resource for the appropriate object to reference. |
| IncludeInAnnualTPAR | Boolean | O | Include the supplier in the annual TPAR. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Purchase was created from. |
| PaymentType | String | R | Payment Type can be: Cash , Check , or CreditCard . |
| AccountRef | ReferenceType | R | Specifies the account reference. Check must specify bank account, CreditCard must specify credit card account. Validation Rules:Valid and Active Account Reference of an appropriate type. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line type for create: AccountBasedExpenseLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include ItemBasedExpenseLine (Available if Preferences.ProductAndServicesPrefs.ForPurchase is set to true ) and AccountBasedExpenseLine |
| PaymentType | String | R | Type can be Cash , Check , or CreditCard . |
| AccountRef | ReferenceType | R | Specifies the account reference to which this purchase is applied based on the PaymentType . A type of Check should have bank account, CreditCard should specify credit card account, etc. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AccountRef.value and AccountRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| PrintStatus | String | O | PrintStatus is applicable only for Check . Ignored for CreditCard charge or refund. Valid values: NotSet , NeedToPrint , PrintComplete. |
| RemitToAddr | PhysicalAddress | O | Address to which the payment should be sent. This attribute is applicable only for Check . Ignored for CreditCard charge or refund. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more transactions linked to this object. The LinkedTxn.TxnType can be set to ReimburseCharge . The LinkedTxn.TxnId can be set as the ID of the transaction. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | O | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers as follows: If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is true a custom value can be provided; duplicate values are not accepted. If no value is supplied, the resulting DocNumber is null. If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is false, resulting DocNumber is system generated by incrementing the last number by 1. For Cash/CreditCard transactions, throws an error when duplicate DocNumber is sent in the request. For Check transactions, error is thrown when duplicate DocNumber is sent in the request and Preferences:OtherPrefs:NameValue.Name = WarnDuplicateCheckNumber is true. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User-entered, organization-private note about the transaction. This field maps to the Memo field on the Expense form in the QuickBooks UI. |
| Credit | Boolean | O | False —it represents a charge. True —it represents a refund. Valid only for CreditCard payment type. Validation Rules: Valid only for CreditCard transactions. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| PurchaseEx | Internal use | O | For internal use. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| EntityRef | ReferenceType, | O | Specifies the party with whom an expense is associated. Can be Customer , Vendor, or Employee. Query the corresponding name list resource of the associated type to determine the appropriate object for this reference. Use the Id and DisplayName values from that object for EntityRef.value and EntityRef.name , respectively. Set EntityRef.type to the type of object associated with this expense. For example, if this object represents a purchase from a vendor, then set EntityRef.type to Vendor and query the Vendor resource for the appropriate object to reference. |
| IncludeInAnnualTPAR | Boolean | O | Include the supplier in the annual TPAR. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Purchase was created from. |

**Total: 56 constraints**

---

## Purchaseorder

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| APAccountRef | ReferenceType | R | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| POEmail | EmailAddress | O | Used to specify the vendor e-mail address where the purchase req is sent. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more Bill objects linked to this purchase order; LinkedTxn.TxnType is set to Bill . To retrieve details of a linked Bill transaction, issue a separate request to read the Bill whose ID is linkedTxn.TxnId . |
| Memo | String | O | A message for the vendor. This text appears on the Purchase Order object sent to the vendor. |
| POStatus | String | O | Purchase order status. Valid values are: Open and Closed . |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers as follows: If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is false, resulting DocNumber is system generated by incrementing the last number by 1. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the purchase order to the vendor. This field maps to the Memo field on the Purchase Order form. |
| ShipMethodRef | ReferenceType | O | Reference to the user-defined ShipMethod associated with the transaction. Store shipping method string in both ShipMethodRef.value and ShipMethodRef.name . |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| ShipTo | ReferenceType | O | Reference to the customer to whose shipping address the order will be shipped to. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Address to which the vendor shipped or will ship any goods associated with the purchase. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| VendorAddr | PhysicalAddress | O | Address to which the payment should be sent. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| EmailStatus | String | O | Email status of the purchase order. Valid values: NotSet , NeedToSend , EmailSent |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the PurchaseOrder was created from. |
| APAccountRef | ReferenceType | R | Specifies which AP account to which the bill is credited. Many/most small businesses have a single AP account, so the account can be implied. When specified, the account must be a Liability account, and further, the sub-type must be of type Payables. We strongly recommend that the AP Account be explicitly specified in all cases as companies that have more then one AP account will encounter unexpected errors when relating transactions to each other. |
| VendorRef | ReferenceType | R | The vendor reference for this transaction. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: Item line. Note: The ItemRef in the ItemBasedExpenseLine below must reference an Item in QBO that has an expense account linked to it (e.g. in the ExpenseAccountRef field of the Item). Otherwise the request fails in QBO with a 'You must select an account for this transaction.' error. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| APAccountRef | ReferenceType | R | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| POEmail | EmailAddress | O | Used to specify the vendor e-mail address where the purchase req is sent. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| SalesTermRef | ReferenceType | O | Reference to the sales term associated with the transaction. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more Bill objects linked to this purchase order; LinkedTxn.TxnType is set to Bill . To retrieve details of a linked Bill transaction, issue a separate request to read the Bill whose ID is linkedTxn.TxnId . |
| Memo | String | O | A message for the vendor. This text appears on the Purchase Order object sent to the vendor. |
| POStatus | String | O | Purchase order status. Valid values are: Open and Closed . |
| DueDate | Date | O | Date when the payment of the transaction is due. If date is not provided, the number of days specified in SalesTermRef added the transaction date will be used. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers as follows: If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is false, resulting DocNumber is system generated by incrementing the last number by 1. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the purchase order to the vendor. This field maps to the Memo field on the Purchase Order form. |
| ShipMethodRef | ReferenceType | O | Reference to the user-defined ShipMethod associated with the transaction. Store shipping method string in both ShipMethodRef.value and ShipMethodRef.name . |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| ShipTo | ReferenceType | O | Reference to the customer to whose shipping address the order will be shipped to. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Address to which the vendor shipped or will ship any goods associated with the purchase. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| VendorAddr | PhysicalAddress | O | Address to which the payment should be sent. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| EmailStatus | String | O | Email status of the purchase order. Valid values: NotSet , NeedToSend , EmailSent |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the PurchaseOrder was created from. |

**Total: 60 constraints**

---

## Recurringtransaction

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | O | Unique identifier for this object. Sort order is ASC by default. |
| RecurringInfo | RecurringInfo | R | Describes the recurring schedules for transactions. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| RecurDataRef | ReferenceType | O | Reference to the recur template associated with the transaction. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Type | String | Specifies the list of entities that are supported for recurring transactions: Bill , Purchase , CreditMemo , Deposit , Estimate , Invoice , JournalEntry , RefundReceipt , SalesReceipt , Transfer , VendorCredit or PurchaseOrder |  |
| RecurringInfo | RecurringInfo | R | Describes the recurring schedules for transactions. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |

**Total: 9 constraints**

---

## Refundreceipt

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DepositToAccountRef | ReferenceType | R | Account from which payment money is refunded. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine (read-only) |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| PaymentRefNum | String | CR | The reference number for the payment received. For example, check # for a check, envelope # for a cash donation. Provide when DepositToAccountRef references an Account object where Account.AccountType=Bank . Required when PrintStatus is set to PrintComplete . If PrintStatus is set to NeedToPrint , the system sets PaymentRefNum to To Print . |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckPayment | CheckPayment | O | Information about a check payment for the transaction. Used when PaymentType is Check . |
| TxnSource | String | O | The originating source of the credit card transaction. Used in eCommerce apps where credit card transactions are processed by a merchant account. When set to IntuitPayment , this transaction is inserted into a list of pending deposits to be automatically matched and reconciled with the merchant's account when the transactions made via QuickBooks Payments settle. Currently, the only supported value is IntuitPayment . |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. Recommended best practice: check the setting of Preferences:CustomTxnNumber before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the refund receipt to the customer. This field maps to the Memo field on the refund receipt form. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transaction. |
| CreditCardPayment | CreditCardPayment | O | Information about a credit card payment for the transaction. Used when PaymentType is CreditCard . Inject with data only if the payment was transacted through Intuit Payments API. |
| CustomerRef | ReferenceType | O | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| PaymentType | PaymentTypeEnum | O | Valid values are Cash , Check , CreditCard , or Other . |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. Default Value: false Constraints: US versions of QuickBooks only. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Applicable if multicurrency is enabled for the company |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the RefundReceipt was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DepositToAccountRef | ReferenceType | R | Accounts receivable asset account from which payment money is refunded. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. CurrencyRefType Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |
| Line [0..n] | RefundReceipt line object | R | The minimum line item required for the request is one of the following: SalesItemLine and GroupLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DepositToAccountRef | ReferenceType | R | Account from which payment money is refunded. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine (read-only) |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| PaymentRefNum | String | CR | The reference number for the payment received. For example, check # for a check, envelope # for a cash donation. Provide when DepositToAccountRef references an Account object where Account.AccountType=Bank . Required when PrintStatus is set to PrintComplete . If PrintStatus is set to NeedToPrint , the system sets PaymentRefNum to To Print . |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. If EmailStatus=NeedToSend , BillEmail is a required input. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckPayment | CheckPayment | O | Information about a check payment for the transaction. Used when PaymentType is Check . |
| TxnSource | String | O | The originating source of the credit card transaction. Used in eCommerce apps where credit card transactions are processed by a merchant account. When set to IntuitPayment , this transaction is inserted into a list of pending deposits to be automatically matched and reconciled with the merchant's account when the transactions made via QuickBooks Payments settle. Currently, the only supported value is IntuitPayment . |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. Recommended best practice: check the setting of Preferences:CustomTxnNumber before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the refund receipt to the customer. This field maps to the Memo field on the refund receipt form. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transaction. |
| CreditCardPayment | CreditCardPayment | O | Information about a credit card payment for the transaction. Used when PaymentType is CreditCard . Inject with data only if the payment was transacted through Intuit Payments API. |
| CustomerRef | ReferenceType | O | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| TxnTaxDetail | TxnTaxDetail | O | This data type provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| PaymentType | PaymentTypeEnum | O | Valid values are Cash , Check , CreditCard , or Other . |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. Default Value: false Constraints: US versions of QuickBooks only. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Applicable if multicurrency is enabled for the company |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the RefundReceipt was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| TaxExemptionRef | ReferenceType | RO | Reference to the TaxExepmtion ID associated with this object. Available for companies that have automated sales tax enabled. TaxExemptionRef.Name : The Tax Exemption Id for the customer to which this object is associated. This Id is typically issued by the state. TaxExemptionRef.value : The system-generated Id of the exemption type. For internal use only. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DepositToAccountRef | ReferenceType | R | Accounts receivable asset account from which payment money is refunded. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. CurrencyRefType Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |
| Line [0..n] | RefundReceipt line object | R | The minimum line item required for the request is one of the following: SalesItemLine and GroupLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |

**Total: 78 constraints**

---

## Salesreceipt

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine (read-only). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. Required if EmailStatus=NeedToSend |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Location of the transaction, as defined using location tracking in QuickBooks Online. |
| TrackingNum | String | O | Shipping provider's tracking number for the delivery of the goods associated with the transaction. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| PaymentRefNum | String | O | The reference number for the payment received. For example, Â Check # for a check, envelope # for a cash donation. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more related transactions to this sales receipt object. The following linked relationships are supported: Links to Estimate and TimeActivity objects can be established directly to this sales receipt object with UI or with the API. Create, Read, Update, and Query operations are avaialble at the API level for these types of links. Only one link can be made to an Estimate . Links to expenses incurred on behalf of the customer are returned in the response with LinkedTxn.TxnType set to ReimburseCharge , ChargeCredit or StatementCharge corresponding to billable customer expenses of type Cash , Delayed Credit , and Delayed Charge , respectively. Links to these types of transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links to payments applied to an sales receipt object are returned in the response with LinkedTxn.TxnType set to Payment . Links to Payment transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links the sales receipt to refundReceipt objects that are applied to the sales receipt. Returned in the response if linkedTxnTxnType is a refundReceipt. Note that linking sales receipts to refund receipts can only be done via the customer-facing QuickBooks UI. This is only available as read-only via our API Use LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. Default Value: false Constraints: US versions of QuickBooks only. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the transaction form to the customer. This field maps to the Memo field on the Sales Receipt form. |
| DepositToAccountRef | ReferenceType | O | Account to which payment money is deposited. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. If you do not specify this account, payment is applied to the Undeposited Funds account. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the receipt. Valid values: NotSet , NeedToSend , EmailSent . |
| CreditCardPayment | CreditCardPayment | O | Information about a credit card payment for the transaction. Used when PaymentType is CreditCard . Inject with data only if the payment was transacted through Intuit Payments API. |
| TxnTaxDetail | TxnTaxDetail | O | This element provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DeliveryInfo | DeliveryInfo | RO | Email delivery information. Returned when a request has been made to deliver email with the send operation. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the SalesReceipt was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. If you process a linked refund transaction against a specific transaction, the totalAmt value won't change. It will remain the same. However, voiding the linked refund will change the totalAmt value to O. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| Line [0..n] | object | R | The minimum line item required for the request is one of the following: SalesItemLine and GroupLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| sparse | String | R | Include and set to true to void an object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine (read-only). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. Required if EmailStatus=NeedToSend |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Location of the transaction, as defined using location tracking in QuickBooks Online. |
| TrackingNum | String | O | Shipping provider's tracking number for the delivery of the goods associated with the transaction. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| PaymentRefNum | String | O | The reference number for the payment received. For example, Â Check # for a check, envelope # for a cash donation. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more related transactions to this sales receipt object. The following linked relationships are supported: Links to Estimate and TimeActivity objects can be established directly to this sales receipt object with UI or with the API. Create, Read, Update, and Query operations are avaialble at the API level for these types of links. Only one link can be made to an Estimate . Links to expenses incurred on behalf of the customer are returned in the response with LinkedTxn.TxnType set to ReimburseCharge , ChargeCredit or StatementCharge corresponding to billable customer expenses of type Cash , Delayed Credit , and Delayed Charge , respectively. Links to these types of transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links to payments applied to an sales receipt object are returned in the response with LinkedTxn.TxnType set to Payment . Links to Payment transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links the sales receipt to refundReceipt objects that are applied to the sales receipt. Returned in the response if linkedTxnTxnType is a refundReceipt. Note that linking sales receipts to refund receipts can only be done via the customer-facing QuickBooks UI. This is only available as read-only via our API Use LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. Default Value: false Constraints: US versions of QuickBooks only. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the transaction form to the customer. This field maps to the Memo field on the Sales Receipt form. |
| DepositToAccountRef | ReferenceType | O | Account to which payment money is deposited. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. If you do not specify this account, payment is applied to the Undeposited Funds account. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the receipt. Valid values: NotSet , NeedToSend , EmailSent . |
| CreditCardPayment | CreditCardPayment | O | Information about a credit card payment for the transaction. Used when PaymentType is CreditCard . Inject with data only if the payment was transacted through Intuit Payments API. |
| TxnTaxDetail | TxnTaxDetail | O | This element provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DeliveryInfo | DeliveryInfo | RO | Email delivery information. Returned when a request has been made to deliver email with the send operation. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the SalesReceipt was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. If you process a linked refund transaction against a specific transaction, the totalAmt value won't change. It will remain the same. However, voiding the linked refund will change the totalAmt value to O. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: SalesItemLine , GroupLine , DescriptionOnlyLine , DiscountLine and SubTotalLine (read-only). If the transaction is taxable there is a limit of 750 lines per transaction. |
| CustomerRef | ReferenceType | R | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ShipFromAddr | PhysicalAddress | CR | Identifies the address where the goods are shipped from. For transactions without shipping, it represents the address where the sale took place. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) and automated tax calculations are being used, this field is required for an accurate sales tax calculation. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| BillEmail | EmailAddress | CR | Identifies the e-mail address where the invoice is sent. Required if EmailStatus=NeedToSend |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| ShipDate | Date | O | Location of the transaction, as defined using location tracking in QuickBooks Online. |
| TrackingNum | String | O | Shipping provider's tracking number for the delivery of the goods associated with the transaction. |
| ClassRef | ReferenceType | O | Reference to the Class associated with the transaction. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PrintStatus | String | O | Printing status of the invoice. Valid values: NotSet , NeedToPrint , PrintComplete . |
| PaymentRefNum | String | O | The reference number for the payment received. For example, Â Check # for a check, envelope # for a cash donation. |
| TxnSource | String | O | Used internally to specify originating source of a credit card transaction. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more related transactions to this sales receipt object. The following linked relationships are supported: Links to Estimate and TimeActivity objects can be established directly to this sales receipt object with UI or with the API. Create, Read, Update, and Query operations are avaialble at the API level for these types of links. Only one link can be made to an Estimate . Links to expenses incurred on behalf of the customer are returned in the response with LinkedTxn.TxnType set to ReimburseCharge , ChargeCredit or StatementCharge corresponding to billable customer expenses of type Cash , Delayed Credit , and Delayed Charge , respectively. Links to these types of transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links to payments applied to an sales receipt object are returned in the response with LinkedTxn.TxnType set to Payment . Links to Payment transactions are established within the QuickBooks UI, only, and are available as read-only at the API level. Links the sales receipt to refundReceipt objects that are applied to the sales receipt. Returned in the response if linkedTxnTxnType is a refundReceipt. Note that linking sales receipts to refund receipts can only be done via the customer-facing QuickBooks UI. This is only available as read-only via our API Use LinkedTxn.TxnId as the ID in a separate read request for the specific resource to retrieve details of the linked object. |
| ApplyTaxAfterDiscount | Boolean | O | If false or null, calculate the sales tax first, and then apply the discount. If true, subtract the discount first and then calculate the sales tax. Default Value: false Constraints: US versions of QuickBooks only. |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:CustomTxnNumber as follows: If Preferences:CustomTxnNumber is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:CustomTxnNumber is false, resulting DocNumber is system generated by incrementing the last number by 1. If Preferences:CustomTxnNumber is false then do not send a value as it can lead to unwanted duplicates. If a DocNumber value is sent for an Update operation, then it just updates that particular invoice and does not alter the internal system DocNumber. Note: DocNumber is an optional field for all locales except France. For France locale if Preferences:CustomTxnNumber is enabled it will not be automatically generated and is a required field. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the transaction form to the customer. This field maps to the Memo field on the Sales Receipt form. |
| DepositToAccountRef | ReferenceType | O | Account to which payment money is deposited. Query the Account name list resource to determine the appropriate Account object for this reference, where Account.AccountType is Other Current Asset or Bank . Use Account.Id and Account.Name from that object for DepositToAccountRef.value and DepositToAccountRef.name , respectively. If you do not specify this account, payment is applied to the Undeposited Funds account. |
| CustomerMemo | MemoRef | O | User-entered message to the customer; this message is visible to end user on their transactions. |
| EmailStatus | String | O | Email status of the receipt. Valid values: NotSet , NeedToSend , EmailSent . |
| CreditCardPayment | CreditCardPayment | O | Information about a credit card payment for the transaction. Used when PaymentType is CreditCard . Inject with data only if the payment was transacted through Intuit Payments API. |
| TxnTaxDetail | TxnTaxDetail | O | This element provides information for taxes charged on the transaction as a whole. It captures the details sales taxes calculated for the transaction based on the tax codes referenced by the transaction. This can be calculated by QuickBooks business logic or you may supply it when adding a transaction. See Global tax model for more information about this element. If sales tax is disabled ( Preferences.TaxPrefs.UsingSalesTax is set to false ) then TxnTaxDetail is ignored and not stored. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this transaction. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| ShipAddr | PhysicalAddress | O | Identifies the address where the goods must be shipped. If ShipAddr is not specified, and a default Customer:ShippingAddr is specified in QuickBooks for this customer, the default ship-to address will be used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| ShipMethodRef | ReferenceType | O | Reference to the ShipMethod associated with the transaction. There is no shipping method list. Reference resolves to a string. |
| BillAddr | PhysicalAddress | O | Bill-to address of the Invoice. If BillAddr is not specified, and a default Customer:BillingAddr is specified in QuickBooks for this customer, the default bill-to address is used by QuickBooks. For international addresses - countries should be passed as 3 ISO alpha-3 characters or the full name of the country. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| HomeBalance | Decimal | RO | Convenience field containing the amount in Balance expressed in terms of the home currency. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company. |
| DeliveryInfo | DeliveryInfo | RO | Email delivery information. Returned when a request has been made to deliver email with the send operation. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the SalesReceipt was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total amount of the transaction. This includes the total of all the charges, allowances, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. If you process a linked refund transaction against a specific transaction, the totalAmt value won't change. It will remain the same. However, voiding the linked refund will change the totalAmt value to O. |
| Balance | Decimal | RO | The balance reflecting any payments made against the transaction. Initially set to the value of TotalAmt . A Balance of 0 indicates the invoice is fully paid. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| HomeTotalAmt | Decimal | RO | Total amount of the transaction in the home currency. Includes the total of all the charges, allowances and taxes. Calculated by QuickBooks business logic. Value is valid only when CurrencyRef is specified. Applicable if multicurrency is enabled for the company |
| FreeFormAddress | Boolean | Denotes how ShipAddr is stored: formatted or unformatted. The value of this flag is system defined based on format of shipping address at object create time. If set to false , shipping address is returned in a formatted style using City, Country, CountrySubDivisionCode, Postal code. If set to true , shipping address is returned in an unformatted style using Line1 through Line5 attributes. |  |

**Total: 125 constraints**

---

## Transfer

### Business Rules

1. A transfer must have FromAccountRef, ToAccountRef, and Amount attributes.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| ToAccountRef | ReferenceType | R | Identifies the asset account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ToAccountRef.value and ToAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| FromAccountRef | ReferenceType | R | Identifies the asset account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for FromAccountRef.value and FromAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Transfer was created from. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| ToAccountRef | ReferenceType | R | Identifies the asset account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ToAccountRef.value and ToAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| FromAccountRef | ReferenceType | R | Identifies the asset account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for FromAccountRef.value and FromAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| ToAccountRef | ReferenceType | R | Identifies the asset account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ToAccountRef.value and ToAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| FromAccountRef | ReferenceType | R | Identifies the asset account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for FromAccountRef.value and FromAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Memo field on the Invoice form. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the Transfer was created from. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| ToAccountRef | ReferenceType | R | Identifies the asset account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ToAccountRef.value and ToAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| FromAccountRef | ReferenceType | R | Identifies the asset account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for FromAccountRef.value and FromAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| ToAccountRef | ReferenceType | R | Identifies the asset account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ToAccountRef.value and ToAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |
| FromAccountRef | ReferenceType | R | Identifies the asset account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for FromAccountRef.value and FromAccountRef.name , respectively. The specified account must have Account.Classification set to Asset . |

**Total: 28 constraints**

---

## Vendorcredit

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| VendorRef | ReferenceType | R | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| GlobalTaxCalculation | GlobalTaxCalculationEnum | CR | Method in which tax is applied. Allowed values are: TaxExcluded , TaxInclusive , and NotApplicable . Not applicable to US companies; required for non-US companies. |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| DocNumber | String | O | Reference number for the transaction. If not explicitly provided at create time, this field is populated based on the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers as follows: If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is true a custom value can be provided. If no value is supplied, the resulting DocNumber is null. If Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers is false, resulting DocNumber is system generated by incrementing the last number by 1. Throws an error when duplicate DocNumber is sent in the request. Recommended best practice: check the setting of Preferences:OtherPrefs:NameValue.Name = VendorAndPurchasesPrefs.UseCustomTxnNumbers before setting DocNumber. If a duplicate DocNumber needs to be supplied, add the query parameter name/value pair, include=allowduplicatedocnum to the URI. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the transaction to the vendor. This field maps to the Memo field on the transaction form. |
| LinkedTxn [0..n] | LinkedTxn | O | Zero or more transactions linked to this object. The LinkedTxn.TxnType can be set to ReimburseCharge . The LinkedTxn.TxnId can be set as the ID of the transaction. |
| ExchangeRate | Decimal | O | The number of home currency units it takes to equal one unit of currency specified by CurrencyRef . Applicable if multicurrency is enabled for the company. |
| APAccountRef | ReferenceType | O | Specifies to which AP account the bill is credited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for APAccountRef.value and APAccountRef.name , respectively. The specified account must have Account.Classification set to Liability and Account.AccountSubType set to AccountsPayable . If the company has a single AP account, the account is implied. However, it is recommended that the AP Account be explicitly specified in all cases to prevent unexpected errors when relating transactions to each other. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of the transaction. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| IncludeInAnnualTPAR | Boolean | O | Include the supplier in the annual TPAR. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| Balance | Decimal | O | The current amount of the vendor credit reflecting any adjustments to the original credit amount. Initially set to the value of TotalAmt . Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| RecurDataRef | ReferenceType | RO | A reference to the Recurring Transaction. It captures what recurring transaction template the VendorCredit was created from. |
| TotalAmt | BigDecimal | RO | Indicates the total credit amount, determined by taking the total of all all lines of the transaction. This includes all charges, allowances, discounts, and taxes. Calculated by QuickBooks business logic; any value you supply is over-written by QuickBooks. |
| VendorRef | ReferenceType | R | The vendor reference for this transaction. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| VendorRef | ReferenceType | R | The vendor reference for this transaction. |
| Line [0..n] | Line | R | Individual line items of a transaction. Valid Line types include: ItemBasedExpenseLine and AccountBasedExpenseLine |
| CurrencyRef | CurrencyRefType | CR | Reference to the currency in which all amounts on the associated transaction are expressed. This must be defined if multicurrency is enabled for the company. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . Required if multicurrency is enabled for the company |

**Total: 26 constraints**

---


# Name List ENTITIES

## Account

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| AcctNum | String | CR | User-defined account number to help the user in identifying the account within the chart-of-accounts and in deciding what should be posted to the account. The Account.AcctNum attribute must not contain colon (:). Name must be unique. Max length for Account.AcctNum : AU & CA: 20 characters. US, UK & IN: 7 characters |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which this account holds amounts. |
| ParentRef | ReferenceType | O | Specifies the Parent AccountId if this represents a SubAccount. |
| Description | String | O | User entered description for the account, which may include user entered information to guide bookkeepers/accountants in deciding what journal entries to post to the account. |
| Active | Boolean | O | Whether or not active inactive accounts may be hidden from most display purposes and may not be posted to. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| SubAccount | Boolean | RO | Specifies whether this object represents a parent (false) or subaccount (true). Please note that accounts of these types - OpeningBalanceEquity , UndepositedFunds , RetainedEarnings , CashReceiptIncome , CashExpenditureExpense , ExchangeGainOrLoss cannot have a sub account and cannot be a sub account of another account. |
| Classification | String | RO | The classification of an account. Not supported for non-posting accounts. Valid values include: Asset , Equity , Expense , Liability , Revenue |
| FullyQualifiedName | String | RO | Fully qualified name of the object; derived from Name and ParentRef . The fully qualified name prepends the topmost parent, followed by each subaccount separated by colons and takes the form of Parent:Account1:SubAccount1:SubAccount2 . System generated. Limited to 5 levels. |
| AccountType | AccountTypeEnum | A detailed account classification that specifies the use of this account. The type is based on the Classification. |  |
| CurrentBalanceWithSubAccounts | Decimal | RO | Specifies the cumulative balance amount for the current Account and all its sub-accounts. |
| TaxCodeRef | ReferenceType | Reference to the default tax code used by this account. Tax codes are referenced by the TaxCode.Id in the TaxCode object. For global locales, only. |  |
| AccountSubType | String | The account sub-type classification and is based on the AccountType value. |  |
| CurrentBalance | Decimal | RO | Specifies the balance amount for the current Account. Valid for Balance Sheet accounts. |
| Name | String | R | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| AcctNum | String | CR | User-defined account number to help the user in identifying the account within the chart-of-accounts and in deciding what should be posted to the account. The Account.AcctNum attribute must not contain colon (:). |
| TaxCodeRef | ReferenceType | CR | Reference to the default tax code used by this account. Tax codes are referenced by the TaxCode.Id in the TaxCode object. For global locales, only. |
| AccountType | AccountTypeEnum | CR | A detailed account classification that specifies the use of this account. The type is based on the Classification. Required if AccountSubType is not specified. |
| AccountSubType | String | CR | The account sub-type classification and is based on the AccountType value. Required if AccountType is not specified. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| AcctNum | String | CR | User-defined account number to help the user in identifying the account within the chart-of-accounts and in deciding what should be posted to the account. The Account.AcctNum attribute must not contain colon (:). Name must be unique. Max length for Account.AcctNum : AU & CA: 20 characters. US, UK & IN: 7 characters |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which this account holds amounts. |
| ParentRef | ReferenceType | O | Specifies the Parent AccountId if this represents a SubAccount. |
| Description | String | O | User entered description for the account, which may include user entered information to guide bookkeepers/accountants in deciding what journal entries to post to the account. |
| Active | Boolean | O | Whether or not active inactive accounts may be hidden from most display purposes and may not be posted to. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| SubAccount | Boolean | RO | Specifies whether this object represents a parent (false) or subaccount (true). Please note that accounts of these types - OpeningBalanceEquity , UndepositedFunds , RetainedEarnings , CashReceiptIncome , CashExpenditureExpense , ExchangeGainOrLoss cannot have a sub account and cannot be a sub account of another account. |
| Classification | String | RO | The classification of an account. Not supported for non-posting accounts. Valid values include: Asset , Equity , Expense , Liability , Revenue |
| FullyQualifiedName | String | RO | Fully qualified name of the object; derived from Name and ParentRef . The fully qualified name prepends the topmost parent, followed by each subaccount separated by colons and takes the form of Parent:Account1:SubAccount1:SubAccount2 . System generated. Limited to 5 levels. |
| AccountType | AccountTypeEnum | A detailed account classification that specifies the use of this account. The type is based on the Classification. |  |
| CurrentBalanceWithSubAccounts | Decimal | RO | Specifies the cumulative balance amount for the current Account and all its sub-accounts. |
| TaxCodeRef | ReferenceType | Reference to the default tax code used by this account. Tax codes are referenced by the TaxCode.Id in the TaxCode object. For global locales, only. |  |
| AccountSubType | String | The account sub-type classification and is based on the AccountType value. |  |
| CurrentBalance | Decimal | RO | Specifies the balance amount for the current Account. Valid for Balance Sheet accounts. |

**Total: 39 constraints**

---

## Class

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Class. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ParentRef | ReferenceType | CR | The immediate parent of the SubClass. Required if this object is a subclass. |
| SubClass | Boolean | O | Specifies whether this object is a subclass. true --this object represents a subclass. false or null--this object represents a top-level class. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub class separated by colons. Takes the form of Parent:Class1:SubClass1:SubClass2 . Limited to 5 levels. |
| Name | String | R | User recognizable name for the Class. |
| ParentRef | ReferenceType | CR | For class objects that are sub-classes: the immediate parent of this object. Required if this object is a subclass. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Class. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ParentRef | ReferenceType | CR | The immediate parent of the SubClass. Required if this object is a subclass. |
| SubClass | Boolean | O | Specifies whether this object is a subclass. true --this object represents a subclass. false or null--this object represents a top-level class. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub class separated by colons. Takes the form of Parent:Class1:SubClass1:SubClass2 . Limited to 5 levels. |

**Total: 18 constraints**

---

## Customer

### Business Rules

1. The DisplayName, Title, GivenName, MiddleName, FamilyName, Suffix, and PrintOnCheckName attributes must not contain colon (:), tab (\\t), or newline (\\n) characters.
1. The DisplayName attribute must be unique across all other customer, employee, and vendor objects.
1. The PrimaryEmailAddress attribute must contain an at sign (@) and dot (.).
1. Nested Customer objects can be used to define sub-customers, jobs, or a combination of both, under a parent.
1. Up to four levels of nesting can be defined under a top-level parent Customer object.
1. The Job attribute defines whether the object is a parent customer or nested sub-customer/job.
1. The DisplayName attribute or at least one of Title, GivenName, MiddleName, FamilyName, or Suffix attributes is required during object create.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| DisplayName | String | CR | The name of the person or organization as displayed. Must be unique across all Customer, Vendor, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating customer name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| ResaleNum | String | O | Resale number or some additional info about the customer. |
| SecondaryTaxIdentifier | String | O | Also called UTR No. in ( UK ) , CST Reg No. ( IN ) also represents the tax registration number of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| DefaultTaxCodeRef | ReferenceType | O | Reference to a default tax code associated with this Customer object. Reference is valid if Customer.Taxable is set to true; otherwise, it is ignored. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) the default tax code is set by the system and can not be overridden. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for DefaultTaxCodeRef.value and DefaultTaxCodeRef.name , respectively. |
| PreferredDeliveryMethod | String | O | Preferred delivery method. Values are Print, Email, or None. |
| SalesTermRef | ReferenceType | O | Reference to a SalesTerm associated with this Customer object. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| CustomerTypeRef | String | O | Reference to the customer type assigned to a customer. This field is only returned if the customer is assigned a customer type. |
| Fax | TelephoneNumber | O | Fax number. |
| BillWithParent | Boolean | O | If true, this Customer object is billed with its parent. If false, or null the customer is not to be billed with its parent. This attribute is valid only if this entity is a Job or sub Customer. |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which all amounts associated with this customer are expressed. Once set, it cannot be changed. If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this customer is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency . |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| Job | Boolean | O | If true, this is a Job or sub-customer. If false or null, this is a top level customer, not a Job or sub-customer. |
| BalanceWithJobs | Decimal | O | Cumulative open balance amount for the Customer (or Job) and all its sub-jobs. Cannot be written to QuickBooks. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| OpenBalanceDate | Date | O | Date of the Open Balance for the create operation. Write-on-create. |
| Taxable | Boolean | O | If true, transactions for this customer are taxable. Default behavior: true, if DefaultTaxCodeRef is defined or false if TaxExemptionReasonId is set. |
| AlternatePhone | TelephoneNumber | O | Alternate phone number. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| ParentRef | ReferenceType | O | A reference to a Customer object that is the immediate parent of the Sub-Customer/Job in the hierarchical Customer:Job list. Required for the create operation if this object is a sub-customer or Job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for ParentRef.value and ParentRef.name , respectively. |
| Notes | String | O | Free form text describing the Customer. |
| WebAddr | WebSiteAddress | O | Website address. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. If there is an amount in Customer.Balance when setting this Customer object to inactive through the QuickBooks UI, a CreditMemo balancing transaction is created for the amount. |
| CompanyName | String | O | The name of the company associated with the person or organization. |
| Balance | Decimal | O | Specifies the open balance amount or the amount unpaid by the customer. For the create operation, this represents the opening balance for the customer. When returned in response to the query request it represents the current open balance (unpaid amount) for that customer. Write-on-create. |
| ShipAddr | PhysicalAddress | O | Default shipping address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this Customer object. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| IsProject | Boolean | O | If true, indicates this is a Project. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| PrimaryTaxIdentifier | String | O | Also called Tax Reg. No in ( UK ) , ( CA ) , ( IN ) , ( AU ) represents the tax ID of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName. Constraints: Cannot be removed with sparse update. |
| BillAddr | PhysicalAddress | O | Default billing address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| FullyQualifiedName | String | RO | Fully qualified name of the object. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Customer:Job:Sub-job . System generated. Limited to 5 levels. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the entity is located. Zero specifies the top level of the hierarchy; anything above will be level with respect to the parent. Constraints: up to 5 levels |
| TaxExemptionReasonId | Numeric Id | The tax exemption reason associated with this customer object. Applicable if automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) for the company. Set TaxExemptionReasonId: to one of the following: Id Reason 1 Federal government 2 State government 3 Local government 4 Tribal government 5 Charitable organization 6 Religious organization 7 Educational organization 8 Hospital 9 Resale 10 Direct pay permit 11 Multiple points of use 12 Direct mail 13 Agricultural production 14 Industrial production / manufacturing 15 Foreign diplomat |  |
| DisplayName | String | CR | The name of the person or organization as displayed. Must be unique across all Customer, Vendor, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating customer name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , Suffix , or FullyQualifiedName attributes are required during create. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| DisplayName | String | CR | The name of the person or organization as displayed. Must be unique across all Customer, Vendor, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating customer name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| ResaleNum | String | O | Resale number or some additional info about the customer. |
| SecondaryTaxIdentifier | String | O | Also called UTR No. in ( UK ) , CST Reg No. ( IN ) also represents the tax registration number of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| DefaultTaxCodeRef | ReferenceType | O | Reference to a default tax code associated with this Customer object. Reference is valid if Customer.Taxable is set to true; otherwise, it is ignored. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) the default tax code is set by the system and can not be overridden. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for DefaultTaxCodeRef.value and DefaultTaxCodeRef.name , respectively. |
| PreferredDeliveryMethod | String | O | Preferred delivery method. Values are Print, Email, or None. |
| SalesTermRef | ReferenceType | O | Reference to a SalesTerm associated with this Customer object. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| CustomerTypeRef | String | O | Reference to the customer type assigned to a customer. This field is only returned if the customer is assigned a customer type. |
| Fax | TelephoneNumber | O | Fax number. |
| BillWithParent | Boolean | O | If true, this Customer object is billed with its parent. If false, or null the customer is not to be billed with its parent. This attribute is valid only if this entity is a Job or sub Customer. |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which all amounts associated with this customer are expressed. Once set, it cannot be changed. If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this customer is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency . |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| Job | Boolean | O | If true, this is a Job or sub-customer. If false or null, this is a top level customer, not a Job or sub-customer. |
| BalanceWithJobs | Decimal | O | Cumulative open balance amount for the Customer (or Job) and all its sub-jobs. Cannot be written to QuickBooks. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| OpenBalanceDate | Date | O | Date of the Open Balance for the create operation. Write-on-create. |
| Taxable | Boolean | O | If true, transactions for this customer are taxable. Default behavior: true, if DefaultTaxCodeRef is defined or false if TaxExemptionReasonId is set. |
| AlternatePhone | TelephoneNumber | O | Alternate phone number. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| ParentRef | ReferenceType | O | A reference to a Customer object that is the immediate parent of the Sub-Customer/Job in the hierarchical Customer:Job list. Required for the create operation if this object is a sub-customer or Job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for ParentRef.value and ParentRef.name , respectively. |
| Notes | String | O | Free form text describing the Customer. |
| WebAddr | WebSiteAddress | O | Website address. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. If there is an amount in Customer.Balance when setting this Customer object to inactive through the QuickBooks UI, a CreditMemo balancing transaction is created for the amount. |
| CompanyName | String | O | The name of the company associated with the person or organization. |
| Balance | Decimal | O | Specifies the open balance amount or the amount unpaid by the customer. For the create operation, this represents the opening balance for the customer. When returned in response to the query request it represents the current open balance (unpaid amount) for that customer. Write-on-create. |
| ShipAddr | PhysicalAddress | O | Default shipping address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this Customer object. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| IsProject | Boolean | O | If true, indicates this is a Project. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| PrimaryTaxIdentifier | String | O | Also called Tax Reg. No in ( UK ) , ( CA ) , ( IN ) , ( AU ) represents the tax ID of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName. Constraints: Cannot be removed with sparse update. |
| BillAddr | PhysicalAddress | O | Default billing address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| FullyQualifiedName | String | RO | Fully qualified name of the object. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Customer:Job:Sub-job . System generated. Limited to 5 levels. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the entity is located. Zero specifies the top level of the hierarchy; anything above will be level with respect to the parent. Constraints: up to 5 levels |
| TaxExemptionReasonId | Numeric Id | The tax exemption reason associated with this customer object. Applicable if automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) for the company. Set TaxExemptionReasonId: to one of the following: Id Reason 1 Federal government 2 State government 3 Local government 4 Tribal government 5 Charitable organization 6 Religious organization 7 Educational organization 8 Hospital 9 Resale 10 Direct pay permit 11 Multiple points of use 12 Direct mail 13 Agricultural production 14 Industrial production / manufacturing 15 Foreign diplomat |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| DisplayName | String | CR | The name of the person or organization as displayed. Must be unique across all Customer, Vendor, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating customer name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| ResaleNum | String | O | Resale number or some additional info about the customer. |
| SecondaryTaxIdentifier | String | O | Also called UTR No. in ( UK ) , CST Reg No. ( IN ) also represents the tax registration number of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| DefaultTaxCodeRef | ReferenceType | O | Reference to a default tax code associated with this Customer object. Reference is valid if Customer.Taxable is set to true; otherwise, it is ignored. If automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) the default tax code is set by the system and can not be overridden. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for DefaultTaxCodeRef.value and DefaultTaxCodeRef.name , respectively. |
| PreferredDeliveryMethod | String | O | Preferred delivery method. Values are Print, Email, or None. |
| SalesTermRef | ReferenceType | O | Reference to a SalesTerm associated with this Customer object. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for SalesTermRef.value and SalesTermRef.name , respectively. |
| CustomerTypeRef | String | O | Reference to the customer type assigned to a customer. This field is only returned if the customer is assigned a customer type. |
| Fax | TelephoneNumber | O | Fax number. |
| BillWithParent | Boolean | O | If true, this Customer object is billed with its parent. If false, or null the customer is not to be billed with its parent. This attribute is valid only if this entity is a Job or sub Customer. |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which all amounts associated with this customer are expressed. Once set, it cannot be changed. If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this customer is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency . |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| Job | Boolean | O | If true, this is a Job or sub-customer. If false or null, this is a top level customer, not a Job or sub-customer. |
| BalanceWithJobs | Decimal | O | Cumulative open balance amount for the Customer (or Job) and all its sub-jobs. Cannot be written to QuickBooks. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| OpenBalanceDate | Date | O | Date of the Open Balance for the create operation. Write-on-create. |
| Taxable | Boolean | O | If true, transactions for this customer are taxable. Default behavior: true, if DefaultTaxCodeRef is defined or false if TaxExemptionReasonId is set. |
| AlternatePhone | TelephoneNumber | O | Alternate phone number. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| ParentRef | ReferenceType | O | A reference to a Customer object that is the immediate parent of the Sub-Customer/Job in the hierarchical Customer:Job list. Required for the create operation if this object is a sub-customer or Job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for ParentRef.value and ParentRef.name , respectively. |
| Notes | String | O | Free form text describing the Customer. |
| WebAddr | WebSiteAddress | O | Website address. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. If there is an amount in Customer.Balance when setting this Customer object to inactive through the QuickBooks UI, a CreditMemo balancing transaction is created for the amount. |
| CompanyName | String | O | The name of the company associated with the person or organization. |
| Balance | Decimal | O | Specifies the open balance amount or the amount unpaid by the customer. For the create operation, this represents the opening balance for the customer. When returned in response to the query request it represents the current open balance (unpaid amount) for that customer. Write-on-create. |
| ShipAddr | PhysicalAddress | O | Default shipping address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PaymentMethodRef | ReferenceType | O | Reference to a PaymentMethod associated with this Customer object. Query the PaymentMethod name list resource to determine the appropriate PaymentMethod object for this reference. Use PaymentMethod.Id and PaymentMethod.Name from that object for PaymentMethodRef.value and PaymentMethodRef.name , respectively. |
| IsProject | Boolean | O | If true, indicates this is a Project. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| PrimaryTaxIdentifier | String | O | Also called Tax Reg. No in ( UK ) , ( CA ) , ( IN ) , ( AU ) represents the tax ID of the Person or Organization. This value is masked in responses, exposing only last five characters. For example, the ID of 123-45-6789 is returned as XXXXXX56789 . |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName. Constraints: Cannot be removed with sparse update. |
| BillAddr | PhysicalAddress | O | Default billing address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| FullyQualifiedName | String | RO | Fully qualified name of the object. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Customer:Job:Sub-job . System generated. Limited to 5 levels. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the entity is located. Zero specifies the top level of the hierarchy; anything above will be level with respect to the parent. Constraints: up to 5 levels |
| TaxExemptionReasonId | Numeric Id | The tax exemption reason associated with this customer object. Applicable if automated sales tax is enabled ( Preferences.TaxPrefs.PartnerTaxEnabled is set to true ) for the company. Set TaxExemptionReasonId: to one of the following: Id Reason 1 Federal government 2 State government 3 Local government 4 Tribal government 5 Charitable organization 6 Religious organization 7 Educational organization 8 Hospital 9 Resale 10 Direct pay permit 11 Multiple points of use 12 Direct mail 13 Agricultural production 14 Industrial production / manufacturing 15 Foreign diplomat |  |

**Total: 139 constraints**

---

## Customertype

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Name | String | R/U | The full name of the customer type. |
| Active | Boolean | O | Indicates whether this customer type is active in the company or not. true --This customer type is active and enabled for use by QuickBooks. false —This customer type is inactive, is hidden from most display purposes, and is not availble for use with financial transactions. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |

**Total: 5 constraints**

---

## Department

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Department. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ParentRef | ReferenceType | CR | The immediate parent of the SubDepartment. Required for the create operation if this object is a SubDepartment. Required if this object is a subdepartment. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. If set to false, this entity is not available. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Parent:Department1:SubDepartment1:SubDepartment2 . Limited to 5 levels. |
| SubDepartment | Boolean | RO | Specifies whether this Department object is a SubDepartment. true --SubDepartment. false or null--top-level Department. |
| Name | String | R | User recognizable name for the department. |
| ParentRef | ReferenceType | CR | The immediate parent of the SubDepartment. Required for the create operation if this object is a SubDepartment. Required if this object is a subdepartment |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the Department. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| ParentRef | ReferenceType | CR | The immediate parent of the SubDepartment. Required for the create operation if this object is a SubDepartment. Required if this object is a subdepartment. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. If set to false, this entity is not available. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Parent:Department1:SubDepartment1:SubDepartment2 . Limited to 5 levels. |
| SubDepartment | Boolean | RO | Specifies whether this Department object is a SubDepartment. true --SubDepartment. false or null--top-level Department. |

**Total: 18 constraints**

---

## Employee

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrimaryAddr | PhysicalAddress | CR | Represents the physical street address for this employee. If QuickBooks Payroll is enabled for the company, the following PhysicalAddress fields are required: City , maximum of 255 chars CountrySubDivisionCode , maximum of 255 chars PostalCode Required when QuickBooks Payroll is enabled. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| DisplayName | String | O | The name of the person or organization as displayed. Default Value: If not supplied, the system generates DisplayName by concatenating employee name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . When QuickBooks Payroll is enabled, this attribute is read-only and a concatenation of GivenName , MiddleName , and FamilyName . |
| Title | String | O | Title of the person. This tag supports i18n, all locale. Not supported when QuickBooks Payroll is enabled. |
| BillableTime | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| GivenName | String | O | Given name or family name of a person. At least one of GivenName or FamilyName attributes is required. |
| BirthDate | Date | O | Birth date of the employee. |
| MiddleName | String | O | Middle name of the person. The person can have zero or more middle names. |
| SSN | String | O | Social security number (SSN) of the employee. If SSN is set, it is masked in the response with XXX-XX-XXXX. If XXX-XX-XXXX is sent in the create or update request, XXX-XX-XXXX is ignored and the old value is preserved. This attribute cannot be passed in a request when QuickBooks Payroll is enabled. Code for this field must be removed before submitting. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| ReleasedDate | Date | O | Release date of the employee. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CostRate | BigDecimal | O | Pay rate of the employee |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| Gender | String | O | Gender of the employee. To clear the gender value, set to Null in a full update request. Supported values include: Male or Female . |
| HiredDate | Date | O | Hire date of the employee. |
| BillRate | BigDecimal | O | This attribute can only be set if BillableTime is true. Not supported when QuickBooks Payroll is enabled. |
| Organization | Boolean | O | true --the object represents an organization. false --the object represents a person. |
| Suffix | String | O | Suffix of the name. For example, Jr . Not supported when QuickBooks Payroll is enabled. |
| FamilyName | String | O | Family name or the last name of the person. At least one of GivenName or FamilyName attributes is required. |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName . Cannot be removed with sparse update. Not supported when QuickBooks Payroll is enabled. |
| EmployeeNumber | String | O | Specifies the ID number of the employee in the employer's directory. |
| V4IDPseudonym | String | RO | Employee reference number. For internal use only. |
| PrimaryAddr | PhysicalAddress | CR | Represents the physical street address for this employee. If QuickBooks Payroll is enabled for the company, the following PhysicalAddress fields are required: City , maximum of 255 chars CountrySubDivisionCode , maximum of 255 chars PostalCode Required when QuickBooks Payroll is enabled. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| GivenName | String | O | Given name or Family name of a person. At least one of GivenName or FamilyName attributes is required. |
| FamilyName | String | O | Family name or the last name of the person. At least one of GivenName or FamilyName attributes is required. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrimaryAddr | PhysicalAddress | CR | Represents the physical street address for this employee. If QuickBooks Payroll is enabled for the company, the following PhysicalAddress fields are required: City , maximum of 255 chars CountrySubDivisionCode , maximum of 255 chars PostalCode Required when QuickBooks Payroll is enabled. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| DisplayName | String | O | The name of the person or organization as displayed. Default Value: If not supplied, the system generates DisplayName by concatenating employee name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . When QuickBooks Payroll is enabled, this attribute is read-only and a concatenation of GivenName , MiddleName , and FamilyName . |
| Title | String | O | Title of the person. This tag supports i18n, all locale. Not supported when QuickBooks Payroll is enabled. |
| BillableTime | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| GivenName | String | O | Given name or family name of a person. At least one of GivenName or FamilyName attributes is required. |
| BirthDate | Date | O | Birth date of the employee. |
| MiddleName | String | O | Middle name of the person. The person can have zero or more middle names. |
| SSN | String | O | Social security number (SSN) of the employee. If SSN is set, it is masked in the response with XXX-XX-XXXX. If XXX-XX-XXXX is sent in the create or update request, XXX-XX-XXXX is ignored and the old value is preserved. This attribute cannot be passed in a request when QuickBooks Payroll is enabled. Code for this field must be removed before submitting. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| ReleasedDate | Date | O | Release date of the employee. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CostRate | BigDecimal | O | Pay rate of the employee |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| Gender | String | O | Gender of the employee. To clear the gender value, set to Null in a full update request. Supported values include: Male or Female . |
| HiredDate | Date | O | Hire date of the employee. |
| BillRate | BigDecimal | O | This attribute can only be set if BillableTime is true. Not supported when QuickBooks Payroll is enabled. |
| Organization | Boolean | O | true --the object represents an organization. false --the object represents a person. |
| Suffix | String | O | Suffix of the name. For example, Jr . Not supported when QuickBooks Payroll is enabled. |
| FamilyName | String | O | Family name or the last name of the person. At least one of GivenName or FamilyName attributes is required. |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName . Cannot be removed with sparse update. Not supported when QuickBooks Payroll is enabled. |
| EmployeeNumber | String | O | Specifies the ID number of the employee in the employer's directory. |
| V4IDPseudonym | String | RO | Employee reference number. For internal use only. |

**Total: 55 constraints**

---

## Item

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | IdType | R/U | Unique Identifier for an Intuit entity (object). Required for the update operation. |
| Name | String | R | Name of the item. This value is unique. |
| SyncToken | String | R/U | Version number of the entity. Required for the update operation. |
| InvStartDate | Date | CR | Date of opening balance for the inventory transaction. For read operations, the date returned in this field is always the originally provided inventory start date. For update operations, the date supplied is interpreted as the inventory adjust date, is stored as such in the underlying data model, and is reflected in the QuickBooks Online UI for the object. The inventory adjust date is not exposed for read operations through the API. Required for Inventory type items. |
| Type | String | CR | Classification that specifies the use of this item. See the description at the top of the Item entity page for details about supported item types. This field is required to be explicitly set with one of the following: Inventory --Used for goods the company sells and buys that are tracked as inventory. Service --Used for non-tangible goods the company sells and buys that are not tracked as inventory. For example, specialized labor, consulting hours, and professional fees. NonInventory --Use for goods the company sells and buys that are not tracked as inventory. For example, office supplies or goods bought on behalf of the customer. . |
| QtyOnHand | Decimal | CR | Current quantity of the Inventory items available for sale. Not used for Service or NonInventory type items.Required for Inventory type items. |
| AssetAccountRef | ReferenceType | CR | Reference to the Inventory Asset account that tracks the current value of the inventory. If the same account is used for all inventory items, the current balance of this account will represent the current total value of the inventory. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AssetAccountRef.value and AssetAccountRef.name , respectively. Required for Inventory item types. |
| Sku | String | O | The stock keeping unit (SKU) for this Item. This is a company-defined identifier for an item or product used in tracking inventory. |
| SalesTaxIncluded | Boolean | O | True if the sales tax is included in the item amount, and therefore is not calculated for the transaction. |
| TrackQtyOnHand | Boolean | O | True if there is quantity on hand to be tracked. Once this value is true, it cannot be updated to false. Applicable for items of type Inventory . Not applicable for Service or NonInventory item types. |
| SalesTaxCodeRef | ReferenceType | O | For non-US companies only. Reference to the sales tax code for the Sales item. Applicable to Service and Sales item types only. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for SalesTaxCodeRef.value and SalesTaxCodeRef.name , respectively. |
| CustomExtensions | CustomExtensions | O | Array of custom extension objects that associate additional attributes with the item. The ExtensionType field specifies the type of extension. The currently supported value is DIMENSION . The AssociatedValues array contains key/value pairs referencing Dimensions DefinitionID/Dimension ValueID. Multiple key/value pairs per extension type are supported. This field is designed to support additional extension types in the future. Dimensions is available for Intuit Enterprise Suite. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| PurchaseTaxIncluded | Boolean | O | True if the purchase tax is included in the item amount, and therefore is not calculated for the transaction. |
| Description | String | O | Description of the item. |
| SubItem | Boolean | O | If true, this is a sub item. If false or null, this is a top-level item. Creating inventory hierarchies with traditional inventory items is being phased out in lieu of using categories and sub categories. |
| Taxable | Boolean | O | If true, transactions for this item are taxable. Applicable to US companies, only. |
| ReorderPoint | Decimal | O | The minimum quantity of a particular inventory item that you need to restock at any given time. The ReorderPoint value cannot be set to null for sparse updates(sparse=true). It can be set to null only for full updates. |
| PurchaseDesc | String | O | Purchase description for the item. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| PrefVendorRef | ReferenceType | O | Reference to the preferred vendor of this item. Query the Vendor name list resource to determine the appropriate object for this reference. Use Vendor.Id and Vendor.Name from that object for ParentRef.value and ParentRef.name , respectively. |
| Active | Boolean | O | If true, the object is currently enabled for use by QuickBooks. |
| ClassRef | ReferenceType | O | Reference to the Class for the item. Query the Class name list resource to determine the appropriate object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PurchaseTaxCodeRef | ReferenceType | O | Reference to the purchase tax code for the item. Applicable to Service, Other Charge, and Product (Non-Inventory) item types. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for PurchaseTaxCodeRef.value and PurchaseTaxCodeRef.name , respectively. |
| PurchaseCost | Decimal | O | Amount paid when buying or ordering the item, as expressed in the home currency. |
| ParentRef | ReferenceType | O | The immediate parent of the sub item in the hierarchical Item:SubItem list. If SubItem is true, then ParenRef is required. If SubItem is true, then ParenRef is required. Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.Name from that object for ParentRef.value and ParentRef.name , respectively. |
| UnitPrice | Decimal | O | Corresponds to the Price/Rate column on the QuickBooks Online UI to specify either unit price, a discount, or a tax rate for item. If used for unit price, the monetary value of the service or product, as expressed in the home currency. If used for a discount or tax rate, express the percentage as a fraction. For example, specify 0.4 for 40% tax. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Item:SubItem . Returned from an existing object and not input on a new object.Limited to 5 levels. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the entity is located. Zero specifies the top level of the hierarchy; anything above will be the next level with respect to the parent. Limited to 5 levels. |
| IncomeAccountRef | ReferenceType | CR | Reference to the posting account, that is, the account that records the proceeds from the sale of this item. Must be an account with account type of Sales of Product Income . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for IncomeAccountRef.value and IncomeAccountRef.name , respectively. Required for Inventory and Service item types. |
| ExpenseAccountRef | ReferenceType | Reference to the expense account used to pay the vendor for this item. Must be an account with account type of Cost of Goods Sold . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ExpenseAccountRef.value and ExpenseAccountRef.name , respectively. Required for Inventory , NonInventory , and Service item types. |  |
| TaxClassificationRef | ReferenceType | Tax classification segregates different items into different classifications and the tax classification is one of the key parameters to determine appropriate tax on transactions involving items. Tax classifications are sourced by either tax governing authorities as in Malaysia or externally like Exactor. 'Fuel', 'Garments' and 'Soft drinks' are a few examples of tax classification in layman terms. User can choose a specific tax classification for an item while creating it. A level 1 tax classification cannot be associated to an Item. |  |
| Name | String | R | Name of the item. This value must be unique, at least one character in length, and cannot include tabs, new lines, or colons. Required for create. |
| QtyOnHand | Decimal | CR | Current quantity of the Inventory items available for sale. Not used for Service or NonInventory type items.Required for Inventory type items. |
| Type | String | CR | Classification that specifies the use of this item. See the description at the top of the Item entity page for details about supported item types. Used for goods the company sells and buys that are tracked as inventory. Service --Default setting when TrackQtyOnHand , InvStartDate , and AssetAccountRef are not specified. Used for non-tangible goods the company sells and buys that are not tracked as inventory. For example, specialized labor, consulting hours, and professional fees. This field is required to be explicitly set with one of the following: Inventory --Used for goods the company sells and buys that are tracked as inventory. Service --Used for non-tangible goods the company sells and buys that are not tracked as inventory. For example, specialized labor, consulting hours, and professional fees. NonInventory --Use for goods the company sells and buys that are not tracked as inventory. For example, office supplies or goods bought on behalf of the customer. . |
| IncomeAccountRef | ReferenceType | CR | Reference to the posting account, that is, the account that records the proceeds from the sale of this item. Must be an account with account type of Sales of Product Income . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for IncomeAccountRef.value and IncomeAccountRef.name , respectively. For France locales: This is an optional field. This is the sales account id, If not provided it defaults to the default sales account: 706100 and 707100 are the default expense accounts used for Service and Product type of item, respectively. Required for Inventory and Service item types. |
| CustomExtensions | CustomExtensions | O | Array of custom extension objects that associate additional attributes with the item. The ExtensionType field specifies the type of extension. The currently supported value is DIMENSION . The AssociatedValues array contains key/value pairs referencing Dimensions DefinitionID/Dimension ValueID. Multiple key/value pairs per extension type are supported. This field is designed to support additional extension types in the future. Dimensions is available for Intuit Enterprise Suite. |
| AssetAccountRef | ReferenceType | Condtionally required | Reference to the Inventory Asset account that tracks the current value of the inventory. If the same account is used for all inventory items, the current balance of this account will represent the current total value of the inventory. Must be an account with account type of Other Current Asset . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AssetAccountRef.value and AssetAccountRef.name , respectively. Required for Inventory item types. |
| InvStartDate | Date | Condtionally required | Date of opening balance for the inventory transaction. Required when creating an Item.Type=Inventory . Required for Inventory item types. |
| ExpenseAccountRef | ReferenceType | Condtionally required | Reference to the expense account used to pay the vendor for this item. Must be an account with account type of Cost of Goods Sold . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ExpenseAccountRef.value and ExpenseAccountRef.name , respectively. For France locales: This is an optional field. This is the purchase account id, If not provided it defaults to the default purchase account: 605100 and 601100 are the default expense accounts used for Service and Product type of item, respectively. Required for Inventory , NonInventory , and Service item types. |
| Type | String | R | Must be set to the literal string, Category . |
| Name | String | R | Name of the category. |
| SubItem | Boolean | CR | true --The object is a sub-category. false --The object is a top-level category (default). Sub-categories can be nested to a maximum depth of three levels below a top-level category. Required for sub-category. |
| ParentRef | ReferenceType | CR | The immediate parent of the sub item in the hierarchical Category:Sub-category list. If SubItem is true, then ParenRef is required. Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.Name from that object for ParentRef.value and ParentRef.name , respectively. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Name | String | O | Name of the category. |
| SubItem | Boolean | O | Denotes this object is a sub-category. Returned in the response body if this object is a sub-category. true --This is a sub-category. false --This is a top-level category (default). |
| ParentRef | ReferenceType | O | Reference to the parent of this sub-category. Returned in the response body only when SubItem is set to true . Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.DisplayName from that object for ParentRef.value and ParentRef.name , respectively. |
| Active | Boolean | O | For categories, this is always set to true . |
| Type | String | O | Set to the literal string, Category . When querying Item objects with minor versions earlier than 4 specified, Category types are returned as type Service . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the object is located. First sub-category level below the top-most category is 1. Returned in the response body only when SubItem is set to true . Sub-categories can be nested to a maximum depth of three levels below a top-level category. |
| FullyQualifiedName | String | RO | Colon-separated list of the top-level category, followed by each sub-category in the hierarchy. Takes the form of Category:SubCategory1:SubCategory2:... . Limited to 5 levels: 4 category levels with an inventory, non-inventory, or service item as the 5th. |
| Id | IdType | R/U | Unique Identifier for an Intuit entity (object). Required for the update operation. |
| Name | String | R | Name of the item. This value is unique. |
| SyncToken | String | R/U | Version number of the entity. Required for the update operation. |
| InvStartDate | Date | CR | Date of opening balance for the inventory transaction. For read operations, the date returned in this field is always the originally provided inventory start date. For update operations, the date supplied is interpreted as the inventory adjust date, is stored as such in the underlying data model, and is reflected in the QuickBooks Online UI for the object. The inventory adjust date is not exposed for read operations through the API. Required for Inventory type items. |
| Type | String | CR | Classification that specifies the use of this item. See the description at the top of the Item entity page for details about supported item types. This field is required to be explicitly set with one of the following: Inventory --Used for goods the company sells and buys that are tracked as inventory. Service --Used for non-tangible goods the company sells and buys that are not tracked as inventory. For example, specialized labor, consulting hours, and professional fees. NonInventory --Use for goods the company sells and buys that are not tracked as inventory. For example, office supplies or goods bought on behalf of the customer. . |
| QtyOnHand | Decimal | CR | Current quantity of the Inventory items available for sale. Not used for Service or NonInventory type items.Required for Inventory type items. |
| AssetAccountRef | ReferenceType | CR | Reference to the Inventory Asset account that tracks the current value of the inventory. If the same account is used for all inventory items, the current balance of this account will represent the current total value of the inventory. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AssetAccountRef.value and AssetAccountRef.name , respectively. Required for Inventory item types. |
| Sku | String | O | The stock keeping unit (SKU) for this Item. This is a company-defined identifier for an item or product used in tracking inventory. |
| SalesTaxIncluded | Boolean | O | True if the sales tax is included in the item amount, and therefore is not calculated for the transaction. |
| TrackQtyOnHand | Boolean | O | True if there is quantity on hand to be tracked. Once this value is true, it cannot be updated to false. Applicable for items of type Inventory . Not applicable for Service or NonInventory item types. |
| SalesTaxCodeRef | ReferenceType | O | For non-US companies only. Reference to the sales tax code for the Sales item. Applicable to Service and Sales item types only. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for SalesTaxCodeRef.value and SalesTaxCodeRef.name , respectively. |
| CustomExtensions | CustomExtensions | O | Array of custom extension objects that associate additional attributes with the item. The ExtensionType field specifies the type of extension. The currently supported value is DIMENSION . The AssociatedValues array contains key/value pairs referencing Dimensions DefinitionID/Dimension ValueID. Multiple key/value pairs per extension type are supported. This field is designed to support additional extension types in the future. Dimensions is available for Intuit Enterprise Suite. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| PurchaseTaxIncluded | Boolean | O | True if the purchase tax is included in the item amount, and therefore is not calculated for the transaction. |
| Description | String | O | Description of the item. |
| SubItem | Boolean | O | If true, this is a sub item. If false or null, this is a top-level item. Creating inventory hierarchies with traditional inventory items is being phased out in lieu of using categories and sub categories. |
| Taxable | Boolean | O | If true, transactions for this item are taxable. Applicable to US companies, only. |
| ReorderPoint | Decimal | O | The minimum quantity of a particular inventory item that you need to restock at any given time. The ReorderPoint value cannot be set to null for sparse updates(sparse=true). It can be set to null only for full updates. |
| PurchaseDesc | String | O | Purchase description for the item. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| PrefVendorRef | ReferenceType | O | Reference to the preferred vendor of this item. Query the Vendor name list resource to determine the appropriate object for this reference. Use Vendor.Id and Vendor.Name from that object for ParentRef.value and ParentRef.name , respectively. |
| Active | Boolean | O | If true, the object is currently enabled for use by QuickBooks. |
| ClassRef | ReferenceType | O | Reference to the Class for the item. Query the Class name list resource to determine the appropriate object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| PurchaseTaxCodeRef | ReferenceType | O | Reference to the purchase tax code for the item. Applicable to Service, Other Charge, and Product (Non-Inventory) item types. Query the TaxCode name list resource to determine the appropriate TaxCode object for this reference. Use TaxCode.Id and TaxCode.Name from that object for PurchaseTaxCodeRef.value and PurchaseTaxCodeRef.name , respectively. |
| PurchaseCost | Decimal | O | Amount paid when buying or ordering the item, as expressed in the home currency. |
| ParentRef | ReferenceType | O | The immediate parent of the sub item in the hierarchical Item:SubItem list. If SubItem is true, then ParenRef is required. If SubItem is true, then ParenRef is required. Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.Name from that object for ParentRef.value and ParentRef.name , respectively. |
| UnitPrice | Decimal | O | Corresponds to the Price/Rate column on the QuickBooks Online UI to specify either unit price, a discount, or a tax rate for item. If used for unit price, the monetary value of the service or product, as expressed in the home currency. If used for a discount or tax rate, express the percentage as a fraction. For example, specify 0.4 for 40% tax. |
| FullyQualifiedName | String | RO | Fully qualified name of the entity. The fully qualified name prepends the topmost parent, followed by each sub element separated by colons. Takes the form of Item:SubItem . Returned from an existing object and not input on a new object.Limited to 5 levels. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the entity is located. Zero specifies the top level of the hierarchy; anything above will be the next level with respect to the parent. Limited to 5 levels. |
| IncomeAccountRef | ReferenceType | CR | Reference to the posting account, that is, the account that records the proceeds from the sale of this item. Must be an account with account type of Sales of Product Income . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for IncomeAccountRef.value and IncomeAccountRef.name , respectively. Required for Inventory and Service item types. |
| ExpenseAccountRef | ReferenceType | Reference to the expense account used to pay the vendor for this item. Must be an account with account type of Cost of Goods Sold . Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for ExpenseAccountRef.value and ExpenseAccountRef.name , respectively. Required for Inventory , NonInventory , and Service item types. |  |
| TaxClassificationRef | ReferenceType | Tax classification segregates different items into different classifications and the tax classification is one of the key parameters to determine appropriate tax on transactions involving items. Tax classifications are sourced by either tax governing authorities as in Malaysia or externally like Exactor. 'Fuel', 'Garments' and 'Soft drinks' are a few examples of tax classification in layman terms. User can choose a specific tax classification for an item while creating it. A level 1 tax classification cannot be associated to an Item. |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | Name of the category. |
| Type | String | R | Must be set to the literal string, Category . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| SubItem | Boolean | CR | true --The object is a sub-category. false --The object is a top-level category (default). Sub-categories can be nested to a maximum depth of three levels below a top-level category. Required if this is a sub-category object. |
| Active | Boolean | O | For categories, this is always set to true . |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the object is located. First sub-category level below the top-most category is 1. Returned in the response body only when SubItem is set to true . Sub-categories can be nested to a maximum depth of three levels below a top-level category. |
| FullyQualifiedName | String | RO | Colon-separated list of the top-level category, followed by each sub-category in the hierarchy. Takes the form of Category:SubCategory1:SubCategory2:... . Limited to 5 levels: 4 category levels with an inventory, non-inventory, or service item as the 5th. |
| ParentRef | ReferenceType | The immediate parent of the sub item in the hierarchical Category:Sub-category list. If SubItem is true, then ParenRef is required. Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.Name from that object for ParentRef.value and ParentRef.name , respectively. |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Name | String | O | Name of the category. |
| SubItem | Boolean | O | Denotes this object is a sub-category. Returned in the response body if this object is a sub-category. true --This is a sub-category. false --This is a top-level category (default). |
| ParentRef | ReferenceType | O | Reference to the parent of this sub-category. Returned in the response body only when SubItem is set to true . Query the Item name list resource to determine the appropriate object for this reference. Use Item.Id and Item.DisplayName from that object for ParentRef.value and ParentRef.name , respectively. |
| Active | Boolean | O | For categories, this is always set to true . |
| Type | String | O | Set to the literal string, Category . When querying Item objects with minor versions earlier than 4 specified, Category types are returned as type Service . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Level | Integer | RO | Specifies the level of the hierarchy in which the object is located. First sub-category level below the top-most category is 1. Returned in the response body only when SubItem is set to true . Sub-categories can be nested to a maximum depth of three levels below a top-level category. |
| FullyQualifiedName | String | RO | Colon-separated list of the top-level category, followed by each sub-category in the hierarchy. Takes the form of Category:SubCategory1:SubCategory2:... . Limited to 5 levels: 4 category levels with an inventory, non-inventory, or service item as the 5th. |

**Total: 106 constraints**

---

## Paymentmethod

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the payment method. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| Type | String | O | Defines the type of payment. Valid values include CREDIT_CARD or NON_CREDIT_CARD . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Name | String | R | User recognizable name for the payment method. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the payment method. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| Type | String | O | Defines the type of payment. Valid values include CREDIT_CARD or NON_CREDIT_CARD . |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |

**Total: 13 constraints**

---

## Taxagency

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| DisplayName | String | R | Name of the agency. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| TaxTrackedOnSales | Boolean | O | Denotes whether this tax agency is used to track tax on sales. |
| TaxTrackedOnPurchases | Boolean | O | Denotes whether this tax agency is used to track tax on purchases. |
| LastFileDate | Date | O | The last tax filing date for this tax agency. This field is automatically populated by QuickBooks business logic at tax filing time. |
| TaxRegistrationNumber | String | O | Registration number for the agency. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| TaxAgencyConfig | String | RO | Flag to identify whether the TaxAgency is system defined by Automated Sales Tax engine or user generated. Valid values include USER_DEFINED , SYSTEM_GENERATED SYSTEM_GENERATED. |
| DisplayName | String | R | Name of the agency. |

**Total: 10 constraints**

---

## Taxclassification

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ParentRef | ReferenceType | R | Reference Type for parent |
| ApplicableTo | ItemTypeEnum | O | List of item types the tax classification is applicable to. Includes Inventory, NonInventory, Bundle and Service. |
| Code | String | O | Code |
| Name | String | O | Name of the tax classification |
| Description | String | O | Description of the tax classification |
| Level | String | RO | Tax classification level (Numeric value 1, or 2. 1 specifies parent tax classification) |

**Total: 6 constraints**

---

## Taxcode

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the tax sales code. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PurchaseTaxRateList | TaxRateList | CR | List of references to tax rates that apply for purchase transactions when this tax code represents a group of tax rates. Required when TaxGroup is set to true |
| SalesTaxRateList | TaxRateList | CR | List of references to tax rates that apply for sales transactions when this tax code represents a group of tax rates. Required when TaxGroup is set to true |
| TaxGroup | Boolean | O | true —-this object represents a group of one or more tax rates. false —-this object represents pseudo-tax codes TAX and NON. |
| Taxable | Boolean | O | False or null means meaning non-taxable. True means taxable. Always true, except for the pseudo taxcode NON. |
| Active | Boolean | O | False if inactive. Inactive sales tax codes may be hidden from display and may not be used on financial transactions. |
| Description | String | O | User entered description for the sales tax code. |
| Hidden | Boolean | O | Read-only. Denotes whether active tax codes are displayed on transactions. true —-This tax code is hidden on transactions. false —-This tax code is displayed on transactions. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TaxCodeConfigType | String | RO | Flag to identify whether the TaxCode is system defined by Automated Sales Tax engine or user generated. Valid values include USER_DEFINED , SYSTEM_GENERATED SYSTEM_GENERATED. |

**Total: 12 constraints**

---

## Taxrate

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | O | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| RateValue | String | O | Value of the tax rate. |
| Name | String | O | User recognizable name for the tax rate. |
| AgencyRef | ReferenceType | O | Reference to the tax agency associated with this object. |
| SpecialTaxType | Sting | O | Special tax type to handle zero rate taxes. Used with VAT registered Businesses who receive goods/services (acquisitions) from other EU countries, will need to calculate the VAT due, but not paid, on these acquisitions. The rate of VAT payable is the same that would have been paid if the goods had been supplied by a UK supplier. |
| EffectiveTaxRate | EffectiveTaxRateData | O | List of EffectiveTaxRate. An EffectiveTaxRate is used to know which taxrate is applicable on any date. |
| DisplayType | Sting | O | TaxRate DisplayType enum which acts as display config. |
| TaxReturnLineRef | ReferenceType | O | Reference to the tax return line associated with this object. |
| Active | Boolean | O | If true, this object is currently enabled for use by QuickBooks. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| OriginalTaxRate | String | O | ID of the original tax rate from which the new tax rate is derived. Helps to understand the relationship between corresponding tax rate entities. |
| Description | String | O | User entered description for the tax rate. |

**Total: 13 constraints**

---

## Term

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Name | String | R | User recognizable name for the term. For example, Net 30 . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| DiscountPercent | Decimal | O | Discount percentage available against an amount if paid within the days specified by DiscountDays . |
| DiscountDays | Integer | O | Discount applies if paid within this number of days. Used only when DueDays is specified. |
| Active | Boolean | O | If true, this entity is currently enabled for use by QuickBooks. |
| Type | String | O | Type of the Sales Term. Valid values: STANDARD --Used if DueDays is not null. DATE_DRIVEN --Used if DueDays is null. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DayOfMonthDue | Integer | Payment must be received by this day of the month. Used only if DueDays is not specified. Required if DueDays not present |  |
| DiscountDayOfMonth | Positive Integer | Discount applies if paid before this day of month. Required if DueDays not present |  |
| DueNextMonthDays | Positive Integer | Payment due next month if issued that many days before the DayOfMonthDue . Required if DueDays not present. |  |
| DueDays | Integer | Number of days from delivery of goods or services until the payment is due. Required if DayOfMonthDue not present |  |
| Name | String | R | User recognizable name for the term. For example, Net 30 . |
| DayOfMonthDue | Integer | CR | Payment must be received by this day of the month. Required if DueDays not present |
| DueDays | Integer | CR | Number of days from delivery of goods or services until the payment is due. Required if DayOfMonthDue not present |
| Name | String | R | User recognizable name for the term. For example, Net 30 . |
| DayOfMonthDue | Integer | CR | Payment must be received by this day of the month. Required if DueDays not present |
| DueDays | Integer | CR | Number of days from delivery of goods or services until the payment is due. Required if DayOfMonthDue not present |

**Total: 18 constraints**

---

## Vendor

### Business Rules

1. The DisplayName, Title, GivenName, MiddleName, FamilyName, Suffix, and PrintOnCheckName attributes must not contain colon (:), tab (\\t), or newline (\\n) characters.
1. The DisplayName attribute must be unique across all other Customer, Employee, and Vendor objects.
1. The PrimaryEmailAddress attribute must contain an at sign (@) and dot (.).
1. The DisplayName attribute or at least one of Title, GivenName, MiddleName, FamilyName, or Suffix attributes is required during object create.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes are required during create. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| DisplayName | String | O | The name of the vendor as displayed. Must be unique across all Vendor, Customer, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating vendor name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| OtherContactInfo | ContactInfo | O | List of ContactInfo entities of any contact info type. |
| TermRef | ReferenceType | O | Reference to a default Term associated with this Vendor object. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for TermRef.value and TermRef.name , respectively. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| T4AEligible | Boolean | O | True if vendor is T4A eligible. Valid for CA locale |
| Fax | TelephoneNumber | O | Fax number. |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which all amounts associated with this vendor are expressed. Once set, it cannot be changed. If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this vendor is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency . Read-only after object is created. |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| Active | Boolean | O | If true, this object is currently enabled for use by QuickBooks. |
| AlternatePhone | TelephoneNumber | O | Alternate phone number. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Vendor1099 | Boolean | O | This vendor is an independent contractor; someone who is given a 1099-MISC form at the end of the year. A 1099 vendor is paid with regular checks, and taxes are not withheld on their behalf. |
| CostRate | BigDecimal | O | Pay rate of the vendor |
| BillRate | Decimal | O | BillRate can be set to specify this vendor's hourly billing rate. |
| WebAddr | WebSiteAddress | O | Website address. |
| T5018Eligible | Boolean | O | True if vendor is T5018 eligible. Valid for CA locale |
| CompanyName | String | O | The name of the company associated with the person or organization. |
| VendorPaymentBankDetail | VendorPaymentBankDetail | O | Vendor Payment Bank Detail. |
| TaxIdentifier | String | O | The tax ID of the Person or Organization. The value is masked in responses, exposing only last four characters. For example, the ID of 123-45-6789 is returned as XXXXXXX6789 . |
| AcctNum | String | O | Name or number of the account associated with this vendor. |
| HasTPAR | Boolean | O | Indicate if the vendor has TPAR enabled. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName . Cannot be removed with sparse update. |
| BillAddr | PhysicalAddress | O | Default billing address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| Balance | Decimal | RO | Specifies the open balance amount or the amount unpaid by the customer. For the create operation, this represents the opening balance for the customer. When returned in response to the query request it represents the current open balance (unpaid amount) for that customer. Write-on-create, read-only otherwise. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , Suffix , or FullyQualifiedName attributes are required during create. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| DisplayName | String | O | The name of the vendor as displayed. Must be unique across all Vendor, Customer, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating vendor name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Title | String | CR | Title of the person. This tag supports i18n, all locales. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes are required during create. |
| GivenName | String | CR | Given name or first name of a person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| MiddleName | String | CR | Middle name of the person. The person can have zero or more middle names. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| Suffix | String | CR | Suffix of the name. For example, Jr . The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| FamilyName | String | CR | Family name or the last name of the person. The DisplayName attribute or at least one of Title , GivenName , MiddleName , FamilyName , or Suffix attributes is required for object create. |
| PrimaryEmailAddr | EmailAddress | O | Primary email address. |
| DisplayName | String | O | The name of the vendor as displayed. Must be unique across all Vendor, Customer, and Employee objects. Cannot be removed with sparse update. If not supplied, the system generates DisplayName by concatenating vendor name components supplied in the request from the following list: Title , GivenName , MiddleName , FamilyName , and Suffix . |
| OtherContactInfo | ContactInfo | O | List of ContactInfo entities of any contact info type. |
| TermRef | ReferenceType | O | Reference to a default Term associated with this Vendor object. Query the Term name list resource to determine the appropriate Term object for this reference. Use Term.Id and Term.Name from that object for TermRef.value and TermRef.name , respectively. |
| Source | String | O | The Source type of the transactions created by QuickBooks Commerce. Valid values include: QBCommerce |
| T4AEligible | Boolean | O | True if vendor is T4A eligible. Valid for CA locale |
| Fax | TelephoneNumber | O | Fax number. |
| CurrencyRef | CurrencyRef | O | Reference to the currency in which all amounts associated with this vendor are expressed. Once set, it cannot be changed. If specified currency is not currently in the company's currency list, it is added. If not specified, currency for this vendor is the home currency of the company, as defined by Preferences.CurrencyPrefs.HomeCurrency . Read-only after object is created. |
| Mobile | TelephoneNumber | O | Mobile phone number. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| Active | Boolean | O | If true, this object is currently enabled for use by QuickBooks. |
| AlternatePhone | TelephoneNumber | O | Alternate phone number. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Vendor1099 | Boolean | O | This vendor is an independent contractor; someone who is given a 1099-MISC form at the end of the year. A 1099 vendor is paid with regular checks, and taxes are not withheld on their behalf. |
| CostRate | BigDecimal | O | Pay rate of the vendor |
| BillRate | Decimal | O | BillRate can be set to specify this vendor's hourly billing rate. |
| WebAddr | WebSiteAddress | O | Website address. |
| T5018Eligible | Boolean | O | True if vendor is T5018 eligible. Valid for CA locale |
| CompanyName | String | O | The name of the company associated with the person or organization. |
| VendorPaymentBankDetail | VendorPaymentBankDetail | O | Vendor Payment Bank Detail. |
| TaxIdentifier | String | O | The tax ID of the Person or Organization. The value is masked in responses, exposing only last four characters. For example, the ID of 123-45-6789 is returned as XXXXXXX6789 . |
| AcctNum | String | O | Name or number of the account associated with this vendor. |
| HasTPAR | Boolean | O | Indicate if the vendor has TPAR enabled. TPAR stands for Taxable Payments Annual Report. The TPAR is mandated by ATO to get the details payments that businesses make to contractors for providing services. Some government entities also need to report the grants they have paid in a TPAR. |
| PrintOnCheckName | String | O | Name of the person or organization as printed on a check. If not provided, this is populated from DisplayName . Cannot be removed with sparse update. |
| BillAddr | PhysicalAddress | O | Default billing address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| Balance | Decimal | RO | Specifies the open balance amount or the amount unpaid by the customer. For the create operation, this represents the opening balance for the customer. When returned in response to the query request it represents the current open balance (unpaid amount) for that customer. Write-on-create, read-only otherwise. |

**Total: 76 constraints**

---


# Report ENTITIES

## Accountlistdetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable, AccountsReceivable, Bank, CostOfGoodsSold, CreditCard, Equity, Expense, FixedAsset, Income, LongTermLiability, NonPosting, OtherAsset, OtherCurrentAsset, OtherCurrentLiability, OtherExpense, OtherIncome |
| end_date | String | O | The start date and end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. |
| start_moddate | String | O | If not specified value of moddate_macro is used. (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| moddate_macro | String | O | Predefined report account modification date range. Use if you want the report to cover a standard report date range when accounts were modified; otherwise, use the start_moddate and end_moddate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| end_moddate | String | O | If not specified value of moddate_macro is used. (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |
| account_status | String | O | The account status. Supported values include: Deleted , Not_Deleted |
| createdate_macro | String | O | Predefined report account create date range. Use if you want the report to cover a standard create report date range; otherwise, use start_createdate and end_createdate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| start_date | String | O | The start date and end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. |
| columns | String | O | Column types to be shown in the report. Supported Values: account_name* , account_type* , detail_acc_type , create_date , create_by , detail_acc_type* , last_ mod_date , last_ mod_by , account_desc* , account_bal* |

**Total: 14 constraints**

---

## Apagingdetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| shipvia | String | O | Filter by the shipping method as stored in Invoice.ShipMethodRef.Name . Supported Values: Any shipping method as sent in the Invoice.ShipMethodRef.Name attribute at Invoice create- or update-time. |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| num_periods | Integer | O | The number of periods to be shown in the report. Supported Values: A numeric value. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| past_due | Integer | O | Filters report contents based on minimum days past due. Supported Values: Integer number of days. no filtering |
| aging_period | Decimal | O | The number of days in the aging period. Supported Values: A numeric value. |
| columns | String | O | Column types to be shown in the report. Supported Values: create_by, create_date, doc_num*, due_date*, last_mod_by, last_mod_date, memo*, past_due*, term_name, tx_date*, txn_type*, vend_bill_addr, vend_comp_name, vend_name*, vend_pri_cont, vend_pri_email, vend_pri_tel Additional columns with location tracking enabled: dept_name* |

**Total: 14 constraints**

---

## Apagingsummary

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for Aged Receivables report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| aging_method | String | O | The date upon which aging is determined. Supported Values: Report_Date , Current |

**Total: 11 constraints**

---

## Aragingdetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| shipvia | String | O | Filter by the shipping method as stored in Invoice.ShipMethodRef.Name . Supported Values: Any shipping method as sent in the Invoice.ShipMethodRef.Name attribute at Invoice create- or update-time. |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| num_periods | Integer | O | The number of periods to be shown in the report. Supported Values: A numeric value. |
| aging_method | String | O | The date upon which aging is determined. Supported Values: Report_Date , Current |
| past_due | Integer | O | Filters report contents based on minimum days past due. Supported Values: Integer number of days. No filtering. |
| aging_period | Decimal | O | The number of days in the aging period. Supported Values: A numeric value. |
| columns | String | O | Column types to be shown in the report. Supported Values: bill_addr, create_by, create_date, cust_bill_email, cust_comp_name, cust_msg, cust_msg, cust_msg, cust_name, deliv_addr, doc_num*, due_date*, last_mod_by, last_mod_date, memo*, past_due, sale_sent_state, ship_addr, term_name, tx_date*, txn_type* Additional columns with custom fields enabled: sales_cust1, sales_cust2, sales_cust3 Additional columns with location tracking enabled: dept_name* |

**Total: 14 constraints**

---

## Aragingsummary

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for Aged Receivables report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| aging_method | String | O | The date upon which aging is determined. Supported Values: Report_Date , Current |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |

**Total: 10 constraints**

---

## Balancesheet

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for Profit and Loss report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| adjusted_gain_loss | String | O | Specifies whether unrealized gain and losses are included in the report. Supported Values: true , false |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 16 constraints**

---

## Cashflow

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for Aged Receivables report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 13 constraints**

---

## Customerbalance

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| arpaid | String | O | Supported Values: All , Paid , Unpaid |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |

**Total: 11 constraints**

---

## Customerbalancedetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| shipvia | String | O | Filter by the shipping method as stored in Invoice.ShipMethodRef.Name . Supported Values: Any shipping method as sent in the Invoice.ShipMethodRef.Name attribute at Invoice create- or update-time. |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| arpaid | String | O | Supported Values: All , Paid , Unpaid |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| aging_method | String | O | The date upon which aging is determined. Supported Values: Report_Date , Current |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| columns | String | O | Column types to be shown in the report. Supported Values: bill_addr, create_by, create_date, cust_bill_email, cust_comp_name, cust_msg, cust_phone_other, cust_tel, cust_name, deliv_addr, doc_num*, due_date*, last_mod_by, last_mod_date, memo*, sale_sent_state, ship_addr, ship_date, ship_via, term_name, tracking_num, tx_date*, txn_type* Additional columns with custom fields enabled: sales_cust1, sales_cust2, sales_cust3 Additional columns with location tracking enabled: dept_name* |

**Total: 15 constraints**

---

## Customerincome

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 14 constraints**

---

## Generalledger

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| account | String | O | Filters report contents to include information for specified accounts. Supported Values: One or more comma separated account IDs as returned in the attribute, Account.Id , of the Account object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| source_account | String | O | Filters report contents to include information for specified source accounts. Supported Values: One or more comma separated account IDs as returned in the attribute, Account.Id , of the Account object response code. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| account_type | String | O | (source_account_type) Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| columns | String | O | Column types to be shown in the report. Supported Values: account_name, chk_print_state, create_by, create_date, cust_name, doc_num*, emp_name, inv_date, is_adj*, is_ap_paid, is_ar_paid, is_cleared, item_name, last_mod_by, last_mod_date, memo*, name*, quantity, rate, split_acc*, tx_date*, txn_type*, vend_name. Additional columns when sales tax enabled: net_amount, tax_amount, tax_code. Additional columns when sales tax enabled: net_amount, tax_amount, tax_code Additional columns when account numbering enabled: account_num. Additional columns when class tracking enabled: klass_name*. Additional columns when location tracking enabled: dept_name*. Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . NonTracking status is enabled for the company if CompanyInfo.NameValue.Name.NonTracking is set to true . Currently enabled for Canadian company, other locales can be added in the future. |

**Total: 18 constraints**

---

## Inventoryvaluationdetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used. |
| end_svcdate | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used. |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| svcdate_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| start_svcdate | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used. |
| group_by | String | O | The field in the transaction by which to group results. Supported Values: Name, Account, Transaction Type, Customer, Vendor, Employee, Location, Payment Method, Day, Week, Month, Quarter, Year, None |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used. |
| columns | String | O | Column types to show in the report. Supported Values: tx_date, txn_id, txn_type, doc_num, name, quantity, rate, home_amount, qty_on_hand, asset_value, create_date, create_by, last_mod_date, last_mod_by, item_sku, memo, exch_rate, account_name, service_date, rate_inventory, qty_on_hand, asset_value_nt, tracking_num |

**Total: 11 constraints**

---

## Inventoryvaluationsummary

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |

**Total: 9 constraints**

---

## Journalreport

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| columns | String | O | Default columns included in the report are denoted with *. Column types to be shown in the report. Supported Values: acct_num_with_extn*, account_name*, credit_amt*, create_by, create_date, debt_amt*, doc_num*, due_date*, is_ar_paid*, is_ap_paid*, item_name, journal_code_name*, last_mod_by, last_mod_date, memo*, name, neg_open_bal, paid_date*, pmt_mthd*, quantity, rate, tx_date*, txn_num*, txn_type* To retrieve the account number (acct_num_with_extn) it's also needed to request the account name (account_name) in the same request. The account number will only be returned if the company has enabled the 'enable account numbers' option in its Chart of Accounts preferences. |

**Total: 9 constraints**

---

## Profitandloss

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for profit and loss report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| adjusted_gain_loss | String | O | Specifies whether unrealized gain and losses are included in the report. Supported Values: true , false |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 16 constraints**

---

## Profitandlossdetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| account | String | O | (source_account_type) Filters report contents to include information for specified accounts. Supported Values: One or more comma separated account IDs as returned in the attribute, Account.Id , of the Account object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| adjusted_gain_loss | String | O | Specifies whether unrealized gain and losses are included in the report. Supported Values: true , false |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| employee | String | O | Filters report contents to include information for specified employees. Supported Values: One or more comma separated account IDs as returned in the attribute, Employee.Id , of the Employee entity response code. |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| columns | String | O | Column types to be shown in the report. Supported Values: create_by, create_date, doc_num*, last_mod_by, last_mod_date, memo*, name*, pmt_mthd, split_acc*, tx_date*, txn_type* Additional columns with tax enabled: tax_code Additional columns with class tracking enabled: klass_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . NonTracking status is enabled for the company if CompanyInfo.NameValue.Name.NonTracking is set to true . Currently enabled for Canadian company, other locales can be added in the future. |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| account | String | O | (source_account_type) Filters report contents to include information for specified accounts. Supported Values: One or more comma separated account IDs as returned in the attribute, Account.Id , of the Account object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| adjusted_gain_loss | String | O | Specifies whether unrealized gain and losses are included in the report. Supported Values: true , false |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| employee | String | O | Filters report contents to include information for specified employees. Supported Values: One or more comma separated account IDs as returned in the attribute, Employee.Id , of the Employee entity response code. |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| columns | String | O | Column types to be shown in the report. Supported Values: create_by, create_date, doc_num*, last_mod_by, last_mod_date, memo*, name*, pmt_mthd, split_acc*, tx_date*, txn_type* Additional columns with tax enabled: tax_code Additional columns with class tracking enabled: klass_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . NonTracking status is enabled for the company if CompanyInfo.NameValue.Name.NonTracking is set to true . Currently enabled for Canadian company, other locales can be added in the future. |

**Total: 32 constraints**

---

## Salesbyclasssummary

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 12 constraints**

---

## Salesbycustomer

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 14 constraints**

---

## Salesbydepartment

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 13 constraints**

---

## Salesbyproduct

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | If not specified value of date_macro is used. The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| item | String | O | Filters report contents to include information for specified items. Supported Values: One or more comma separated item IDs as returned in the attribute, Item.Id ,of the Item entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_date | String | O | If not specified value of date_macro is used. The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. |

**Total: 15 constraints**

---

## Taxsummary

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| agency_id | String | R | The ID of the Tax Agency for which to generate the report. Read the TaxAgency object to get all valid values for this field. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 9 constraints**

---

## Transactionlist

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year, This Calendar Quarter, This Calendar Quarter-to-date, Last Calendar Quarter, Last Calendar Quarter-to-date, Next Calendar Quarter, This Calendar Year, This Calendar Year-to-date, Last Calendar Year, Last Calendar Year-to-date, Next Calendar Year |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa , Credit Card |
| duedate_macro | String | O | Predefined date range of due dates for balances to include in the report; otherwise, use the start_duedate and end_duedate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| arpaid | String | O | Supported Values: All , Paid , Unpaid |
| bothamount | String | O | Filters report contents to include information for specified transaction amount. For example, bothamount=1233.45 limits report contents to transactions of amount 1233.45. |
| transaction_type | String | O | Filters report contents based transaction type. Supported values include: CreditCardCharge, Check, Invoice, ReceivePayment, JournalEntry, Bill, CreditCardCredit, VendorCredit, Credit, BillPaymentCheck, BillPaymentCreditCard, Charge, Transfer, Deposit, Statement, BillableCharge, TimeActivity, CashPurchase, SalesReceipt, CreditMemo, CreditRefund, Estimate, InventoryQuantityAdjustment, PurchaseOrder, GlobalTaxPayment, GlobalTaxAdjustment, Service Tax Refund, Service Tax Gross Adjustment, Service Tax Reversal, Service Tax Defer, Service Tax Partial Utilisation |
| docnum | String | O | Filters report contents to include information for specified transaction number, as found in the docnum parameter of the transaction object. |
| start_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |
| source_account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| group_by | String | O | The field in the transaction by which to group results. Supported Values: Name, Account, Transaction Type, Customer, Vendor, Employee, Location, Payment Method, Day, Week, Month, Quarter, Year, Fiscal Year, Fiscal Quarter, None |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| columns | String | O | Column types to be shown in the report. Supported Values: account_name*, create_by, create_date, cust_msg, due_date, doc_num*, inv_date, is_ap_paid, is_cleared, is_no_post*, last_mod_by, memo*, name*, other_account*, pmt_mthd, printed, sales_cust1, sales_cust2, sales_cust3, term_name, tracking_num, tx_date*, txn_type*, term_name, is_adj, last_mod_date, ship_via, olb_status, extra_doc_num, is_ar_paid Additional columns when location tracking enabled: dept_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| memo | String | O | Filters report contents to include information for specified memo. Supported Values: One or more comma separated memo IDs. |
| appaid | String | O | Status of the balance. Supported Values: Paid , Unpaid , All |
| moddate_macro | String | O | Predefined report account modification date range. Use if you want the report to cover a standard report date range when accounts were modified; otherwise, use the start_moddate and end_moddate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| printed | String | O | Filters report contents based on whether checks are printed or not. Supported Values: Printed , To_be_printed |
| createdate_macro | String | O | Predefined report account create date range. Use if you want the report to cover a standard create report date range; otherwise, use start_createdate and end_createdate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| cleared | String | O | Filters report contents to include information for specified check status. Supported Values: Cleared : The transaction has been processed by a bank or credit card account and is reflected in the bank balance. Uncleared : A financial entry that has not been reconciled or matched with the corresponding bank statement records. Reconciled : The transaction has been compared to original records and verified as correct. Deposited : A deposit was made into a bank account, such as a checking account. |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| name | String | O | Filters report contents based on the specified comma separated list of ids for the name list customer, vendor, or employee objects. Query the Customer, Vendor, or Employee name list resource to determine the list of objects for this reference. Specify values found in Customer.Id , Vendor.Id , and Employee.Id . For example, name=1,4,7 includes data in the report for namelist ids 1, 4, and 7. vendor and employee objects |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| end_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |

**Total: 35 constraints**

---

## Transactionlistbycustomer

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year, This Calendar Quarter, This Calendar Quarter-to-date, Last Calendar Quarter, Last Calendar Quarter-to-date, Next Calendar Quarter, This Calendar Year, This Calendar Year-to-date, Last Calendar Year, Last Calendar Year-to-date, Next Calendar Year |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa , Credit Card |
| duedate_macro | String | O | Predefined date range of due dates for balances to include in the report; otherwise, use the start_duedate and end_duedate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| arpaid | String | O | Supported Values: All , Paid , Unpaid |
| bothamount | String | O | Filters report contents to include information for specified transaction amount. For example, bothamount=1233.45 limits report contents to transactions of amount 1233.45. |
| transaction_type | String | O | Filters report contents based transaction type. Supported values include: CreditCardCharge, Check, Invoice, ReceivePayment, JournalEntry, Bill, CreditCardCredit, VendorCredit, Credit, BillPaymentCheck, BillPaymentCreditCard, Charge, Transfer, Deposit, Statement, BillableCharge, TimeActivity, CashPurchase, SalesReceipt, CreditMemo, CreditRefund, Estimate, InventoryQuantityAdjustment, PurchaseOrder, GlobalTaxPayment, GlobalTaxAdjustment, Service Tax Refund, Service Tax Gross Adjustment, Service Tax Reversal, Service Tax Defer, Service Tax Partial Utilisation |
| docnum | String | O | Filters report contents to include information for specified transaction number, as found in the docnum parameter of the transaction object. |
| start_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |
| source_account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| group_by | String | O | The field in the transaction by which to group results. Supported Values: Name, Account, Transaction Type, Customer, Vendor, Employee, Location, Payment Method, Day, Week, Month, Quarter, Year, Fiscal Year, Fiscal Quarter, None |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| columns | String | O | Column types to be shown in the report. Supported Values: account_name*, create_by, create_date, cust_msg, due_date, doc_num*, inv_date, is_ap_paid, is_cleared, is_no_post*, last_mod_by, memo*, name*, other_account*, pmt_mthd, printed, sales_cust1, sales_cust2, sales_cust3, term_name, tracking_num, tx_date*, txn_type*, term_name, last_mod_date, ship_via, olb_status, is_ar_paid, extra_doc_num, cust_name Additional columns when location tracking enabled: dept_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| memo | String | O | Filters report contents to include information for specified memo. Supported Values: One or more comma separated memo IDs. |
| appaid | String | O | Status of the balance. Supported Values: Paid , Unpaid , All |
| moddate_macro | String | O | Predefined report account modification date range. Use if you want the report to cover a standard report date range when accounts were modified; otherwise, use the start_moddate and end_moddate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| printed | String | O | Filters report contents based on whether checks are printed or not. Supported Values: Printed , To_be_printed |
| createdate_macro | String | O | Predefined report account create date range. Use if you want the report to cover a standard create report date range; otherwise, use start_createdate and end_createdate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| cleared | String | O | Filters report contents to include information for specified check status. Supported Values: Cleared : The transaction has been processed by a bank or credit card account and is reflected in the bank balance. Uncleared : A financial entry that has not been reconciled or matched with the corresponding bank statement records. Reconciled : The transaction has been compared to original records and verified as correct. Deposited : A deposit was made into a bank account, such as a checking account. |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| name | String | O | Filters report contents based on the specified comma separated list of ids for the name list customer, vendor, or employee objects. Query the Customer, Vendor, or Employee name list resource to determine the list of objects for this reference. Specify values found in Customer.Id , Vendor.Id , and Employee.Id . For example, name=1,4,7 includes data in the report for namelist ids 1, 4, and 7. vendor and employee objects |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| end_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |

**Total: 34 constraints**

---

## Transactionlistbyvendor

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year, This Calendar Quarter, This Calendar Quarter-to-date, Last Calendar Quarter, Last Calendar Quarter-to-date, Next Calendar Quarter, This Calendar Year, This Calendar Year-to-date, Last Calendar Year, Last Calendar Year-to-date, Next Calendar Year |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa , Credit Card |
| duedate_macro | String | O | Predefined date range of due dates for balances to include in the report; otherwise, use the start_duedate and end_duedate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| arpaid | String | O | Supported Values: All , Paid , Unpaid |
| bothamount | String | O | Filters report contents to include information for specified transaction amount. For example, bothamount=1233.45 limits report contents to transactions of amount 1233.45. |
| transaction_type | String | O | Filters report contents based transaction type. Supported values include: CreditCardCharge, Check, Invoice, ReceivePayment, JournalEntry, Bill, CreditCardCredit, VendorCredit, Credit, BillPaymentCheck, BillPaymentCreditCard, Charge, Transfer, Deposit, Statement, BillableCharge, TimeActivity, CashPurchase, SalesReceipt, CreditMemo, CreditRefund, Estimate, InventoryQuantityAdjustment, PurchaseOrder, GlobalTaxPayment, GlobalTaxAdjustment, Service Tax Refund, Service Tax Gross Adjustment, Service Tax Reversal, Service Tax Defer, Service Tax Partial Utilisation |
| docnum | String | O | Filters report contents to include information for specified transaction number, as found in the docnum parameter of the transaction object. |
| start_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |
| source_account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| group_by | String | O | The field in the transaction by which to group results. Supported Values: Name, Account, Transaction Type, Customer, Vendor, Employee, Location, Payment Method, Day, Week, Month, Quarter, Year, Fiscal Year, Fiscal Quarter, None |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| columns | String | O | Column types to be shown in the report. Supported Values: account_name*, create_by, create_date, cust_msg, due_date, doc_num*, inv_date, is_ap_paid, is_cleared, is_no_post*, last_mod_by, memo*, name*, other_account*, pmt_mthd, printed, sales_cust1, sales_cust2, sales_cust3, term_name, tracking_num, tx_date*, txn_type*, term_name, last_mod_date, po_status, ship_via, olb_status, vendor_name Additional columns when location tracking enabled: dept_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| memo | String | O | Filters report contents to include information for specified memo. Supported Values: One or more comma separated memo IDs. |
| appaid | String | O | Status of the balance. Supported Values: Paid , Unpaid , All |
| moddate_macro | String | O | Predefined report account modification date range. Use if you want the report to cover a standard report date range when accounts were modified; otherwise, use the start_moddate and end_moddate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| printed | String | O | Filters report contents based on whether checks are printed or not. Supported Values: Printed , To_be_printed |
| createdate_macro | String | O | Predefined report account create date range. Use if you want the report to cover a standard create report date range; otherwise, use start_createdate and end_createdate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| cleared | String | O | Filters report contents to include information for specified check status. Supported Values: Cleared : The transaction has been processed by a bank or credit card account and is reflected in the bank balance. Uncleared : A financial entry that has not been reconciled or matched with the corresponding bank statement records. Reconciled : The transaction has been compared to original records and verified as correct. Deposited : A deposit was made into a bank account, such as a checking account. |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| name | String | O | Filters report contents based on the specified comma separated list of ids for the name list customer, vendor, or employee objects. Query the Customer, Vendor, or Employee name list resource to determine the list of objects for this reference. Specify values found in Customer.Id , Vendor.Id , and Employee.Id . For example, name=1,4,7 includes data in the report for namelist ids 1, 4, and 7. vendor and employee objects |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_createdate | String | O | Specify an explicit account create report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use createdate_macro to cover a standard report date range. (This field is not currently available.) |
| end_moddate | String | O | (Account List Detail) Specify an explicit account modification report date range, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use the moddate_macro to cover a standard report date range. |

**Total: 34 constraints**

---

## Transactionlistwithsplits

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| docnum | String | O | Filters report contents to include information for specified transaction number, as found in the docnum parameter of the transaction object. |
| name | String | O | Filters report contents based on the specified comma separated list of ids for the name list customer, vendor, or employee objects. Query the Customer, Vendor, or Employee name list resource to determine the list of objects for this reference. Specify values found in Customer.Id , Vendor.Id , and Employee.Id . For example, name=1,4,7 includes data in the report for namelist ids 1, 4, and 7. vendor and employee objects |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| payment_method | String | O | Filters report contents based on payment method. Supported Values: Cash , Check , Dinners Club , American Express , Discover , MasterCard , Visa |
| source_account_type | String | O | Account type from which transactions are included in the report. Supported Values: AccountsPayable , AccountsReceivable , Bank , CostOfGoodsSold , CreditCard , Equity , Expense , FixedAsset , Income , LongTermLiability , NonPosting , OtherAsset , OtherCurrentAsset , OtherCurrentLiability , OtherExpense , OtherIncome |
| transaction_type | String | O | Filters report contents based transaction type. Supported values include: CreditCardCharge, Check, Invoice, ReceivePayment, JournalEntry, Bill, CreditCardCredit, VendorCredit, Credit, BillPaymentCheck, BillPaymentCreditCard, Charge, Transfer, Deposit, Statement, BillableCharge, TimeActivity, CashPurchase, SalesReceipt, CreditMemo, CreditRefund, Estimate, InventoryQuantityAdjustment, PurchaseOrder, GlobalTaxPayment, GlobalTaxAdjustment, Service Tax Refund, Service Tax Gross Adjustment, Service Tax Reversal, Service Tax Defer, Service Tax Partial Utilisation |
| group_by | String | O | The field in the transaction by which to group results. Supported Values: Name, Account, Transaction Type |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. Supported Values: account_name, is_adj, create_by, create_date, tx_date, last_mod_date, last_mod_by, name, doc_num, pmt_mthd, is_no_post , txn_type |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| columns | String | O | Column types to be shown in the report. Supported Values: tx_date, txn_type, doc_num, is_no_post, account_name, memo, account_name, amount, is_adj, create_by, create_date, last_mod_date, last_mod_by, cust_name, vend_name, rate, quantity, item_name, emp_name, pmt_mthd, nat_open_bal, tax_type, is_billable, debt_amt, credit_amt, is_cleared, olb_status Additional columns when location tracking enabled: dept_name* Additional columns with location tracking enabled: dept_name* Multicurrency is enabled for the company if Preferences.MultiCurrencyEnabled is set to true . Read more about multicurrency support here . |

**Total: 15 constraints**

---

## Trialbalance

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for profit and loss report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 9 constraints**

---

## Vendorbalance

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| qzurl | String | O | Specifies whether Quick Zoom URL information should be generated for rows in the report. Quick Zoom URL is a hyperlink to another report containing further details about the particular column of data. Supported Values: true , false |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| appaid | String | O | Status of the balance. Supported Values: Paid , Unpaid , All |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |

**Total: 12 constraints**

---

## Vendorbalancedetail

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| term | String | O | Filters report contents based on term or terms supplied. Supported Values: One or more comma separated term IDs as returned in the attribute, Term.Id of the Term object response code. |
| end_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| start_duedate | String | O | The range of dates over which receivables are due, in the format YYYY-MM-DD . start_duedate must be less than end_duedate . If not specified, all data is returned. |
| duedate_macro | String | O | Predefined date range of due dates for balances to include in the report; otherwise, use the start_duedate and end_duedate to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| sort_by | String | O | The column type used in sorting report rows. Specify a column type as defined with the columns query parameter. |
| report_date | String | O | Start date to use for the report, in the format YYYY-MM-DD . |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| appaid | String | O | Status of the balance. Supported Values: Paid , Unpaid , All |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| columns | String | O | Column types to be shown in the report. Supported Values: create_by, create_date, doc_num*, due_date*, last_mod_by, last_mod_date, memo*, term_name, tx_date*, txn_type*, vend_bill_addr, vend_comp_name, vend_name*, vend_pri_cont, vend_pri_email, vend_pri_tel Additional columns with location tracking enabled: dept_name* |

**Total: 16 constraints**

---

## Vendorexpenses

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Header | object | The report header. |  |
| Rows | object | Top level container holding information for report rows. |  |
| Columns | object | Top level container holding information for report columns or subcolumns. |  |
| customer | String | O | Filters report contents to include information for specified customers. Supported Values: One or more comma separated customer IDs as returned in the attribute, Customer.Id , of the Customer object response code. |
| vendor | String | O | Filters report contents to include information for specified vendors. Supported Values: One or more comma separated vendor IDs as returned in the attribute, Vendor.Id , of the Vendor object response code. |
| end_date | String | O | The end date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |
| date_macro | String | O | Predefined date range. Use if you want the report to cover a standard report date range; otherwise, use the start_date and end_date to cover an explicit report date range. Supported Values: Today, Yesterday, This Week, Last Week, This Week-to-date, Last Week-to-date, Next Week, Next 4 Weeks, This Month, Last Month, This Month-to-date, Last Month-to-date, Next Month, This Fiscal Quarter, Last Fiscal Quarter, This Fiscal Quarter-to-date, Last Fiscal Quarter-to-date, Next Fiscal Quarter, This Fiscal Year, Last Fiscal Year, This Fiscal Year-to-date, Last Fiscal Year-to-date, Next Fiscal Year |
| class | String | O | Filters report contents to include information for specified classes if so configured in the company file. Supported Values: One or more comma separated class IDs as returned in the attribute, Class.Id , of the Class entity response code. |
| sort_order | String | O | The sort order. Supported Values: ascend , descend |
| summarize_column_by | String | O | The criteria by which to group the report results. Supported Values: Total, Month, Week, Days, Quarter, Year, Customers, Vendors, Classes, Departments, Employees, ProductsAndServices |
| department | String | O | Filters report contents to include information for specified departments if so configured in the company file. Supported Values: One or more comma separated department IDs as returned in the attribute, Department.Id of the Department object response code. |
| accounting_method | String | O | The accounting method used in the report. Supported Values: Cash , Accrual |
| start_date | String | O | The start date of the report, in the format YYYY-MM-DD . start_date must be less than end_date . Use if you want the report to cover an explicit date range; otherwise, use date_macro to cover a standard report date range. If not specified value of date_macro is used |

**Total: 13 constraints**

---


# Auxiliary ENTITIES

## Attachable

### Business Rules

1. An upload request may contain as many files as possible in a request, but the overall request size must not exceed 100 MB.-   An attachable record can either contain a note only, a file attachment only, or both.
1. When using file FileName and Note attributes together, it's up to the app to manage how the note relates to the file name.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | IdType | R/U | Unique Identifier for an Intuit entity (object). Required for the update operation. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| FileName | String | CR | FileName of the attachment. Required for file attachments. |
| Note | String | CR | This note is either related to the attachment specified by FileName or is a standalone note. Required for standalone notes. |
| Category | String | O | Category of the attachment. Valid values include (case sensitive): Contact Photo , Document , Image , Receipt , Signature , Sound , Other . |
| ContentType | String | O | ContentType of the attachment. Returned for file attachments. |
| PlaceName | String | O | PlaceName from where the attachment was requested. |
| AttachableRef | AttachableRef | O | Specifies the transaction object to which this attachable file is to be linked. |
| Long | String | O | Longitude from where the attachment was requested. |
| Tag | String | O | Tag name for the requested attachment. |
| Lat | String | O | Latitude from where the attachment was requested. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| FileAccessUri | String | RO | FullPath FileAccess URI of the attachment. Returned for file attachments. |
| Size | Decimal | RO | Size of the attachment. Returned for file attachments. |
| ThumbnailFileAccessUri | String | RO | FullPath FileAccess URI of the attachment thumbnail if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| TempDownloadUri | String | RO | TempDownload URI which can be directly downloaded by clients. Returned for file attachments. |
| ThumbnailTempDownloadUri | String | RO | Thumbnail TempDownload URI which can be directly downloaded by clients. This is only available if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| Note | String | CR | The note is either related to the attachment specified with the FileName attribute, or as a standalone note. Required for note attachments. |
| FileName | String | CR | FileName of the attachment. Required for file attachments. |
| AttachableRef | AttachableRef | O | Specifies the transaction object to which this attachable file is to be linked. |
| Id | IdType | R/U | Unique Identifier for an Intuit entity (object). Required for the update operation. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| FileName | String | CR | FileName of the attachment. Required for file attachments. |
| Note | String | CR | This note is either related to the attachment specified by FileName or is a standalone note. Required for standalone notes. |
| Category | String | O | Category of the attachment. Valid values include (case sensitive): Contact Photo , Document , Image , Receipt , Signature , Sound , Other . |
| ContentType | String | O | ContentType of the attachment. Returned for file attachments. |
| PlaceName | String | O | PlaceName from where the attachment was requested. |
| AttachableRef | AttachableRef | O | Specifies the transaction object to which this attachable file is to be linked. |
| Long | String | O | Longitude from where the attachment was requested. |
| Tag | String | O | Tag name for the requested attachment. |
| Lat | String | O | Latitude from where the attachment was requested. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| FileAccessUri | String | RO | FullPath FileAccess URI of the attachment. Returned for file attachments. |
| Size | Decimal | RO | Size of the attachment. Returned for file attachments. |
| ThumbnailFileAccessUri | String | RO | FullPath FileAccess URI of the attachment thumbnail if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| TempDownloadUri | String | RO | TempDownload URI which can be directly downloaded by clients. Returned for file attachments. |
| ThumbnailTempDownloadUri | String | RO | Thumbnail TempDownload URI which can be directly downloaded by clients. This is only available if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| Id | IdType | R/U | Unique Identifier for an Intuit entity (object). Required for the update operation. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| FileName | String | CR | FileName of the attachment. Required for file attachments. |
| Note | String | CR | This note is either related to the attachment specified by FileName or is a standalone note. Required for standalone notes. |
| Category | String | O | Category of the attachment. Valid values include (case sensitive): Contact Photo , Document , Image , Receipt , Signature , Sound , Other . |
| ContentType | String | O | ContentType of the attachment. Returned for file attachments. |
| PlaceName | String | O | PlaceName from where the attachment was requested. |
| AttachableRef | AttachableRef | O | Specifies the transaction object to which this attachable file is to be linked. |
| Long | String | O | Longitude from where the attachment was requested. |
| Tag | String | O | Tag name for the requested attachment. |
| Lat | String | O | Latitude from where the attachment was requested. |
| MetaData | ModificationMetaData | O | Descriptive information about the entity. The MetaData values are set by Data Services and are read only for all applications. |
| FileAccessUri | String | RO | FullPath FileAccess URI of the attachment. Returned for file attachments. |
| Size | Decimal | RO | Size of the attachment. Returned for file attachments. |
| ThumbnailFileAccessUri | String | RO | FullPath FileAccess URI of the attachment thumbnail if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| TempDownloadUri | String | RO | TempDownload URI which can be directly downloaded by clients. Returned for file attachments. |
| ThumbnailTempDownloadUri | String | RO | Thumbnail TempDownload URI which can be directly downloaded by clients. This is only available if the attachment file is of a content type with thumbnail support. Returned for file attachments. |
| Note | String | CR | The note is either related to the attachment specified with the FileName attribute, or as a standalone note. Required for note attachments. |
| FileName | String | CR | FileName of the attachment. Required for file attachments. |
| AttachableRef | AttachableRef | O | Specifies the transaction object to which this attachable file is to be linked. |

**Total: 59 constraints**

---

## Batch

### Business Rules

1. The maximum number of payloads in a single BatchItemRequest is 30.
1. The maximum number requests to the batch endpoint per minute per realmID is 40.
1. Execution order of BatchItemRequest objects should not be assumed.
1. BatchItemRequest objects are treated independently; a given object cannot depend on another one within the same batch operation. For example, a newly created customer is not available for a subsequent invoice create operation within the same batch operation. You would need to create the customer object first, either atomonously or via a batch request, and then create the invoice object in a subsequent batch request.
1. A batch request is authenticated once. This single authentication applies to all BatchItemRequest objects in the request.
1. The maximum number of objects that can be returned in a response is 1000.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| BatchItemRequest | batchitemrequest | R | A wrapper around all request objects for this batch operation. |
| BatchItemResponse | batchitemresponse | R | A wrapper around all response objects for this batch operation. |

**Total: 8 constraints**

---

## Budget

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| EndDate | DateTime | R | Budget end date. |
| StartDate | DateTime | R | Budget begin date. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| BudgetEntryType | BudgetEntryTypeEnum | O | Period that this budget detail covers.. Valid values include: Monthly , Quarterly , Annually . |
| Name | String | O | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| BudgetDetail [0..n] | BudgetDetail | O | Container for the budget items. |
| BudgetType | BudgetTypeEnum | O | Budget types. The only value currently supported is ProfitAndLoss . |
| Active | Boolean | O | Whether or not active inactive accounts may be hidden from most display purposes and may not be posted to. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| EndDate | DateTime | R | Budget end date. |
| StartDate | DateTime | R | Budget begin date. |
| BudgetDetail [0..n] | BudgetDetail | O | Container for the budget items. |
| BudgetEntryType | BudgetEntryTypeEnum | O | Period that this budget detail covers.. Valid values include: Monthly , Quarterly , Annually . |
| Name | String | O | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| BudgetType | BudgetTypeEnum | O | Budget types. The only value currently supported is ProfitAndLoss . |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| EndDate | DateTime | R | Budget end date. |
| StartDate | DateTime | R | Budget begin date. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| BudgetEntryType | BudgetEntryTypeEnum | O | Period that this budget detail covers.. Valid values include: Monthly , Quarterly , Annually . |
| Name | String | O | User recognizable name for the Account. Account.Name attribute must not contain double quotes (") or colon (:). |
| BudgetDetail [0..n] | BudgetDetail | O | Container for the budget items. |
| BudgetType | BudgetTypeEnum | O | Budget types. The only value currently supported is ProfitAndLoss . |
| Active | Boolean | O | Whether or not active inactive accounts may be hidden from most display purposes and may not be posted to. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |

**Total: 28 constraints**

---

## Changedatacapture

### Business Rules

1. This operation is supported for all objects except JournalCode, TimeActivity, TaxAgency, TaxCode, and TaxRate.
1. Objects are grouped by type and then in order of last updated time within the group. Objects deleted within the look-back period are returned after active objects.
1. A given CDC request returns a maximum of 1000 objects. It is suggested to query with a look-back time shorter than 30 days that can ensure full data is returned.
1. The full payload for each object is returned.

**Total: 4 constraints**

---

## Companycurrency

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Code | String | R | A three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. Click here for a list of supported currency codes. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Name | String | O | The full name of the currency. |
| Active | Boolean | O | Indicates whether this currency is active in the company or not. true --This currency is active and enabled for use by QuickBooks. false --This currency is inactive, is hidden from most display purposes, and is not availble for use with financial transactions. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Code | String | R | A three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| Code | String | R | A three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. Click here for a list of supported currency codes. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| Name | String | O | The full name of the currency. |
| Active | Boolean | O | Indicates whether this currency is active in the company or not. true --This currency is active and enabled for use by QuickBooks. false --This currency is inactive, is hidden from most display purposes, and is not availble for use with financial transactions. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |

**Total: 13 constraints**

---

## Companyinfo

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | RO | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CompanyName | String | R/U | The name of the company. |
| CompanyAddr | PhysicalAddress | R/U | Company Address as described in preference. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| LegalAddr | PhysicalAddress | O | Legal Address given to the government for any government communication. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| SupportedLanguages | String | O | Comma separated list of languages. |
| Country | String | O | Country name to which the company belongs for financial calculations. |
| Email | EmailAddress | O | Default email address. |
| WebAddr | WebSiteAddress | O | Website address. |
| NameValue [0..n] | NameValue pairs | O | Any other preference not covered with the standard set of attributes. See Data Services Extensions, below, for special reserved name/value pairs. NameValue.Name--Name of the element. NameValue.Value--Value of the element. |
| FiscalYearStartMonth | MonthEnum | O | The start month of fiscal year. |
| CustomerCommunicationAddr | PhysicalAddress | O | Address of the company as given to their customer, sometimes the address given to the customer mail address is different from Company address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| LegalName | String | O | The legal name of the company. |
| EmployerId | String | O | If your QuickBooks company has defined an EIN in company settings, this value is returned. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CompanyStartDate | DateTime | RO | DateTime when company file was created. This field and Metadata.CreateTime contain the same value. |
| Id | String | RO | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CompanyName | String | R/U | The name of the company. |
| CompanyAddr | PhysicalAddress | R/U | Company Address as described in preference. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| LegalAddr | PhysicalAddress | O | Legal Address given to the government for any government communication. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| SupportedLanguages | String | O | Comma separated list of languages. |
| Country | String | O | Country name to which the company belongs for financial calculations. |
| Email | EmailAddress | O | Default email address. |
| WebAddr | WebSiteAddress | O | Website address. |
| NameValue [0..n] | NameValue pairs | O | Any other preference not covered with the standard set of attributes. See Data Services Extensions, below, for special reserved name/value pairs. NameValue.Name--Name of the element. NameValue.Value--Value of the element. |
| FiscalYearStartMonth | MonthEnum | O | The start month of fiscal year. |
| CustomerCommunicationAddr | PhysicalAddress | O | Address of the company as given to their customer, sometimes the address given to the customer mail address is different from Company address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| LegalName | String | O | The legal name of the company. |
| EmployerId | String | O | If your QuickBooks company has defined an EIN in company settings, this value is returned. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CompanyStartDate | DateTime | RO | DateTime when company file was created. This field and Metadata.CreateTime contain the same value. |
| Id | String | RO | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| CompanyName | String | R/U | The name of the company. |
| CompanyAddr | PhysicalAddress | R/U | Company Address as described in preference. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| LegalAddr | PhysicalAddress | O | Legal Address given to the government for any government communication. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| SupportedLanguages | String | O | Comma separated list of languages. |
| Country | String | O | Country name to which the company belongs for financial calculations. |
| Email | EmailAddress | O | Default email address. |
| WebAddr | WebSiteAddress | O | Website address. |
| NameValue [0..n] | NameValue pairs | O | Any other preference not covered with the standard set of attributes. See Data Services Extensions, below, for special reserved name/value pairs. NameValue.Name--Name of the element. NameValue.Value--Value of the element. |
| FiscalYearStartMonth | MonthEnum | O | The start month of fiscal year. |
| CustomerCommunicationAddr | PhysicalAddress | O | Address of the company as given to their customer, sometimes the address given to the customer mail address is different from Company address. If a physical address is updated from within the transaction object, the QuickBooks Online API flows individual address components differently into the Line elements of the transaction response then when the transaction was first created: Line1 and Line2 elements are populated with the customer name and company name. Original Line1 through Line 5 contents, City , SubDivisionCode , and PostalCode flow into Line3 through Line5 as a free format strings. |
| PrimaryPhone | TelephoneNumber | O | Primary phone number. |
| LegalName | String | O | The legal name of the company. |
| EmployerId | String | O | If your QuickBooks company has defined an EIN in company settings, this value is returned. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CompanyStartDate | DateTime | RO | DateTime when company file was created. This field and Metadata.CreateTime contain the same value. |

**Total: 51 constraints**

---

## Creditcardpayment

### Business Rules

1. This transaction does not support multi-currency. Only payments made from home currency Bank accounts to home currency Credit Card accounts will be accepted.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CreditCardAccountRef | ReferenceType | R | Identifies the credit card account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| BankAccountRef | ReferenceType | R | Identifies the bank account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| VendorRef | ReferenceType | O | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| Memo | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| PrintStatus | String | O | Printing status of the credit-card-payment. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckNum | String | O | User entered, Check number. This field maps to the Check no. field on the Pay down credit card form. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| CreditCardAccountRef | ReferenceType | R | Identifies the credit card account to which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| Amount | Decimal | R | Indicates the total amount of the transaction. |
| BankAccountRef | ReferenceType | R | Identifies the bank account from which funds are transfered. Query the Account name list resource to determine the appropriate Account object for this reference. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| VendorRef | ReferenceType | O | Reference to the vendor for this transaction. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| TxnDate | Date | O | The date entered by the user when this transaction occurred. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| Memo | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| PrintStatus | String | O | Printing status of the credit-card-payment. Valid values: NotSet , NeedToPrint , PrintComplete . |
| CheckNum | String | O | User entered, Check number. This field maps to the Check no. field on the Pay down credit card form. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |
| TxnDate | Date | R | Date of transaction. |
| Amount | Decimal | R | Total amount of the payment. Denominated in the currency of the credit card account. |
| BankAccountRef | ReferenceType | R | Bank account used to pay the Credit Card balance. Must be a Bank account. |
| CreditCardAccountRef | ReferenceType | R | Credit Card account for which a payment is being entered. Must be a Credit Card account. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This field maps to the Memo field on the Pay down credit card form. |

**Total: 40 constraints**

---

## Entitlements

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PlanName | String | Billing plan associated with this company. |  |
| SupportedLanguages | String | Comma separated list of languages. |  |
| Entitlement | TelephoneNumber | Primary phone number. |  |
| CompanyStartDate | DateTime | DateTime when company file was created. This field and Metadata.CreateTime contain the same value. |  |
| EmployerId | String | Employer identifier (EIN). |  |
| QboCompany | Boolean | Check if the company is a QuickBooks Online company. false is returned if not a QuickBooks Online company, the company exists in the Intuit ecosystem, but is not a QuickBooks Online company, or the company is a QuickBooks Online company, but the current user does not belong to the company. |  |
| Email | EmailAddress | Default email address. |  |
| WebAddr | WebSiteAddress | Website address. |  |
| FiscalYearStartMonth | MonthEnum | The start month of fiscal year. |  |
| Thresholds [0..n] | Threshold | The threshold for this company. |  |
| DaysRemainingTrial | Integer | Remaining trial period days. |  |
| MaxUsers | Integer | Maximum billable users allowed in the company. |  |
| CurrentUsers | Integer | Billable users currently in the company. |  |

**Total: 13 constraints**

---

## Exchangerate

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| AsOfDate | Boolean | R/U | Date on which this exchange rate was set. |
| SourceCurrencyCode | String | R/U | The source currency from which the exchange rate is specified, and usually. Specify as a three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. For example, in the equation 65 INR = 1 USD , INR is the source currency. |
| Rate | Decimal | R/U | The exchange rate between SourceCurrencyCode and TargetCurrencyCode on the AsOfDate date. |
| TargetCurrencyCode | String | O | The target currency against which the exchange rate is specified. Specify as a three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. For example, in the equation 65 INR = 1 USD , USA is the target currency. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| AsOfDate | Boolean | R/U | Date on which this exchange rate was set. |
| SourceCurrencyCode | String | R/U | The source currency from which the exchange rate is specified, and usually. Specify as a three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. For example, in the equation 65 INR = 1 USD , INR is the source currency. |
| Rate | Decimal | R/U | The exchange rate between SourceCurrencyCode and TargetCurrencyCode on the AsOfDate date. |
| TargetCurrencyCode | String | O | The target currency against which the exchange rate is specified. Specify as a three letter string representing the ISO 4217 code for the currency. For example, USD , AUD , EUR , and so on. For example, in the equation 65 INR = 1 USD , USA is the target currency. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |

**Total: 12 constraints**

---

## Inventoryadjustment

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| TxnDate | DateTime | R | The date entered by the user when this transaction occurred. yyyy/MM/dd is the valid date format. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| Line [0..n] | Line | R | Individual line items of an inventory adjustment. |
| AdjustAccountRef | ReferenceType | R | Specifies which account is debited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AdjustAccountRef.value and AdjustAccountRef.name , respectively. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R/U | Unique identifier for this object. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Statement Memo field on the Invoice form in the QuickBooks Online UI. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| DocNumber | String | Required for create | Reference number for the transaction. |
| DocNumber | String | R | Reference number for the transaction. |
| AdjustAccountRef | ReferenceType | R | Specifies which account is debited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AdjustAccountRef.value and AdjustAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of an inventory adjustment. |
| TxnDate | DateTime | R | The date entered by the user when this transaction occurred. yyyy/MM/dd is the valid date format. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Statement Memo field on the Invoice form in the QuickBooks Online UI. |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| AdjustAccountRef | ReferenceType | R | Specifies which account is debited. Query the Account name list resource to determine the appropriate Account object for this reference. Use Account.Id and Account.Name from that object for AdjustAccountRef.value and AdjustAccountRef.name , respectively. |
| Line [0..n] | Line | R | Individual line items of an inventory adjustment. |
| TxnDate | DateTime | R | The date entered by the user when this transaction occurred. yyyy/MM/dd is the valid date format. For posting transactions, this is the posting date that affects the financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. |
| DocNumber | String | O | Reference number for the transaction. |
| PrivateNote | String | O | User entered, organization-private note about the transaction. This note does not appear on the invoice to the customer. This field maps to the Statement Memo field on the Invoice form in the QuickBooks Online UI. |

**Total: 20 constraints**

---

## Preferences

### Business Rules

1. The create operation is not supported.
1. The read request retrieves all preferences. There is no notion of preference objects or object IDs.
1. Update operations are supported for a limited subset of preferences, which are not marked as readonly.
1. The Delete operation is not supported.
1. Query is supported with sorting and filtering enabled for Metadata timestamp attributes. Pagination is not supported.
1. OtherPrefs type is used as an extension mechanism to contain additional attributes as Name/Value pairs.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| AccountingInfoPrefs | object | The following settings are available for QuickBooks Online Plus editions, only. To determine this edition type, query the value of the OfferingSku CustomerInfo.Name name/value pair for QuickBooks Online Plus . |  |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| AccountingInfoPrefs | object | The following settings are available for QuickBooks Online Plus editions, only. To determine this edition type, query the value of the OfferingSku CustomerInfo.Name name/value pair for QuickBooks Online Plus . |  |

**Total: 14 constraints**

---

## Taxclassification

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ParentRef | ReferenceType | R | Reference Type for parent |
| ApplicableTo | ItemTypeEnum | O | List of item types the tax classification is applicable to. Includes Inventory, NonInventory, Bundle and Service. |
| Code | String | O | Code |
| Name | String | O | Name of the tax classification |
| Description | String | O | Description of the tax classification |
| Level | String | RO | Tax classification level (Numeric value 1, or 2. 1 specifies parent tax classification) |

**Total: 6 constraints**

---

## Taxpayment

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| Refund | Boolean | Indicate if this transaction is a refund. Returns false for the payment. |  |
| TxnDate | Date | RO | Indicates the tax payment date |
| PaymentAccountRef | ReferenceType | RO | Indicates the Account ID from which the payment was made (or refund was moved to). |
| Description | String | RO | Specifies the Memo/Description added for this payment. |
| PaymentAmount | Decimal | RO | Specifies the tax payment amount paid towards a filed tax return. |

**Total: 8 constraints**

---

## Taxservice

### Business Rules

1. TaxService.RateValue must be between 0 and 100 (%).
1. QuickBooks companies based in the US will only display system-created tax agencies. They also only display the associated tax rates available and visible via the QuickBooks UI.
1. A single tax rate may not be listed twice in the list of tax rates associated with a new tax code.
1. To specify an existing tax rate, query the TaxRate endpoint to determine the Id used for TaxService.TaxRateId.
1. To query list of currently defined tax codes, use the TaxCode resource.
1. To dynamically create a new tax rate do not specify TaxService.TaxRateId in the create request. But rather, specify TaxService.​TaxRateName, TaxService.​RateValue and TaxService.​TaxAgencyId.
1. TaxAgency objects referenced by TaxRate objects created with the TaxService resource must already exist.

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| TaxCode | String | R | Name of new tax code. For current TaxCodes, query the TaxCode resource. |
| TaxRateDetails [0..n] | TaxRateDetails | R | Container to hold one or more tax rate specifications. |
| TaxCodeId | String | O | The id of the newly created tax code. This is generated by Data Services and returned in the response code. |
| TaxCode | String | R | Name of new tax code. To query list of currently defined tax codes, use the TaxCode endpoint. |
| TaxRateDetails [0..n] | TaxRateDetails | R | Container to hold one or more tax rate specifications. |

**Total: 12 constraints**

---

## Timeactivity

### Fields & Constraints

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| NameOf | String | R | Enumeration of time activity types. Required in conjunction with either EmployeeRef or VendorRef attributes for create operations. Valid values: Vendor or Employee . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| TxnDate | Date | CR | The date for the time activity. This is the posting date that affects financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. If you provide the StartTime and EndTime without including the timeZone offset, then you would need to pass the TxnDate for any historical or future dates. Lets say if you want to create a historical time activity then pass the TxnDate as the date and pass StartTime and EndTime as Hours without including the timeZone offset. |
| BreakHours BreakMinutes | Integer | CR | Hours and minutes of break taken between StartTime and EndTime . use when StartTime and EndTime are specified |
| EndTime | DateTime | CR | Time that work starts and ends, respectively. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. |
| Hours | Integer | CR | Hours and minutes worked. Required if StartTime and EndTime not specified |
| VendorRef | ReferenceType | CR | Specifies the vendor whose time is being recorded. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. Required if NameOf is set to Vendor |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| HourlyRate | Decimal | CR | Hourly bill rate of the employee or vendor for this time activity. Required if BillableStatus is set to Billable |
| CustomerRef | ReferenceType | CR | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. Required if BillableStatus is set to Billable |
| EmployeeRef | ReferenceType | CR | Specifies the employee whose time is being recorded. Query the Employee name list resource to determine the appropriate Employee object for this reference. Use Employee.Id and Employee.DisplayName from that object for EmployeerRef.value and EmployeeRef.Name , respectively. Required if NameOf is set to Employee |
| StartTime | DateTime | CR | Time that work starts and ends, respectively. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. |
| ClassRef | ReferenceType | O | Reference to the Class associated with this object. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| Description | String | O | Description of work completed during time activity. |
| Taxable | Boolean | O | True if the time recorded is both billable and taxable. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CostRate | BigDecimal | O | Pay rate of the employee or vendor for this time activity. |
| ItemRef | ReferenceType | O | Reference to the service item associated with this object. Query the Item name list resource, where Item.Type is set to Service , to determine the appropriate Item object for this reference. Use Item.Id and Item.Name from that object for ItemRef.value and ItemRef.name , respectively. For France locales: The account associated with the referenced Item object is looked up in the account category list. If this account has same location as specified in the transaction by the TransactionLocationType attribute and the same VAT as in the line item TaxCodeRef attribute, then the item account is used. If there is a mismatch, then the account from the account category list that matches the transaction location and VAT is used. If this account is not present in the account category list, then a new account is created with the new location, new VAT code, and all other attributes as in the default account. |
| PayrollItemRef | ReferenceType | O | Specifies how much the employee should be paid for doing the work specified by the Compensation Id. Query the EmployeeCompensation resource to determine the appropriate PayrollCompensation object for an employee. Use EmployeeCompensation.Id and EmployerCompensation.Name from that object for PayrollItemRef.value and PayrollItemRef.name , respectively. This field is available only for a closed group of developers. |
| BillableStatus | BillableStatusEnum | O | Billable status of the time recorded. This field is not updatable through an API request. The value automatically changes when an invoice is created. Valid values: Billable , NotBillable , HasBeenBilled . You cannot directly update the status to HasBeenBilled . To set the status to HasBeenBilled , create an Invoice object and attach this TimeActivity object as a linked transaction to that Invoice. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of this object. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |
| NameOf | String | R | Enumeration of time activity types. Required in conjunction with either EmployeeRef or VendorRef attributes for create operations. Valid values: Vendor or Employee . |
| TxnDate | Date | CR | The date for the time activity. This is the posting date that affects financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. If you provide the StartTime and EndTime without including the timeZone offset, then you would need to pass the TxnDate for any historical or future dates. Lets say if you want to create a historical time activity then pass the TxnDate as the date and pass StartTime and EndTime as Hours without including the timeZone offset. |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| Hours | Integer | CR | Hours and minutes worked. Required if StartTime and EndTime not specified |
| StartTime | DateTime | CR | Time that work starts. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. If TnxDate is provided then consider passing the StartTime and EndTime wihtout including the timeZone offset, then the the date passed on the TxnDate is used. If TnxDate is NOT provided, passing the StartTime and EndTime with/wihtout including the timeZone offset, then the the current date on the server is used. For any transactions with historical/future dates kindly include TxnDate in YYYY-MM-DD format and StartTime and EndTime in Hours and Minutes |
| HourlyRate | Decimal | CR | Hourly bill rate of the employee or vendor for this time activity. Required if BillableStatus is set to Billable |
| VendorRef | ReferenceType | CR | Specifies the vendor whose time is being recorded. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. |
| EndTime | DateTime | CR | Time that work ends. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. If TnxDate is provided then consider passing the StartTime and EndTime wihtout including the timeZone offset, then the the date passed on the TxnDate is used. If TnxDate is NOT provided, passing the StartTime and EndTime with/wihtout including the timeZone offset, then the the current date on the server is used. For any transactions with historical/future dates kindly include TxnDate in YYYY-MM-DD format and StartTime and EndTime in Hours and Minutes |
| EmployeeRef | ReferenceType | Condtionally required | Specifies the employee whose time is being recorded. Query the Employee name list resource to determine the appropriate Employee object for this reference. Use Employee.Id and Employee.DisplayName from that object for EmployeerRef.value and EmployeeRef.Name , respectively. |
| CustomerRef | ReferenceType | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. |  |
| SyncToken | String | R | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| id | String | R | Unique identifier for this object. |
| Id | String | R/U | Unique identifier for this object. Sort order is ASC by default. |
| NameOf | String | R | Enumeration of time activity types. Required in conjunction with either EmployeeRef or VendorRef attributes for create operations. Valid values: Vendor or Employee . |
| SyncToken | String | R/U | Version number of the object. It is used to lock an object for use by one app at a time. As soon as an application modifies an object, its SyncToken is incremented. Attempts to modify an object specifying an older SyncToken fails. Only the latest version of the object is maintained by QuickBooks Online. |
| TxnDate | Date | CR | The date for the time activity. This is the posting date that affects financial statements. If the date is not supplied, the current date on the server is used. Sort order is ASC by default. If you provide the StartTime and EndTime without including the timeZone offset, then you would need to pass the TxnDate for any historical or future dates. Lets say if you want to create a historical time activity then pass the TxnDate as the date and pass StartTime and EndTime as Hours without including the timeZone offset. |
| BreakHours BreakMinutes | Integer | CR | Hours and minutes of break taken between StartTime and EndTime . use when StartTime and EndTime are specified |
| EndTime | DateTime | CR | Time that work starts and ends, respectively. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. |
| Hours | Integer | CR | Hours and minutes worked. Required if StartTime and EndTime not specified |
| VendorRef | ReferenceType | CR | Specifies the vendor whose time is being recorded. Query the Vendor name list resource to determine the appropriate Vendor object for this reference. Use Vendor.Id and Vendor.Name from that object for VendorRef.value and VendorRef.name , respectively. Required if NameOf is set to Vendor |
| ProjectRef | ReferenceType | CR | Reference to the Project ID associated with this transaction. |
| HourlyRate | Decimal | CR | Hourly bill rate of the employee or vendor for this time activity. Required if BillableStatus is set to Billable |
| CustomerRef | ReferenceType | CR | Reference to a customer or job. Query the Customer name list resource to determine the appropriate Customer object for this reference. Use Customer.Id and Customer.DisplayName from that object for CustomerRef.value and CustomerRef.name , respectively. Required if BillableStatus is set to Billable |
| EmployeeRef | ReferenceType | CR | Specifies the employee whose time is being recorded. Query the Employee name list resource to determine the appropriate Employee object for this reference. Use Employee.Id and Employee.DisplayName from that object for EmployeerRef.value and EmployeeRef.Name , respectively. Required if NameOf is set to Employee |
| StartTime | DateTime | CR | Time that work starts and ends, respectively. Required if Hours and Minutes not specified. Note: Kindly consider only the Hours without including the timeZone offset as it does not impact time activity hours calculation. |
| ClassRef | ReferenceType | O | Reference to the Class associated with this object. Available if Preferences.AccountingInfoPrefs.ClassTrackingPerTxn is set to true . Query the Class name list resource to determine the appropriate Class object for this reference. Use Class.Id and Class.Name from that object for ClassRef.value and ClassRef.name , respectively. |
| Description | String | O | Description of work completed during time activity. |
| Taxable | Boolean | O | True if the time recorded is both billable and taxable. |
| MetaData | ModificationMetaData | O | Descriptive information about the object. The MetaData values are set by Data Services and are read only for all applications. |
| CostRate | BigDecimal | O | Pay rate of the employee or vendor for this time activity. |
| ItemRef | ReferenceType | O | Reference to the service item associated with this object. Query the Item name list resource, where Item.Type is set to Service , to determine the appropriate Item object for this reference. Use Item.Id and Item.Name from that object for ItemRef.value and ItemRef.name , respectively. For France locales: The account associated with the referenced Item object is looked up in the account category list. If this account has same location as specified in the transaction by the TransactionLocationType attribute and the same VAT as in the line item TaxCodeRef attribute, then the item account is used. If there is a mismatch, then the account from the account category list that matches the transaction location and VAT is used. If this account is not present in the account category list, then a new account is created with the new location, new VAT code, and all other attributes as in the default account. |
| PayrollItemRef | ReferenceType | O | Specifies how much the employee should be paid for doing the work specified by the Compensation Id. Query the EmployeeCompensation resource to determine the appropriate PayrollCompensation object for an employee. Use EmployeeCompensation.Id and EmployerCompensation.Name from that object for PayrollItemRef.value and PayrollItemRef.name , respectively. This field is available only for a closed group of developers. |
| BillableStatus | BillableStatusEnum | O | Billable status of the time recorded. This field is not updatable through an API request. The value automatically changes when an invoice is created. Valid values: Billable , NotBillable , HasBeenBilled . You cannot directly update the status to HasBeenBilled . To set the status to HasBeenBilled , create an Invoice object and attach this TimeActivity object as a linked transaction to that Invoice. |
| DepartmentRef | ReferenceType | O | A reference to a Department object specifying the location of this object. Available if Preferences.AccountingInfoPrefs.TrackDepartments is set to true . Query the Department name list resource to determine the appropriate department object for this reference. Use Department.Id and Department.Name from that object for DepartmentRef.value and DepartmentRef.name , respectively. |

**Total: 56 constraints**

---


# Summary

- **Documents analyzed:** 73 of 73
- **Total constraints documented:** 2334
- **Groups:** Transaction (17), Name List (14), Report (29), Auxiliary (15)
- **Last updated:** July 2026
