import { supabase } from "@/integrations/supabase/client";

type SecurityAlertType = 
  | "new_login" 
  | "password_changed" 
  | "email_changed" 
  | "failed_login_attempt"
  | "two_factor_enabled"
  | "two_factor_disabled";

interface SecurityAlertMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp?: string;
  oldEmail?: string;
  newEmail?: string;
}

export const SecurityAlertService = {
  /**
   * Send a security alert notification to the user
   */
  async sendAlert(
    userId: string,
    email: string,
    alertType: SecurityAlertType,
    metadata?: SecurityAlertMetadata
  ): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke("send-security-alert", {
        body: {
          userId,
          email,
          alertType,
          metadata: {
            ...metadata,
            timestamp: metadata?.timestamp || new Date().toISOString(),
            userAgent: metadata?.userAgent || navigator.userAgent,
          },
        },
      });

      if (error) {
        console.error("Error sending security alert:", error);
        return { success: false, error: error.message };
      }

      return { success: true, skipped: data?.skipped };
    } catch (err: any) {
      console.error("Failed to send security alert:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Send a new login alert
   */
  async notifyNewLogin(userId: string, email: string): Promise<void> {
    await this.sendAlert(userId, email, "new_login", {
      userAgent: navigator.userAgent,
    });
  },

  /**
   * Send a password changed alert
   */
  async notifyPasswordChanged(userId: string, email: string): Promise<void> {
    await this.sendAlert(userId, email, "password_changed");
  },

  /**
   * Send an email changed alert
   */
  async notifyEmailChanged(
    userId: string, 
    oldEmail: string, 
    newEmail: string
  ): Promise<void> {
    // Send to old email for security
    await this.sendAlert(userId, oldEmail, "email_changed", {
      oldEmail,
      newEmail,
    });
  },

  /**
   * Send a 2FA enabled alert
   */
  async notifyTwoFactorEnabled(userId: string, email: string): Promise<void> {
    await this.sendAlert(userId, email, "two_factor_enabled");
  },

  /**
   * Send a 2FA disabled alert
   */
  async notifyTwoFactorDisabled(userId: string, email: string): Promise<void> {
    await this.sendAlert(userId, email, "two_factor_disabled");
  },
};
