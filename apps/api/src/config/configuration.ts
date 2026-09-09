export default () => ({
  nodeEnv: process.env["NODE_ENV"] || "development",
  port: parseInt(process.env["PORT"] || "4000", 10),
  database: {
    url: process.env["DATABASE_URL"],
  },
  security: {
    sessionSecret: process.env["SESSION_SECRET"],
    corsOrigins: (process.env["CORS_ORIGINS"] || "http://localhost:3000").split(
      ",",
    ),
  },
  logging: {
    level: process.env["LOG_LEVEL"] || "info",
  },
});
