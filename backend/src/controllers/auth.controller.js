const { asyncHandler } = require("../middlewares/asyncHandler.middleware");
const { config } = require("../config/app.config");
const { registerSchema } = require("../validation/auth.validation");
const { HTTPSTATUS } = require("../config/http.config");
const { registerUserService } = require("../services/auth.service");
const passport = require("passport");
const { signJwtToken } = require("../utils/jwt");

const googleLoginCallback = asyncHandler(async (req, res) => {
  const jwt = req.jwt;
  const currentWorkspace = req.user?.currentWorkspace;

  if (!jwt) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
    );
  }

  return res.redirect(
    `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}`,
  );
});

const registerUserController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse({ ...req.body });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User registered successfully",
  });
});

const loginController = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: info?.message || "Invalid email and password",
      });
    }

    const access_token = signJwtToken({ userId: user._id });

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged in successfully",
      access_token,
      user,
    });
  })(req, res, next);
});

const logOutController = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error: ", err);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Logout failed",
        error: "Failed to logout",
      });
    }
  });

  req.session = null;

  return res.status(HTTPSTATUS.OK).json({
    message: "Logged out successfully",
  });
});

module.exports = {
  googleLoginCallback,
  registerUserController,
  loginController,
  logOutController,
};
