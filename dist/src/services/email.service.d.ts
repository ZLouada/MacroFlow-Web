export declare const emailService: {
    sendVerificationEmail(email: string, name: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>;
    sendWorkspaceInviteEmail(email: string, inviterName: string, workspaceName: string, workspaceId: string): Promise<void>;
    sendTaskAssignedEmail(email: string, assignerName: string, taskTitle: string, projectName: string, taskId: string): Promise<void>;
    sendCustomEmail(email: string, subject: string, html: string): Promise<void>;
};
export default emailService;
//# sourceMappingURL=email.service.d.ts.map