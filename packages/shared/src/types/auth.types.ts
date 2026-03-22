export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  data?: {
    user: User;
    accessToken: string;
  };
}
