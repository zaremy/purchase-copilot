import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

// Mock the config module before importing the middleware
vi.mock("../config", () => ({
  config: {
    REVENUECAT_WEBHOOK_AUTH_TOKEN: "test-webhook-token",
  },
  hasWebhookAuth: true,
}));

// Now import the middleware after mocking
import { verifyRevenueCatAuth } from "../middleware/webhookAuth";

describe("verifyRevenueCatAuth middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it("should call next() when Authorization header matches", () => {
    mockReq.headers = {
      authorization: "Bearer test-webhook-token",
    };

    verifyRevenueCatAuth(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("should return 401 when Authorization header is missing", () => {
    mockReq.headers = {};

    verifyRevenueCatAuth(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "INVALID_AUTH",
      message: "Invalid or missing Authorization header",
    });
  });

  it("should return 401 when Authorization header is wrong", () => {
    mockReq.headers = {
      authorization: "Bearer wrong-token",
    };

    verifyRevenueCatAuth(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "INVALID_AUTH",
      message: "Invalid or missing Authorization header",
    });
  });

  it("should return 401 when Authorization header uses wrong format", () => {
    mockReq.headers = {
      authorization: "test-webhook-token", // Missing "Bearer " prefix
    };

    verifyRevenueCatAuth(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
