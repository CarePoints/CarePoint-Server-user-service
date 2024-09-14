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
import { AppError } from "../../middleware/errorMiddleware";
import Appointment, {
  IAppointment,
  IDoctor,
} from "../database/model/appoinments";
import Medicine, { IMedicine } from "../database/model/medicines";
import cartCollection from "../database/model/cart";
import products from "razorpay/dist/types/products";

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
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }

  async otpVerify(otp: any) {
    try {
      const otpObject = otp;
      const otpString = otpObject.otp;
      let otpNumber = parseInt(otpString, 10);
      const user = await User.findOne({ otp: otpNumber });

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
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }

  async userLogin(email: string, password: string) {
    try {
      const userDoc = await User.findOne({ email });

      if (!userDoc) {
        return { error: "Email is not found" };
      }

      if (!userDoc.password) {
        return { error: "No password set for this user" };
      }
      let hashedPass = userDoc.password;
      const isMatch = await bcrypt.compare(password, hashedPass);

      if (!isMatch) {
        return { error: "Invalid password" };
      }
      const user = {
        _id: userDoc._id,
        email: userDoc.email,
        roles: userDoc.roles,
      };
      const token = generateToken(user);
      return { token, userDoc };
    } catch (err) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }
  async refreashToken(oldToken: string) {
    try {
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
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }

  async emailVerify(email: string) {
    try {
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
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }

  async forgotOtpVerify(otp: string, email: string) {
    try {
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
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }
  async isBlockDb(email: string, isBlocked: boolean) {
    try {
      const user = await User.findOne({ email });
      console.log("sucess ", isBlocked);

      if (!user) {
        return null;
      }
      user.isBlocked = isBlocked;
      await user.save();
      console.log("last", user);

      return user;
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }
  async passwordReseted(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return false;
      }

      let newPassword = await hashPassword(password);
      console.log("hashed pass", newPassword);

      user.password = newPassword;
      await user.save();
      console.log("3w34343", user);
      return true;
    } catch (error) {
      throw new AppError("Database error occurred while fetching user.", 500);
    }
  }
  async savingAppoinmentsDB(
    selectedDoctor: IDoctor,
    Date: string,
    Time: string,
    user: IAppointment,
    appointmentType: string
  ) {
    try {
      const newAppointment = new Appointment({
        userId: user._id,
        doctor: {
          firstname: selectedDoctor.firstname,
          lastname: selectedDoctor.lastname,
          email: selectedDoctor.email,
          phoneNumber: selectedDoctor.phoneNumber,
          profilePic: selectedDoctor.profilePic,
          specialization: selectedDoctor.specialization,
          yearsOfExperience: selectedDoctor.yearsOfExperience,
          consultationTypes: appointmentType,
          onCallAvailability: selectedDoctor.onCallAvailability,
        },
        date: Date,
        time: Time,
      });

      await newAppointment.save();
      if (!newAppointment) {
        return false;
      }
      return newAppointment;
    } catch (error) {
      console.error("Error saving appointment:", error);
      return false;
    }
  }
  async getBookedDoctors() {
    let result = await Appointment.find();
    if (!result) {
      return null;
    }
    return result;
  }
  async cancelBookingRepo(cancelDoctor: string) {
    try {
      console.log("Attempting to delete appointment for:", cancelDoctor);

      // Make sure the email field in the database matches the one used in the query
      let result = await Appointment.findOneAndDelete({
        "doctor.email": cancelDoctor,
      }).exec();

      if (result) {
        console.log("Appointment found: And Deleted", result);
      } else {
        console.log("No appointment found for this email.");
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error finding appointment:", error);
      throw new Error("Error finding appointment.");
    }
  }
  async appointmentAcceptedRepo(doctorEmail: string, userEmail: string) {
    try {
      // Fetch the appointment that matches both doctor email and userId
      const userData = await User.findOne({ email: userEmail });
      if (!userData) {
        return null;
      }
      let result = await Appointment.findOne({
        "doctor.email": doctorEmail,
        userId: userData._id,
      });

      console.log("Result:", result);

      // If no result is found, return false
      if (!result) {
        console.log("No appointment found matching the criteria.");
        return false;
      }

      // Update the status to 'confirmed'
      result.status = "confirmed";
      await result.save();

      return true;
    } catch (error) {
      console.error("Error finding appointment:", error);
      throw new Error("Error finding appointment.");
    }
  }

  async appointmentRejected(doctorEmail: string, userEmail: string) {
    try {
      // Fetch the appointment that matches both doctor email and userId
      const userData = await User.findOne({ email: userEmail });
      if (!userData) {
        return null;
      }
      let result = await Appointment.findOne({
        "doctor.email": doctorEmail,
        userId: userData._id,
      });

      console.log("Result:", result);

      // If no result is found, return false
      if (!result) {
        console.log("No appointment found matching the criteria.");
        return false;
      }

      // Update the status to 'confirmed'
      result.status = "canceled";
      await result.save();

      return true;
    } catch (error) {
      console.error("Error finding appointment:", error);
      throw new Error("Error finding appointment.");
    }
  }

  async addMedicines(file: any, productData: any) {
    console.log("productData is", productData, "file is", file);
    const addMedicines = new Medicine({
      name: productData.name,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      dosage: productData.dosage,
      expiryDate: productData.expiryDate,
      sideEffects: productData.sideEffects,
      productName: productData.productName,
      productImage: file.location,
    });

    await addMedicines.save();
    console.log("addMedicines successs", addMedicines);
  }

  async medicinesRepo() {
    const result = await Medicine.find();
    console.log("get result is ", result);
    if (!result) return null;
    return result;
  }
  async addToCartRepo(userId: string, medicineId: string) {
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return null;
    }

    let cart = await cartCollection.findOne({
      userid: userId,
      productid: medicineId,
    });
    if (!cart) {
      const newCart = new cartCollection({
        userid: userId,
        productid: medicineId,
        productName: medicine.name,
        price: medicine.price,
        catogory: medicine.category,
        quantity: 1,
        dosage: medicine.dosage,
        image: medicine.productImage,
        expiryDate: medicine.expiryDate,
        sideEffects: medicine.sideEffects,
        totalPrice: medicine.price,
      });

      await newCart.save();

      console.log("cart is", newCart);
      console.log("medicine is", medicine);
    } else {
      console.log("cart is existing");
      cart.quantity++;
      await cart.save();
    }
  }

  async getCartProductsRepo(userId:string){
    const result = await cartCollection.find({userid:userId})
    console.log('respot is',result)
    if(!result){
      return null
    }
    return result
  }
}
