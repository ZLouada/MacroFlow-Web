/**
 * Services Index
 * 
 * Export all API services from a single entry point.
 */

export { api, setAccessToken, getAccessToken, setRefreshToken, getRefreshToken, clearTokens } from './api';
export type { ApiError, ApiResponse } from './api';

export { authService } from './auth.service';
export type { LoginRequest, RegisterRequest, LoginResponse, AuthUserResponse, TwoFactorSetupResponse } from './auth.service';

// Future services can be added here:
// export { userService } from './user.service';
// export { projectService } from './project.service';
// export { taskService } from './task.service';
// export { workspaceService } from './workspace.service';
