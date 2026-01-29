/**
 * MyFatoorah Payment Integration
 * بوابة ماي فاتورة للدفع الإلكتروني
 *
 * Documentation: https://myfatoorah.readme.io/
 */

export interface MyFatoorahConfig {
  apiKey: string;
  baseUrl: string; // 'https://api.myfatoorah.com' for production, 'https://apitest.myfatoorah.com' for sandbox
  countryCode: 'KWT' | 'SAU' | 'BHR' | 'ARE' | 'QAT' | 'OMN' | 'JOD' | 'EGY';
}

export interface CustomerInfo {
  name: string;
  email: string;
  mobile?: string;
  block?: string;
  street?: string;
  area?: string;
  city?: string;
  countryCode?: string;
}

export interface InvoiceItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentRequest {
  invoiceValue: number;
  currency: 'SAR' | 'KWD' | 'BHD' | 'AED' | 'QAR' | 'OMR' | 'JOD' | 'EGP' | 'USD';
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  callbackUrl: string;
  errorUrl: string;
  language: 'ar' | 'en';
  displayCurrencyIso?: string;
  invoiceItems?: InvoiceItem[];
  customerReference?: string;
  userDefinedField?: string;
}

export interface PaymentMethod {
  PaymentMethodId: number;
  PaymentMethodAr: string;
  PaymentMethodEn: string;
  PaymentMethodCode: string;
  IsDirectPayment: boolean;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  ImageUrl: string;
  IsEmbeddedSupported: boolean;
  PaymentCurrencyIso: string;
}

export interface InitiatePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: string | null;
  Data: {
    PaymentMethods: PaymentMethod[];
  };
}

export interface ExecutePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: string | null;
  Data: {
    InvoiceId: number;
    IsDirectPayment: boolean;
    PaymentURL: string;
    CustomerReference: string;
    UserDefinedField: string;
  };
}

export interface PaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: string | null;
  Data: {
    InvoiceId: number;
    InvoiceStatus: 'Pending' | 'Paid' | 'Failed' | 'Expired';
    InvoiceReference: string;
    CustomerReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    Comments: string;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    TransactionDate: string;
    PaymentGateway: string;
    ReferenceId: string;
    TrackId: string;
    TransactionId: string;
    PaymentId: string;
    AuthorizationId: string;
    TransactionStatus: string;
    TransationValue: number;
    CustomerServiceCharge: number;
    DueValue: number;
    PaidCurrency: string;
    PaidCurrencyValue: number;
    Currency: string;
    InvoiceDisplayValue: number;
  };
}

export interface RefundRequest {
  keyType: 'InvoiceId' | 'PaymentId';
  key: string;
  refundChargeOnCustomer: boolean;
  serviceChargeOnCustomer: boolean;
  amount: number;
  comment?: string;
}

export interface RefundResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: string | null;
  Data: {
    Key: string;
    RefundId: string;
    RefundReference: string;
    Amount: number;
    Comment: string;
  };
}

/**
 * MyFatoorah Client Class
 */
export class MyFatoorahClient {
  private config: MyFatoorahConfig;

  constructor(config: MyFatoorahConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Get available payment methods
   * الحصول على طرق الدفع المتاحة
   */
  async initiatePayment(invoiceValue: number, currency: string = 'SAR'): Promise<InitiatePaymentResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/InitiatePayment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        InvoiceAmount: invoiceValue,
        CurrencyIso: currency,
      }),
    });

    if (!response.ok) {
      throw new Error(`MyFatoorah API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute payment and get payment URL
   * تنفيذ الدفع والحصول على رابط الدفع
   */
  async executePayment(request: PaymentRequest, paymentMethodId: number): Promise<ExecutePaymentResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/ExecutePayment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        PaymentMethodId: paymentMethodId,
        InvoiceValue: request.invoiceValue,
        CustomerName: request.customerName,
        CustomerEmail: request.customerEmail,
        CustomerMobile: request.customerMobile,
        DisplayCurrencyIso: request.currency,
        CallBackUrl: request.callbackUrl,
        ErrorUrl: request.errorUrl,
        Language: request.language,
        CustomerReference: request.customerReference,
        UserDefinedField: request.userDefinedField,
        InvoiceItems: request.invoiceItems?.map((item) => ({
          ItemName: item.itemName,
          Quantity: item.quantity,
          UnitPrice: item.unitPrice,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`MyFatoorah API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send payment link via email/SMS
   * إرسال رابط الدفع عبر البريد أو الرسائل
   */
  async sendPayment(request: PaymentRequest): Promise<ExecutePaymentResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/SendPayment`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        InvoiceValue: request.invoiceValue,
        CustomerName: request.customerName,
        CustomerEmail: request.customerEmail,
        CustomerMobile: request.customerMobile,
        DisplayCurrencyIso: request.currency,
        NotificationOption: 'ALL', // LNK, SMS, EML, ALL
        CallBackUrl: request.callbackUrl,
        ErrorUrl: request.errorUrl,
        Language: request.language,
        CustomerReference: request.customerReference,
        UserDefinedField: request.userDefinedField,
        InvoiceItems: request.invoiceItems?.map((item) => ({
          ItemName: item.itemName,
          Quantity: item.quantity,
          UnitPrice: item.unitPrice,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`MyFatoorah API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get payment status
   * الحصول على حالة الدفع
   */
  async getPaymentStatus(
    paymentId: string,
    keyType: 'PaymentId' | 'InvoiceId' = 'PaymentId',
  ): Promise<PaymentStatusResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        Key: paymentId,
        KeyType: keyType,
      }),
    });

    if (!response.ok) {
      throw new Error(`MyFatoorah API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make a refund
   * إجراء استرداد
   */
  async makeRefund(request: RefundRequest): Promise<RefundResponse> {
    const response = await fetch(`${this.config.baseUrl}/v2/MakeRefund`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        KeyType: request.keyType,
        Key: request.key,
        RefundChargeOnCustomer: request.refundChargeOnCustomer,
        ServiceChargeOnCustomer: request.serviceChargeOnCustomer,
        Amount: request.amount,
        Comment: request.comment,
      }),
    });

    if (!response.ok) {
      throw new Error(`MyFatoorah API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Create MyFatoorah client instance
 * إنشاء عميل ماي فاتورة
 */
export function createMyFatoorahClient(options?: Partial<MyFatoorahConfig>): MyFatoorahClient {
  const config: MyFatoorahConfig = {
    apiKey: options?.apiKey || process.env.MYFATOORAH_API_KEY || '',
    baseUrl: options?.baseUrl || process.env.MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com',
    countryCode: options?.countryCode || 'SAU',
  };

  if (!config.apiKey) {
    console.warn('MyFatoorah API Key is not set. Payment features will not work.');
  }

  return new MyFatoorahClient(config);
}

/**
 * Subscription Plans
 * خطط الاشتراك
 */
export const SUBSCRIPTION_PLANS = {
  pro: {
    id: 'pro',
    name: 'الباقة الاحترافية',
    nameEn: 'Pro Plan',
    price: 99,
    currency: 'SAR' as const,
    interval: 'month',
    features: ['مشاريع غير محدودة', '100GB تخزين سحابي', 'دعم AI متقدم', 'نطاقات مخصصة', 'دعم فني على مدار الساعة'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'باقة الشركات',
    nameEn: 'Enterprise Plan',
    price: 299,
    currency: 'SAR' as const,
    interval: 'month',
    features: [
      'كل مميزات Pro',
      'تخزين غير محدود',
      'فريق عمل غير محدود',
      'SSO وأمان متقدم',
      'مدير حساب مخصص',
      'SLA 99.9%',
    ],
  },
};

/**
 * Create payment for subscription
 * إنشاء دفعة للاشتراك
 */
export async function createSubscriptionPayment(
  client: MyFatoorahClient,
  planId: 'pro' | 'enterprise',
  customer: CustomerInfo,
  callbackUrl: string,
  errorUrl: string,
): Promise<ExecutePaymentResponse> {
  const plan = SUBSCRIPTION_PLANS[planId];

  // First, get available payment methods
  const paymentMethods = await client.initiatePayment(plan.price, plan.currency);

  if (!paymentMethods.IsSuccess) {
    throw new Error(`Failed to get payment methods: ${paymentMethods.Message}`);
  }

  // Use the first available payment method (or you can let user choose)
  const paymentMethodId = paymentMethods.Data.PaymentMethods[0]?.PaymentMethodId;

  if (!paymentMethodId) {
    throw new Error('No payment methods available');
  }

  // Execute payment
  return client.executePayment(
    {
      invoiceValue: plan.price,
      currency: plan.currency,
      customerName: customer.name,
      customerEmail: customer.email,
      customerMobile: customer.mobile,
      callbackUrl,
      errorUrl,
      language: 'ar',
      customerReference: `sub_${planId}_${Date.now()}`,
      userDefinedField: JSON.stringify({ planId, customerId: customer.email }),
      invoiceItems: [
        {
          itemName: plan.name,
          quantity: 1,
          unitPrice: plan.price,
        },
      ],
    },
    paymentMethodId,
  );
}

/**
 * Handle payment callback
 * معالجة رد الدفع
 */
export async function handlePaymentCallback(
  client: MyFatoorahClient,
  paymentId: string,
): Promise<{
  success: boolean;
  status: string;
  invoiceId: number;
  amount: number;
  customerReference: string;
  userDefinedField: any;
}> {
  const status = await client.getPaymentStatus(paymentId);

  return {
    success: status.Data.InvoiceStatus === 'Paid',
    status: status.Data.InvoiceStatus,
    invoiceId: status.Data.InvoiceId,
    amount: status.Data.InvoiceValue,
    customerReference: status.Data.CustomerReference,
    userDefinedField: status.Data.Comments ? JSON.parse(status.Data.Comments) : null,
  };
}
