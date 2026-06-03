// Shared HTML email helpers for account closure notifications.
// Uses Resend directly (project standard for transactional emails).

import { Resend } from "https://esm.sh/resend@2.0.0";

const FROM = "Asset Safe <support@assetsafe.net>";
const LOGO = "https://www.getassetsafe.com/lovable-uploads/asset-safe-logo-email-v2.jpg";
const APP_URL = "https://www.getassetsafe.com";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const shell = (title: string, body: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
  <div style="text-align:center; padding: 30px 20px 20px;">
    <img src="${LOGO}" alt="Asset Safe" style="max-width: 200px;" />
  </div>
  <div style="background:#ffffff; padding: 30px 25px; margin: 0 20px; border-radius: 8px;">
    <h2 style="color:#1f2937; margin:0 0 20px; font-size:22px;">${title}</h2>
    ${body}
    <p style="color:#374151; font-size:14px; margin: 24px 0 0;">
      Questions? Contact us at <a href="mailto:support@assetsafe.net" style="color:#1e40af;">support@assetsafe.net</a>
    </p>
  </div>
  <div style="padding: 20px; text-align:center;">
    <p style="color:#9ca3af; font-size:12px; margin:0;">Asset Safe</p>
  </div>
</div>`;

export async function sendOwnerScheduledEmail(opts: {
  to: string;
  ownerName: string;
  scheduledDateIso: string;
  matchesBillingPeriod: boolean;
}) {
  const dateStr = formatDate(opts.scheduledDateIso);
  const reasonLine = opts.matchesBillingPeriod
    ? "This matches the end of your current billing period."
    : "This is 30 days from today.";
  const body = `
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">Hi ${opts.ownerName || "there"},</p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      Your Asset Safe account is scheduled for permanent deletion on <strong>${dateStr}</strong>.
    </p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">${reasonLine}</p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      Until that date, you retain read-only access to your account. If this was a mistake or you change your mind,
      you can reverse this request at any time from Account Settings.
    </p>
    <div style="text-align:center; margin: 24px 0;">
      <a href="${APP_URL}/account?tab=manage"
         style="background:#1e40af; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
        Manage Account
      </a>
    </div>
    <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
      After ${dateStr}, your account and all associated data will be permanently removed and cannot be recovered.
    </p>`;
  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `Your Asset Safe account deletion is scheduled for ${dateStr}`,
    html: shell("Account Deletion Scheduled", body),
  });
}

export async function sendContributorScheduledEmail(opts: {
  to: string;
  contributorName?: string | null;
  ownerName: string;
  ownerEmail: string;
  scheduledDateIso: string;
}) {
  const dateStr = formatDate(opts.scheduledDateIso);
  const greeting = opts.contributorName ? `Hi ${opts.contributorName},` : "Hello,";
  const body = `
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">${greeting}</p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      We're letting you know that <strong>${opts.ownerName || opts.ownerEmail}</strong>
      has scheduled their Asset Safe account for permanent deletion on <strong>${dateStr}</strong>.
    </p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      As an authorized user on this account, your access will end on that date. Until then, your access continues
      as normal and you may wish to export anything you need before that time.
    </p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      If you believe this was scheduled in error, please reach out to the account owner directly.
    </p>`;
  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `An Asset Safe account you have access to is scheduled for deletion`,
    html: shell("Account Scheduled for Deletion", body),
  });
}

export async function sendOwnerReversedEmail(opts: {
  to: string;
  ownerName: string;
}) {
  const body = `
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">Hi ${opts.ownerName || "there"},</p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      Good news — the scheduled deletion of your Asset Safe account has been <strong>cancelled</strong>.
      Your account remains fully active and no data will be removed.
    </p>
    <div style="text-align:center; margin: 24px 0;">
      <a href="${APP_URL}/account"
         style="background:#1e40af; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
        Go to Account
      </a>
    </div>`;
  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: "Your Asset Safe account deletion has been cancelled",
    html: shell("Account Deletion Cancelled", body),
  });
}

export async function sendContributorReversedEmail(opts: {
  to: string;
  contributorName?: string | null;
  ownerName: string;
  ownerEmail: string;
}) {
  const greeting = opts.contributorName ? `Hi ${opts.contributorName},` : "Hello,";
  const body = `
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">${greeting}</p>
    <p style="color:#374151; line-height:1.6; margin:0 0 16px;">
      The scheduled deletion of <strong>${opts.ownerName || opts.ownerEmail}</strong>'s Asset Safe account
      has been <strong>cancelled</strong>. Your access as an authorized user continues as normal.
    </p>`;
  return resend.emails.send({
    from: FROM,
    to: [opts.to],
    subject: `An Asset Safe account deletion has been cancelled`,
    html: shell("Account Deletion Cancelled", body),
  });
}
