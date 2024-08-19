import { NextFunction, Request, Response } from "express";
import { IuserUsecase } from "../../application/interface/IuserUsecase";

export class UserController {
  private userUsecase: IuserUsecase;
  constructor(userUsecase: IuserUsecase) {
    this.userUsecase = userUsecase;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    console.log("Contoller");

    const { firstname, lastname, email, password, phonenumber, role } =
      req.body;
    const values = { firstname, lastname, email, password, phonenumber, role };
    console.log("values.email", email);

    const existingUser = await this.userUsecase.userExists(email);

    if (existingUser) {
      console.log("existesing ");
      const response = await this.userUsecase.registerUser(values);
      return res.status(200).json({ message: response });
    } else {
      const response = await this.userUsecase.registerUser(values);
      console.log("responsedkfjkfbhfkjgbhfjk", response);

      return res.status(200).json({ message: response });
    }
  }
  async otpConfirm(req: Request, res: Response, next: NextFunction) {
    console.log("Otp Controller working");

    let values = req.body;
    const user = await this.userUsecase.otpVerification(values);
    console.log("user is avbaaa", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired Otp " });
    }
    return res
      .status(200)
      .json({ message: "Otp Verification Successfully", user });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    console.log("login is working");
    const { email, password } = req.body;

    try {
      const result = await this.userUsecase.loginVerfication(email, password);
      console.log("User data:", result);

      if (result) {
        res.status(200).json({ user: result.userDoc, token: result.token });
      } else {
        res.status(401).json({ message: "User is not exits" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // async googleCallback(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     // Check if the user is authenticated
  //     if (req.user) {
  //       // Set user details in a cookie
  //       res.cookie("user", JSON.stringify(req.user));

  //       // Redirect to the desired React route
  //       res.redirect("http://localhost:3000/user/Home"); // Adjust the URL as needed
  //     } else {
  //       // If authentication fails, redirect to login or error page
  //       res.redirect("http://localhost:3000/login"); // Adjust the URL as needed
  //     }
  //   } catch (error) {
  //     // Handle errors
  //     console.error("Error during Google callback:", error);
  //     res.redirect("http://localhost:3000/error"); // Redirect to an error page
  //   }
  // }

  async getUserID(req: Request, res: Response, next: NextFunction) {
    const userId = req.usersData?.id;

    if (!userId) {
      return res.status(404).json({ message: "User ID not found" });
    }
    // Replace with actual logic to get user
    const result = await this.userUsecase.getUser(userId);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result });
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    console.log("login is working");
    const { oldToken } = req.body;
    const result = await this.userUsecase.refreshTokenUsecase(oldToken);

    if (result) {
      console.log("refresh token is workkingggggggggggg", result);

      res.status(200).json({ user: result.userDoc, token: result.token });
    } else {
      res.status(401).json({ message: "User is not exits" });
    }
  }

  async checkEmail(req: Request, res: Response, next: NextFunction) {
    let { email } = req.body.email;
    console.log("eemail isssssssssss", email);
    const result = await this.userUsecase.emailVerification(email);
    console.log("ree", result);

    if (!result) {
      return res.status(400).json({ message: "User not found" });
    }

    const response = await this.userUsecase.registerUser(result);
    console.log("response", response);
    return res.status(200).json({ message: "Otp send successfully" });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    console.log("eeeee", req.body);
    const { otp, email } = req.body;
    const user = await this.userUsecase.forgotOtp(otp, email);
    console.log("user", user);
    if (!user) {
      return res.status(400).json({ message: "Otp is not correct" });
    }
    return res.status(200).json({ message: "Otp is correct" });
  }
  async isBlock(req: Request, res: Response) {
    console.log("eeeee", req.body);
    const { email, isBlocked } = req.body;
    console.log("eeeeeaaa", isBlocked);

    const user = await this.userUsecase.isBlock(email, isBlocked);

    if (!user) {
      return res.status(400).json({ message: "Block failed" });
    }
    return res.status(200).json({ message: "Block Changed" });
  }
}
