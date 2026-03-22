export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    accessToken: string;
  };
}
