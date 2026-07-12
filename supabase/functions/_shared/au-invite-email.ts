/**
 * Shared invite email + safe error helpers used by send-invite and resend-invite.
 */
import { Resend } from "https://esm.sh/resend@2.0.0";

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

export const GENERIC_DELIVERY_ERROR = "Email could not be sent. Please try Resend.";

export async function sendInviteEmail(params: {
  toEmail: string;
  ownerName: string;
  role: "full_access" | "read_only";
  rawToken: string;
}): Promise<{ ok: true } | { ok: false; rawError: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    return { ok: false, rawError: "RESEND_API_KEY not configured" };
  }

  const safeOwnerName = escapeHtml(params.ownerName || "An Asset Safe user");
  const roleLabel = params.role === "full_access" ? "Full Access" : "Read Only";
  const roleDescription = params.role === "full_access"
    ? "You'll be able to view, add, update, and manage information across the account."
    : "You'll be able to view important information, but not make changes.";
  const inviteUrl = `https://getassetsafe.com/invite?token=${params.rawToken}&email=${encodeURIComponent(params.toEmail)}`;

  try {
    const resend = new Resend(resendApiKey);
    const { error: sendErr } = await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [params.toEmail],
      subject: "You've been invited to access an Asset Safe account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
          <div style="text-align: center; padding: 30px 20px 20px;">
            <img src="https://getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg" alt="Asset Safe" style="max-width: 200px;" />
          </div>
          <div style="background: #ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">You've Been Invited</h2>
            <p style="color: #374151; line-height: 1.6; margin: 0 0 20px;">
              <strong>${safeOwnerName}</strong> has invited you to access their Asset Safe account as an authorized user.
            </p>
            <div style="background: #f3f4f6; padding: 16px 20px; border-radius: 6px; margin: 0 0 20px;">
              <p style="color: #374151; margin: 0 0 6px; font-size: 14px;"><strong>Your access level:</strong> ${roleLabel}</p>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">${roleDescription}</p>
            </div>
            <div style="text-align: center; margin: 0 0 20px;">
              <a href="${inviteUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 25px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${inviteUrl}" style="color: #1e40af; word-break: break-all;">${inviteUrl}</a>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              This invitation will expire in 7 days. If you don't recognize the sender, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    if (sendErr) {
      return { ok: false, rawError: (sendErr as any)?.message || "Resend rejected the message." };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, rawError: e?.message || "Resend exception" };
  }
}

export async function sendAccessChangedEmail(params: {
  toEmail: string;
  ownerName: string;
  action: "revoked" | "role_changed";
  newRole?: "full_access" | "read_only";
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;
  const safeOwner = escapeHtml(params.ownerName || "The account owner");
  let subject = "Your access to an Asset Safe account was updated";
  let body = "";
  if (params.action === "revoked") {
    subject = "Your access to an Asset Safe account was removed";
    body = `<p>${safeOwner} has removed your authorized-user access. You will no longer be able to view or manage that account.</p>`;
  } else {
    const roleLabel = params.newRole === "full_access" ? "Full Access" : "Read Only";
    body = `<p>${safeOwner} updated your access level to <strong>${roleLabel}</strong>.</p>`;
  }
  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [params.toEmail],
      subject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color:#1f2937;">${body}<p style="color:#6b7280; font-size:13px; margin-top:24px;">If you believe this was a mistake, contact the account owner directly.</p></div>`,
    });
  } catch (e) {
    console.error("[AU-EMAIL] access changed email failed (non-fatal):", e);
  }
}

export async function sendInviteAcceptedOwnerEmail(params: {
  toEmail: string;
  inviteeEmail: string;
  role: "full_access" | "read_only";
}): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;
  const roleLabel = params.role === "full_access" ? "Full Access" : "Read Only";
  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: "Asset Safe <noreply@assetsafe.net>",
      to: [params.toEmail],
      subject: "An invitation to your Asset Safe account was accepted",
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color:#1f2937;">
        <p><strong>${escapeHtml(params.inviteeEmail)}</strong> just accepted your invitation and now has <strong>${roleLabel}</strong> access to your account.</p>
        <p style="color:#6b7280; font-size:13px; margin-top:24px;">You can change or remove their access at any time from Account Settings → Authorized Users.</p>
      </div>`,
    });
  } catch (e) {
    console.error("[AU-EMAIL] owner-accepted email failed (non-fatal):", e);
  }
}
