import { NextFunction, Request, Response } from "express";
import { IuserUsecase } from "../../application/interface/IuserUsecase";
import { generateToken } from "../../utils/authUtlis";
import Razorpay from "razorpay";
import Tesseract from "tesseract.js";
import { error, info } from "console";
import { text } from "stream/consumers";

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
      console.log('jjjjjjjj',userData)
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
  async cancelBooking(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body);
      const { cancelDoctor } = req.body;
  
      if (!cancelDoctor) {
        return res.status(400).json({ message: 'Cancel doctor information is missing' });
      }
  
      const result = await this.userUsecase.cancelBooking(cancelDoctor);
  
      return res.status(200).json({ message: 'Success', result });
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async appointmentAccepted(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body);
      const { doctorEmail,userEmail } = req.body;
  
      if (!doctorEmail) {
        return res.status(400).json({ message: 'doctorEmail is missing' });
      }
      if (!userEmail) {
        return res.status(400).json({ message: 'userId is missing' });
      }
  
      const result = await this.userUsecase.appointmentAccepted(doctorEmail,userEmail);
  
      return res.status(200).json({ message: 'Success', result });
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async appointmentRejected(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body);
      const { doctorEmail,userEmail } = req.body;
  
      if (!doctorEmail) {
        return res.status(400).json({ message: 'doctorEmail is missing' });
      }
      if (!userEmail) {
        return res.status(400).json({ message: 'userId is missing' });
      }
  
      const result = await this.userUsecase.appointmentRejected(doctorEmail,userEmail);
  
      return res.status(200).json({ message: 'Success', result });
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  
  async medicines(req: Request, res: Response) {
    try {
     const medicines = await this.userUsecase.medicines()
      return res.status(200).json({ message: 'Success',result:medicines });
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async addToCart(req: Request, res: Response) {
    try {
      console.log('addToCart',req.body)
      const {userId,medicineId} = req.body;
       const medicines = await this.userUsecase.addToCart(userId,medicineId)

      return res.status(200).json({ message: 'Success',medicines });
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async getCartProducts(req: Request, res: Response) {
    try {
      console.log('getCartProducts')
      let {user} = req.body;
      const parseUser = JSON.parse(user)
      let userId = parseUser._id
       const medicines = await this.userUsecase.getCartProducts(userId)

      return res.status(200).json({ message: 'Success',medicines});
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async updateQuantity(req: Request, res: Response) {
    try {
      console.log('updateQuantity2')
      let {userId,productId,quantity} = req.body;

       const medicines = await this.userUsecase.updateQuantity(userId,productId, quantity)
       if(!medicines){
        return res.status(404).json({message: "Item not found"})
       }

      return res.status(200).json({ message: 'Success',medicines});
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async removeItem(req: Request, res: Response) {
    try {
      let {productId} = req.body;
      console.log('removeItem',productId)

       const medicines = await this.userUsecase.removeItem(productId)
       if(!medicines){
        return res.status(404).json({message: "Item not found"})
       }

      return res.status(200).json({ message: 'Success',medicines});
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async cartProducts(req: Request, res: Response) {
    try {
      let {userID} = req.body;
      console.log('userID',userID)

       const medicines = await this.userUsecase.cartProducts(userID)
       if(!medicines){
        return res.status(404).json({message: "Item not found in controller"})
       }

      return res.status(200).json({ message: 'Success', medicines});
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }
  async productsOrders(req: Request, res: Response) {
    try {
      let {userID,cartItems,formData} = req.body;

       const orderData = await this.userUsecase.productsOrders(userID,cartItems,formData)
       if(!orderData){
        return res.status(404).json({message: "Item not found in controller"})
       }

      return res.status(200).json({ message: 'Success', orderData});
    } catch (error) {
      console.log('Error:', error);
      return res.status(500).json({ message: 'An error occurred', error });
    }
  }


  

  async prescription(req:Request, res:Response) {
    const { photo } = req.body; // Get the Base64 image data from the request body

  if (!photo) {
    return res.status(400).send('No image data received');
  }

  // Extract the base64 image part (remove the data:image/png;base64, part)
  const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');

  // Buffer the image data
  const imageBuffer = Buffer.from(base64Data, 'base64');

  try {
    // Use Tesseract to recognize the text in the image
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: (info) => console.log(info), // Optional logger
    });

    console.log('Extracted text:', text);

    // Send the extracted text as a response
    return res.status(200).json({ extractedText: text });
  } catch (error) {
    console.error('Error during OCR:', error);
    return res.status(500).send('Error during OCR processing');
  }
  }
  
}
