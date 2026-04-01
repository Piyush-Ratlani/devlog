import { vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock axios instance
vi.mock("../lib/axios.ts", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "../lib/axios";

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

const TestComponent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.name ?? "no user"}</span>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should start with isLoading true then resolve to unauthenticated", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("no user");
    });
  });

  it("should restore auth state from localStorage token", async () => {
    localStorage.setItem("accessToken", "mock-token");

    mockedGet.mockResolvedValueOnce({
      data: {
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@test.com",
            createdAt: "",
          },
        },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(screen.getByTestId("user").textContent).toBe("Test User");
    });
  });

  it("should clear suth state if token is invalid", async () => {
    localStorage.setItem("accessToken", "invalid-token");
    mockedGet.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });

  it("should set authenticated state on login", async () => {
    mockedGet.mockRejectedValueOnce(new Error("No token"));
    mockedPost.mockResolvedValueOnce({
      data: {
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@test.com",
            createdAt: "",
          },
          accessToken: "new-token",
        },
      },
    });

    const LoginButton = () => {
      const { login, isAuthenticated } = useAuth();
      return (
        <div>
          <span data-testid="authenticated">{String(isAuthenticated)}</span>
          <button onClick={() => login("test@test.com", "test1234")}>
            Login
          </button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("true");
      expect(localStorage.getItem("accessToken")).toBe("new-token");
    });
  });
});
