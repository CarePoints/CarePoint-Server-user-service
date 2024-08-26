import { NextFunction, Request, Response } from "express";
import { IuserUsecase } from "../../application/interface/IuserUsecase";
import { generateToken } from "../../utils/authUtlis";
import Razorpay from "razorpay";

export class UserController {
  private userUsecase: IuserUsecase;
  constructor(userUsecase: IuserUsecase) {
    this.userUsecase = userUsecase;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstname, lastname, email, password, phonenumber, role } =
        req.body;
      const values = {
        firstname,
        lastname,
        email,
        password,
        phonenumber,
        role,
      };
      console.log("values.email", email);

      const existingUser = await this.userUsecase.userExists(email);

      if (existingUser) {
        console.log("existesing ");
        const response = await this.userUsecase.registerUser(values);
        return res.status(200).json({ message: response });
      } else {
        const response = await this.userUsecase.registerUser(values);
        return res.status(200).json({ message: response });
      }
    } catch (error) {
      next(error);
    }
  }

  async otpConfirm(req: Request, res: Response, next: NextFunction) {
    try {
      let values = req.body;
      const user = await this.userUsecase.otpVerification(values);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired Otp " });
      }
      return res
        .status(200)
        .json({ message: "Otp Verification Successfully", user });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.userUsecase.loginVerfication(email, password);
      console.log("User data:", result);

      if (result && "error" in result) {
        res.json({ error: result.error });
      } else if (result) {
        res.status(200).json({ user: result.userDoc, token: result.token });
      } else {
        res.status(400).json({ message: "Unexpected error occurred" });
      }
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Google callback is working');
      
      if (req.user) {
        let user = req.user
        const token = await this.userUsecase.googleRetriveData({user})

        const userData = encodeURIComponent(JSON.stringify(req.user));
        const tokenData = encodeURIComponent(JSON.stringify(token));
        res.redirect(`http://localhost:3000/login?user=${userData}&token=${tokenData}`);

      } else {
        res.redirect("http://localhost:3000/login");
      }
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.redirect("http://localhost:3000/error");
    }
  }
  

  // async handleGooglePassport(req: Request, res: Response){
  //   console.log('handlgeGOoggle parsoport is working',req.body);
    
  // }



  async getUserID(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldToken } = req.body;
      const result = await this.userUsecase.refreshTokenUsecase(oldToken);

      if (result) {
        res.status(200).json({ user: result.userDoc, token: result.token });
      } else {
        res.status(401).json({ message: "User is not exits" });
      }
    } catch (error) {
      next(error);
    }
  }

  async checkEmail(req: Request, res: Response, next: NextFunction) {
    try {
      let { email } = req.body.email;
      const result = await this.userUsecase.emailVerification(email);

      if (!result) {
        return res.status(400).json({ message: "User not found" });
      }

      const response = await this.userUsecase.registerUser(result);
      return res.status(200).json({ message: "Otp send successfully" });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { otp, email } = req.body;
      const user = await this.userUsecase.forgotOtp(otp, email);
      if (!user) {
        return res.status(400).json({ message: "Otp is not correct" });
      }
      return res.status(200).json({ message: "Otp is correct" });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.userUsecase.resetingPassword(email, password);
      if (!result) {
        return res
          .status(400)
          .json({ success: false, message: "Failed to reset password" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.log("reset password is failed", error);
    }
  }

  async appoinments(req:Request, res:Response){
    try{
      const {selectedDoctor,Date,Time,appointmentType,user} = req.body;
      let userData = JSON.parse( user)
      const result = await this.userUsecase.savingAppoinments(selectedDoctor,Date,Time,userData,appointmentType)
      if(!result){
        return res.status(400).json({message:'Appoinment failed'})
      }
      console.log('result',result);
      
      return res.status(200).json({message:'Appoinment sucess',result})
    }catch(error){
      console.log('error is',error);
    }
  }
  async razorpayPayments(req:Request, res:Response){
    try{
      let {amount} = req.body;
      console.log('amount',amount)
      var instance = new Razorpay({ key_id : process.env.KEY_ID as string, key_secret: process.env.KEY_SECRET as string})

      let order = await instance.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: "receipt#1"
      })
      res.status(200).json({success:true,order,amount})
    }catch(error){
      console.log('error is',error);
    }
  }
  async bookedDoctors(req:Request, res:Response){
    try{
      let result = await this.userUsecase.findBookedDoctors()
      
      return res.status(200).json({message:'succees', result})
    }catch(error){
      console.log('error is',error);
    }
  }
}
