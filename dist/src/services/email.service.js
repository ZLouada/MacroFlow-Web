"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_js_1 = require("../config/index.js");
const logger_js_1 = require("../utils/logger.js");
// ===========================================
// Email Transporter
// ===========================================
const transporter = nodemailer_1.default.createTransport({
    host: index_js_1.config.smtp.host,
    port: index_js_1.config.smtp.port,
    secure: index_js_1.config.smtp.port === 465,
    auth: index_js_1.config.smtp.user && index_js_1.config.smtp.pass
        ? {
            user: index_js_1.config.smtp.user,
            pass: index_js_1.config.smtp.pass,
        }
        : undefined,
});
// ===========================================
// Email Templates
// ===========================================
const templates = {
    verification: (name, link) => ({
        subject: 'Verify your MacroFlow email',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MacroFlow</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up for MacroFlow. Please verify your email address by clicking the button below:</p>
            <a href="${link}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${link}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MacroFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
    passwordReset: (name, link) => ({
        subject: 'Reset your MacroFlow password',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MacroFlow</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${link}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${link}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MacroFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
    workspaceInvite: (inviterName, workspaceName, link) => ({
        subject: `You've been invited to join ${workspaceName} on MacroFlow`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MacroFlow</h1>
          </div>
          <div class="content">
            <h2>You're invited!</h2>
            <p>${inviterName} has invited you to join the workspace <strong>${workspaceName}</strong> on MacroFlow.</p>
            <a href="${link}" class="button">Accept Invitation</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${link}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MacroFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
    taskAssigned: (assignerName, taskTitle, projectName, link) => ({
        subject: `New task assigned: ${taskTitle}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .task-card { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MacroFlow</h1>
          </div>
          <div class="content">
            <h2>New Task Assigned</h2>
            <p>${assignerName} has assigned you a new task:</p>
            <div class="task-card">
              <h3>${taskTitle}</h3>
              <p>Project: ${projectName}</p>
            </div>
            <a href="${link}" class="button">View Task</a>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MacroFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
};
// ===========================================
// Email Service
// ===========================================
exports.emailService = {
    async sendVerificationEmail(email, name, token) {
        const link = `${index_js_1.config.frontend.url}/verify-email?token=${token}`;
        const template = templates.verification(name, link);
        try {
            await transporter.sendMail({
                from: index_js_1.config.smtp.from,
                to: email,
                subject: template.subject,
                html: template.html,
            });
            logger_js_1.logger.info(`Verification email sent to ${email}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send verification email:', error);
            // Don't throw - email sending should not block registration
        }
    },
    async sendPasswordResetEmail(email, name, token) {
        const link = `${index_js_1.config.frontend.url}/reset-password?token=${token}`;
        const template = templates.passwordReset(name, link);
        try {
            await transporter.sendMail({
                from: index_js_1.config.smtp.from,
                to: email,
                subject: template.subject,
                html: template.html,
            });
            logger_js_1.logger.info(`Password reset email sent to ${email}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send password reset email:', error);
        }
    },
    async sendWorkspaceInviteEmail(email, inviterName, workspaceName, workspaceId) {
        const link = `${index_js_1.config.frontend.url}/workspaces/${workspaceId}/join`;
        const template = templates.workspaceInvite(inviterName, workspaceName, link);
        try {
            await transporter.sendMail({
                from: index_js_1.config.smtp.from,
                to: email,
                subject: template.subject,
                html: template.html,
            });
            logger_js_1.logger.info(`Workspace invite email sent to ${email}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send workspace invite email:', error);
        }
    },
    async sendTaskAssignedEmail(email, assignerName, taskTitle, projectName, taskId) {
        const link = `${index_js_1.config.frontend.url}/tasks/${taskId}`;
        const template = templates.taskAssigned(assignerName, taskTitle, projectName, link);
        try {
            await transporter.sendMail({
                from: index_js_1.config.smtp.from,
                to: email,
                subject: template.subject,
                html: template.html,
            });
            logger_js_1.logger.info(`Task assigned email sent to ${email}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send task assigned email:', error);
        }
    },
    async sendCustomEmail(email, subject, html) {
        try {
            await transporter.sendMail({
                from: index_js_1.config.smtp.from,
                to: email,
                subject,
                html,
            });
            logger_js_1.logger.info(`Custom email sent to ${email}`);
        }
        catch (error) {
            logger_js_1.logger.error('Failed to send custom email:', error);
            throw error;
        }
    },
};
exports.default = exports.emailService;
//# sourceMappingURL=email.service.js.map