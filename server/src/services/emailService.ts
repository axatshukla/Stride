// ============================================================
// Stride — Production Email Delivery Engine & Template Service
// ============================================================

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface SendInviteEmailParams {
  toEmail: string;
  inviterName: string;
  inviterEmail: string;
  teamName: string;
  inviteToken: string;
  role?: string;
}

/**
 * Builds the fixed, responsive HTML email template for team invitations.
 */
function buildInviteEmailHtml(params: {
  toEmail: string;
  inviterName: string;
  inviterEmail: string;
  teamName: string;
  inviteUrl: string;
  role: string;
}): string {
  const { inviterName, inviterEmail, teamName, inviteUrl, role } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${teamName} on Stride</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 32px 32px 24px 32px;
      border-bottom: 1px solid #F1F5F9;
      text-align: left;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: #4F46E5;
      letter-spacing: -0.03em;
    }
    .content {
      padding: 32px;
    }
    h1 {
      margin: 0 0 16px 0;
      font-size: 22px;
      font-weight: 600;
      color: #0F172A;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    p {
      margin: 0 0 20px 0;
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
    }
    .highlight-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .highlight-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13.5px;
    }
    .highlight-row:last-child {
      margin-bottom: 0;
    }
    .highlight-lbl {
      color: #64748B;
      font-weight: 500;
    }
    .highlight-val {
      color: #0F172A;
      font-weight: 600;
    }
    .btn-container {
      margin: 32px 0 24px 0;
      text-align: center;
    }
    .btn-primary {
      display: inline-block;
      background-color: #4F46E5;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 13px 28px;
      border-radius: 8px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .btn-primary:hover {
      background-color: #4338CA;
    }
    .expiry-note {
      font-size: 12.5px;
      color: #94A3B8;
      text-align: center;
      margin-top: 12px;
    }
    .link-fallback {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #F1F5F9;
      font-size: 12px;
      color: #64748B;
      word-break: break-all;
      line-height: 1.5;
    }
    .footer {
      padding: 24px 32px;
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-logo">
          <span class="brand-name">⚡ Stride</span>
        </div>
      </div>
      
      <div class="content">
        <h1>Join ${teamName} on Stride</h1>
        <p>
          <strong>${inviterName}</strong> (${inviterEmail}) has invited you to collaborate on tasks, sprint milestones, and roadmaps in the <strong>${teamName}</strong> workspace.
        </p>

        <div class="highlight-card">
          <div class="highlight-row">
            <span class="highlight-lbl">Workspace:</span>
            <span class="highlight-val">${teamName}</span>
          </div>
          <div class="highlight-row">
            <span class="highlight-lbl">Role:</span>
            <span class="highlight-val">${role === 'admin' ? 'Team Admin' : 'Team Member'}</span>
          </div>
          <div class="highlight-row">
            <span class="highlight-lbl">Invited By:</span>
            <span class="highlight-val">${inviterName}</span>
          </div>
        </div>

        <div class="btn-container">
          <a href="${inviteUrl}" class="btn-primary" target="_blank">
            Accept Invitation & Join Team →
          </a>
          <div class="expiry-note">This invitation link will expire in 7 days.</div>
        </div>

        <div class="link-fallback">
          If the button above does not work, copy and paste this link into your browser:<br>
          <a href="${inviteUrl}" style="color: #4F46E5;">${inviteUrl}</a>
        </div>
      </div>

      <div class="footer">
        Stride • High-Performance Task, Kanban & Sprint Collaboration<br>
        Make progress, every day.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Creates SMTP transporter if credentials are provided in environment
 */
function getTransporter(): Transporter | null {
  // Option 1: Resend API Key
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
  }

  // Option 2: Pre-configured Service (e.g. gmail, SendGrid, Mailgun)
  const service = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (service && user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  // Option 3: Custom SMTP Host & Port
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Dispatches a real team invitation email with the fixed HTML template.
 */
export async function sendTeamInviteEmail(params: SendInviteEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  simulated: boolean;
  inviteUrl: string;
}> {
  const baseUrl = process.env.APP_URL || process.env.URL || 'https://strideeee.netlify.app';
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/join?token=${params.inviteToken}`;
  const role = params.role || 'member';

  const html = buildInviteEmailHtml({
    toEmail: params.toEmail,
    inviterName: params.inviterName,
    inviterEmail: params.inviterEmail,
    teamName: params.teamName,
    inviteUrl,
    role,
  });

  const subject = `${params.inviterName} invited you to join ${params.teamName} on Stride`;
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `Stride <${process.env.SMTP_USER || params.inviterEmail || 'no-reply@stride.app'}>`;

  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.toEmail,
        subject,
        html,
        text: `${params.inviterName} (${params.inviterEmail}) invited you to join ${params.teamName} on Stride.\n\nAccept your invitation here:\n${inviteUrl}\n\nThis link will expire in 7 days.`,
      });

      console.log(`📧 Real invitation email sent to ${params.toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        simulated: false,
        inviteUrl,
      };
    } catch (err: any) {
      console.error(`⚠️ SMTP dispatch error for ${params.toEmail}:`, err.message);
      // Return URL fallback so user can still share the generated link
      return {
        success: false,
        simulated: false,
        inviteUrl,
      };
    }
  } else {
    // Development / Simulated mode: Log preview details
    console.log(`\n======================================================`);
    console.log(`📧 [Simulated Email Delivery] Team Invitation`);
    console.log(`To: ${params.toEmail}`);
    console.log(`From: ${fromAddress}`);
    console.log(`Subject: ${subject}`);
    console.log(`Invite Link: ${inviteUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      inviteUrl,
    };
  }
}
