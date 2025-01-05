import rateLimit from "express-rate-limit";

// Example: Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  message: {
    statusCode: 429,
    success: false,
    message: "Global rate limit exceeded. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginAndRegisterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const shortIdRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "URL creation limit exceeded. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { globalLimiter, loginAndRegisterLimiter, shortIdRateLimiter };
