import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Show spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth state is known - redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response: { data: { message: string } } };
        setServerError(axiosErr.response?.data?.message ?? "Login failed");
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-brand-500 text-2xl font-bold tracking-tight">
            {`<DevLog />`}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your developer activity
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-lg font-semi-bold text-gray-100 mb-6">
            Sign in to your account
          </h2>

          {/* Server Error */}
          {serverError && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account?{"  "}
          <Link
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
