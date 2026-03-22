// Re-export from shared package
// Backend-specific auth types extend the shared ones here if needed
export type {
  User,
  RegisterRequestBody,
  LoginRequestBody,
  AuthResponse,
} from "@devlog/shared";
