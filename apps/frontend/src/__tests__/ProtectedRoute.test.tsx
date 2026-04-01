import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../lib/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "../lib/axios";

const mockedGet = vi.mocked(api.get);

const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<div data-testid="login-page">Login Page</div>}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<div data-testid="dashboard">Dashboard</div>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    // vi.clearAllMocks();
  });

  it("should redirect to login when not authenticated", async () => {
    mockedGet.mockRejectedValueOnce(new Error("Unauthorized"));

    renderWithRouter("/dashboard");
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeDefined();
    });
  });

  it("should render protected content when authenticated", async () => {
    localStorage.setItem("accessToken", "valid-token");

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
    renderWithRouter("/dashboard");
    await waitFor(() => {
      expect(screen.getByTestId("dashboard")).toBeDefined();
    });
  });

  it("should show loading spinner while auth state is being determined", async () => {
    localStorage.setItem("accessToken", "valid-token");

    mockedGet.mockImplementationOnce(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
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
              }),
            200,
          ),
        ),
    );

    renderWithRouter("/dashboard");

    expect(screen.queryByTestId("dashboard")).toBeNull();
    expect(screen.queryByTestId("login-page")).toBeNull();

    await waitFor(() => {
      expect(screen.getByTestId("dashboard")).toBeDefined();
    });
  });
});
