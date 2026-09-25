import { describe, it, expect, vi } from "vitest";
import React from "react";
import { RoleGate } from "../src/components/auth/role-gate.js";
import * as AuthContextModule from "../src/contexts/auth-context.js";

vi.mock("../src/contexts/auth-context.js", () => ({
  useAuth: vi.fn(),
}));

describe("RoleGate Component", () => {
  it("should render fallback when authentication is loading", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const element = RoleGate({
      allowedRoles: ["ADMIN"],
      fallback: React.createElement("span", null, "Loading..."),
      children: React.createElement("div", null, "Protected Content"),
    });

    expect(element.props.children).toEqual(
      React.createElement("span", null, "Loading..."),
    );
  });

  it("should render fallback when user is unauthenticated", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const element = RoleGate({
      allowedRoles: ["ADMIN"],
      fallback: React.createElement("span", null, "Access Denied"),
      children: React.createElement("div", null, "Protected Content"),
    });

    expect(element.props.children).toEqual(
      React.createElement("span", null, "Access Denied"),
    );
  });

  it("should render fallback when user lacks required role", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: {
        id: "u1",
        email: "viewer@veylix.corp",
        name: "Viewer",
        role: "AUDITOR",
      },
      isLoading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const element = RoleGate({
      allowedRoles: ["ADMIN", "MANAGER"],
      fallback: React.createElement("span", null, "Forbidden"),
      children: React.createElement("div", null, "Protected Content"),
    });

    expect(element.props.children).toEqual(
      React.createElement("span", null, "Forbidden"),
    );
  });

  it("should render children when user possesses an allowed role", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: {
        id: "u2",
        email: "admin@veylix.corp",
        name: "Admin",
        role: "ADMIN",
      },
      isLoading: false,
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const childrenNode = React.createElement("div", null, "Protected Content");
    const element = RoleGate({
      allowedRoles: ["ADMIN", "MANAGER"],
      fallback: React.createElement("span", null, "Forbidden"),
      children: childrenNode,
    });

    expect(element.props.children).toEqual(childrenNode);
  });
});
