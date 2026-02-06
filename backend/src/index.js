require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { config } = require("./config/app.config");
const connectDatabase = require("./config/database.config");
const { errorHandler } = require("./middlewares/errorHandler.middleware");
const { HTTPSTATUS } = require("./config/http.config");
const { asyncHandler } = require("./middlewares/asyncHandler.middleware");
require("./config/passport.config");
const passport = require("passport");
const { BadRequestException } = require("./utils/appError");
const { ErrorCodeEnum } = require("./enums/error-code.enum");
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.routes");
const isAuthenticated = require("./middlewares/isAuthenticated.middleware");
const workspaceRoutes = require("./routes/workspace.route");
const memberRoutes = require("./routes/member.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.route");
const { passportAuthenticationJWT } = require("./config/passport.config");
const autoSeedRoles = require("./utils/auto-seed-roles");

const app = express();
const BASE_PATH = config.BASE_PATH;

// ⚠️ CRITICAL: CORS MUST BE FIRST - before all other middleware
// CORS Configuration - Support multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  config.FRONTEND_ORIGIN, // Production frontend URL from env
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours - cache preflight responses
};

// Apply CORS to all routes
app.use(cors(corsOptions));

// Explicitly handle preflight (OPTIONS) requests BEFORE body parser and routes
app.options("*", cors(corsOptions));

// Body parsers - AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.status(HTTPSTATUS.OK).json({
    message: "Monkey API Running",
    status: "healthy",
    version: "1.0.0",
  });
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticationJWT, userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAuthenticationJWT, workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAuthenticationJWT, memberRoutes);
app.use(`${BASE_PATH}/project`, passportAuthenticationJWT, projectRoutes);
app.use(`${BASE_PATH}/task`, passportAuthenticationJWT, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server listening on port ${config.PORT} in ${config.NODE_ENV} mode`,
  );
  await connectDatabase();
  await autoSeedRoles();
});
