import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../lib/axios.ts", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "../lib/axios";
import userEvent from "@testing-library/user-event";

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const renderLoginPage = () => {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockedGet.mockRejectedValue(new Error("No token"));
  });

  it("should render the login form", async () => {
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
      expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    });
  });

  it("should show validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeDefined();
      expect(screen.getByText("Password is required")).toBeDefined();
    });
  });

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    });

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "notanemail",
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeDefined();
    });
  });

  it("should show server error on invalid credentials", async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValueOnce({
      response: { data: { message: "Invalid email or password" } },
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    });

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@test.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeDefined();
    });
  });

  it("should call login with correct credentials", async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValueOnce({
      data: {
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@test.com",
            createdAt: "",
          },
          accessToken: "token-123",
        },
      },
    });

    renderLoginPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    });

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "test@test.com",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/api/auth/login", {
        email: "test@test.com",
        password: "password123",
      });
    });
  });
});
