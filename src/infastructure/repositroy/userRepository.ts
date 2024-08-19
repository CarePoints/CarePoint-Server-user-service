import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../../utils/authUtlis";
import { hashPassword } from "../../utils/passwordUtils";
import { registerUser } from "../../domain/entities/signUpUser";
import { User } from "../database/model/userModel";
import { IUserRepository } from "../interface/IUserRepository";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export class UserRepository implements IUserRepository {
  async findUserExists(email: string) {
    const user = await User.findOne({ email });
    return user;
  }
  async saveNewUser(values: registerUser) {
    try {
      const {
        firstname,
        lastname,
        email,
        password,
        phonenumber,
        otp,
        createdAt,
      } = values;

      console.log("Received values:", values);
      let hashedPass;

      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (firstname && lastname && password && phonenumber) {
          hashedPass = await hashPassword(password);
          const stringMobile = phonenumber.toString();
          existingUser.firstname = firstname;
          existingUser.lastname = lastname;
          existingUser.password = hashedPass;
          existingUser.phonenumber = stringMobile;
        }
        existingUser.otp = otp;
        existingUser.createdAt = createdAt;

        await existingUser.save();
        console.log("Updated existing user with new details:", existingUser);
        return existingUser;
      } else {
        hashedPass = await hashPassword(password);
        const newUser = new User({
          firstname,
          lastname,
          email,
          password: hashedPass,
          phonenumber,
          isVerified: false,
          otp,
          createdAt,
        });

        console.log("Created new user:", newUser);
        await newUser.save();
        return newUser;
      }
    } catch (error) {
      console.error("Error saving user:", error);
      return null;
    }
  }

  async otpVerify(otp: any) {
    const otpObject = otp;
    const otpString = otpObject.otp;
    let otpNumber = parseInt(otpString, 10);
    console.log("Otp repositroy working", otpNumber);
    const user = await User.findOne({ otp: otpNumber });
    console.log("otp userdate is", user);

    if (user && user.createdAt) {
      const createdAt = new Date(user.createdAt);
      const newTime = new Date();
      const timeDifference = newTime.getTime() - createdAt.getTime();
      const difference = Math.floor(timeDifference / (1000 * 60));

      if (difference > 1) {
        return null;
      }
      user.isVerified = true;
      user.otp = 0;
      await user.save();
      console.log("final user is", user);

      return user ? user : null;
    } else {
      return null;
    }
}

  async userLogin(email: string, password: string) {
    try {
      const userDoc = await User.findOne({ email });

      if (!userDoc) {
        return null;
      }

      if (!userDoc.password) {
        return null;
      }
      let hashedPass = userDoc.password;
      const isMatch = await bcrypt.compare(password, hashedPass);

      if (!isMatch) {
        return null;
      }

      // if(userDoc.isBlocked){
      //   console.log('user is blocked');
      //   return null;
      // }

      const user = {
        _id: userDoc._id,
        email: userDoc.email,
        roles: userDoc.roles,
      };
      const token = generateToken(user);
      return { token, userDoc };
    } catch (err) {
      console.log("error", err);
    }
    return null;
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }
    return user;
  }
  async refreashToken(oldToken: string) {
    const decodedToken = verifyToken(oldToken);
    if (typeof decodedToken !== "string" && decodedToken.id) {
      const existingUser = await User.findById(decodedToken.id);
      if (!existingUser) {
        throw new Error("user not found");
      }
      const newToken = generateRefreshToken(existingUser);
      return newToken;
    } else {
      throw new Error("Invalid token payload");
    }
  }

  async emailVerify(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      phonenumber: user.phonenumber,
      otp: user.otp,
      createdAt: user.createdAt,
    };

    return userData;
  }

  async forgotOtpVerify(otp: string, email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }

    const otpNumber = parseInt(otp, 10);

    if (isNaN(otpNumber) || user.otp === undefined) {
      return null;
    }

    if (user.otp === otpNumber) {
      return user;
    }

    return null;
  }
  async isBlockDb(email: string, isBlocked: boolean) {
    const user = await User.findOne({ email });
    console.log("sucess ", user);

    if (!user) {
      return null;
    }
    user.isBlocked = isBlocked;
    await user.save();
    console.log("last", user);

    return user;
  }
}
