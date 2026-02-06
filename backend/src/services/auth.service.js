const mongoose = require("mongoose");
const { Roles } = require("../enums/role.enum");
const AccountModel = require("../models/account.model");
const MemberModel = require("../models/member.model");
const RoleModel = require("../models/roles-permission.model");
const UserModel = require("../models/user.model");
const WorkspaceModel = require("../models/workspace.model");
const {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} = require("../utils/appError");
const { ProviderEnum } = require("../enums/account-provider.enum");

const loginOrCreateAccountService = async (data) => {
  const { provider, displayName, providerId, picture, email } = data;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log("Started Session....");

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider,
        providerId,
      });
      await account.save({ session });

      const workspace = new WorkspaceModel({
        name: "My Workspace",
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(
        session,
      );
      if (!ownerRole) {
        throw new Error("Owner role not found");
      }

      const memeber = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await memeber.save({ session });

      user.currentWorkspace = workspace._id;
      await user.save({ session });
    }
    await session.commitTransaction();
    session.endSession();
    console.log("End session...");
    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const registerUserService = async (body) => {
  const { email, name, password } = body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }
    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    const workspace = new WorkspaceModel({
      name: "My Workspace",
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });
    await workspace.save({ session });

    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER }).session(
      session,
    );
    if (!ownerRole) {
      throw new Error("Owner role not found");
    }
    const memeber = new MemberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await memeber.save({ session });

    user.currentWorkspace = workspace._id;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    return { userId: user._id, workspaceId: workspace._id };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new BadRequestException("Invalid email or password");
  }
  const user = await UserModel.findById(account.userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid email or password");
  }
  return user.omitPassword();
};

const findUserById = async (userId) => {
  const user = await UserModel.findById(userId, {
    password: false,
  });
  return user || null;
};

module.exports = {
  loginOrCreateAccountService,
  registerUserService,
  verifyUserService,
  findUserById,
};
