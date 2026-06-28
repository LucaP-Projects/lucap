
// Email service configuration
const EMAIL_SERVICE_URL =
  process.env.EMAIL_SERVICE_URL || 'http://localhost:8081/api/v1';

// Types for email service API
export interface SendEmailRequest {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface SendTemplateEmailRequest {
  to: string[];
  template_id: number;
  variables: Record<string, string>;
}

export interface EmailResponse {
  message: string;
  email_log: {
    id: number;
    recipient: string;
    subject: string;
    template_id: number | null;
    status: string;
    error_message: string | null;
    zeptomail_id: string;
    sent_at: string;
    created_at: string;
  };
}

// Email service client
class EmailServiceClient {
  private baseURL: string;
  private healthURL: string;

  constructor(baseURL: string = EMAIL_SERVICE_URL) {
    this.baseURL = baseURL;
    // Health endpoint is at root level, not under /api/v1
    this.healthURL = baseURL.replace('/api/v1', '');
  }
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    console.log(`📧 Email service request: ${options.method} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Email service error: ${response.status} - ${errorText}`
        );
        throw new Error(
          `Email service error: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✅ Email service success: ${options.method} ${url}`);
      return result;
    } catch (error) {
      console.error(`❌ Email service request failed for ${url}:`, error);
      // Provide helpful debugging information
      if (
        error instanceof Error &&
        (error as any).cause?.code === 'ENOTFOUND'
      ) {
        console.error(`🔍 Debug info:`);
        console.error(`   - URL: ${url}`);
        console.error(
          `   - EMAIL_SERVICE_URL: ${process.env.EMAIL_SERVICE_URL || 'not set'}`
        );
        console.error(
          `   - Suggestion: Make sure the email service is running and accessible`
        );
        console.error(`   - For local dev: Use http://localhost:8081/api/v1`);
        console.error(
          `   - For Docker: Use http://lucap_email:8080/api/v1`
        );
      }

      throw error;
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<EmailResponse> {
    return this.makeRequest<EmailResponse>('/emails/send', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async sendTemplateEmail(
    request: SendTemplateEmailRequest
  ): Promise<EmailResponse> {
    return this.makeRequest<EmailResponse>('/emails/template', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getEmailStatus(emailId: number): Promise<EmailResponse['email_log']> {
    return this.makeRequest<EmailResponse['email_log']>(
      `/emails/${emailId}/status`,
      {
        method: 'GET'
      }
    );
  }
  async healthCheck(): Promise<{ status: string }> {
    const url = `${this.healthURL}/health`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Health check failed: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Health check failed:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailServiceClient();

// Helper functions for Better Auth integration
export async function sendVerificationEmail({
  to,
  subject,
  verificationUrl
}: {
  to: string;
  subject: string;
  verificationUrl: string;
}) {
  const html = `
    <div style="max-width:500px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;">
      <h1 style="font-size:20px;color:#333;">${subject}</h1>
      <p style="font-size:16px;">Please verify your email address to complete the registration process.</p>
      <a href="${verificationUrl}" style="display:inline-block;margin-top:15px;padding:10px 15px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">
        Verify Email Address
      </a>
      <p style="font-size:14px;color:#666;margin-top:20px;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
    ${subject}
    
    Please verify your email address to complete the registration process.
    
    Click here to verify: ${verificationUrl}
    
    If you didn't create this account, you can safely ignore this email.
  `;

  try {
    return await emailService.sendEmail({
      to: [to],
      subject: `LucaP - ${subject}`,
      html,
      text
    });
  } catch (error) {
    // In development, log the email instead of failing
    // Check multiple ways to detect development mode
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      !process.env.NODE_ENV ||
      process.env.EMAIL_SERVICE_URL?.includes('localhost');

    if (isDevelopment) {
      console.log('📧 Email would be sent (dev mode):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: LucaP - ${subject}`);
      console.log(`   Verification URL: ${verificationUrl}`);

      // Return a mock successful response
      return {
        message: 'Email logged (development mode)',
        email_log: {
          id: 0,
          recipient: to,
          subject: `LucaP - ${subject}`,
          template_id: null,
          status: 'logged',
          error_message: null,
          zeptomail_id: 'dev-mode',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      };
    }
    throw error;
  }
}

export async function sendPasswordResetEmail({
  to,
  subject,
  resetUrl
}: {
  to: string;
  subject: string;
  resetUrl: string;
}) {
  const html = `
    <div style="max-width:500px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;">
      <h1 style="font-size:20px;color:#333;">${subject}</h1>
      <p style="font-size:16px;">Please click the link below to reset your password.</p>
      <a href="${resetUrl}" style="display:inline-block;margin-top:15px;padding:10px 15px;background:#dc3545;color:#fff;text-decoration:none;border-radius:4px;">
        Reset Password
      </a>
      <p style="font-size:14px;color:#666;margin-top:20px;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
    ${subject}
    
    Please click the link below to reset your password.
    
    Reset link: ${resetUrl}
    
    If you didn't request a password reset, you can safely ignore this email.
  `;

  try {
    return await emailService.sendEmail({
      to: [to],
      subject: `LucaP - ${subject}`,
      html,
      text
    });
  } catch (error) {
    // In development, log the email instead of failing
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      !process.env.NODE_ENV ||
      process.env.EMAIL_SERVICE_URL?.includes('localhost');

    if (isDevelopment) {
      console.log('📧 Password reset email would be sent (dev mode):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: LucaP - ${subject}`);
      console.log(`   Reset URL: ${resetUrl}`);

      // Return a mock successful response
      return {
        message: 'Email logged (development mode)',
        email_log: {
          id: 0,
          recipient: to,
          subject: `LucaP - ${subject}`,
          template_id: null,
          status: 'logged',
          error_message: null,
          zeptomail_id: 'dev-mode',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      };
    }
    throw error;
  }
}

export async function sendMagicLinkEmail({
  to,
  subject,
  magicLinkUrl
}: {
  to: string;
  subject: string;
  magicLinkUrl: string;
}) {
  const html = `
    <div style="max-width:500px;margin:20px auto;padding:20px;border:1px solid #ddd;border-radius:6px;">
      <h1 style="font-size:20px;color:#333;">${subject}</h1>
      <p style="font-size:16px;">Click the link below to sign in to your account.</p>
      <a href="${magicLinkUrl}" style="display:inline-block;margin-top:15px;padding:10px 15px;background:#28a745;color:#fff;text-decoration:none;border-radius:4px;">
        Sign In with Magic Link
      </a>
      <p style="font-size:14px;color:#666;margin-top:20px;">
        This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
    ${subject}
    
    Click the link below to sign in to your account.
    
    Magic link: ${magicLinkUrl}
    
    This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
  `;

  try {
    return await emailService.sendEmail({
      to: [to],
      subject: `LucaP - ${subject}`,
      html,
      text
    });
  } catch (error) {
    // In development, log the email instead of failing
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      !process.env.NODE_ENV ||
      process.env.EMAIL_SERVICE_URL?.includes('localhost');

    if (isDevelopment) {
      console.log('📧 Magic link email would be sent (dev mode):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: LucaP - ${subject}`);
      console.log(`   Magic Link: ${magicLinkUrl}`);

      // Return a mock successful response
      return {
        message: 'Email logged (development mode)',
        email_log: {
          id: 0,
          recipient: to,
          subject: `LucaP - ${subject}`,
          template_id: null,
          status: 'logged',
          error_message: null,
          zeptomail_id: 'dev-mode',
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      };
    }
    throw error;
  }
}
