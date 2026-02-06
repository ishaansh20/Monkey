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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get(
  "/",
  asyncHandler(async (req, res, next) => {
    res.send("working...");
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN,
    );
    return res.status(HTTPSTATUS.OK).json({ message: "Backend Running" });
  }),
);

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
