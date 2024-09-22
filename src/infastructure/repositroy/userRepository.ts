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
import Order, { Address, IOrder } from "../database/model/orderSchema";
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

  async getCartProductsRepo(userId: string) {
    const result = await cartCollection.find({ userid: userId });
    if (!result) {
      return null;
    }
    return result;
  }
  async updateQuantityRepo(
    userId: string,
    productId: string,
    quantity: string
  ) {
    // const result = await cartCollection.find({userid:userId})
    console.log("userId is", userId);
    console.log("productId is", productId);
    console.log("quantity is", quantity);
    const result = await cartCollection.findOne({
      userid: userId,
      productid: productId,
    });
    if (result) {
      result.quantity = Number(quantity);
      const price = result.price;
      let totalAmount = price * Number(quantity);
      result.totalPrice = totalAmount;
      await result.save();
      return result;
    }
    return null;
  }
  async removeItemRepo(productId: string) {
    try {
      console.log("productId is", productId);

      const result = await cartCollection.findOneAndDelete({ _id: productId });

      if (result) {
        console.log("Item successfully deleted:", result);
        return result;
      } else {
        console.log("Item not found for deletion");
        return null;
      }
    } catch (error) {
      console.error("Error while deleting item:", error);
      return null;
    }
  }
  async cartProductsRepo(userId: string) {
    try {

      const result = await cartCollection.find({ userid: userId });

      if (result) {
        return result;
      } else {
        console.log("Item not found");
        return null;
      }
    } catch (error) {
      console.error("Error while deleting item:", error);
      return null;
    }
  }
  // async productsOrdersRepo(userID: string, cartItems: any, formData: Address) {
  //   try {
  //     // Check if any of the products in the cart already exist in the user's orders
  //     const existingOrder = await Order.findOne({
  //       userid: userID,
  //       "products.productid": { $in: cartItems.map((item: any) => item.productid) }
  //     });
  
  //     if (!existingOrder) {
  //       const totalPrice = cartItems.reduce(
  //         (sum: any, item: any) => sum + item.totalPrice,
  //         0
  //       );
  
  //       const totalQuantity = cartItems.reduce(
  //         (sum: any, item: any) => sum + item.quantity,
  //         0
  //       );
  
  //       const cartData = cartItems.map((item: any) => ({
  //         productid: item.productid,
  //         productName: item.productName,
  //         quantity: item.quantity,
  //         price: item.price,
  //         status: item.status || "Pending",
  //       }));
  
  //       console.log("cartData", cartData);
  
  //       const newOrder = new Order({
  //         userid: userID,
  //         products: cartData,
  //         totalQuantity: totalQuantity,
  //         totalPrice: totalPrice,
  //         address: {
  //           userName: formData.name,
  //           country: formData.country,
  //           address: formData.address,
  //           city: formData.city,
  //           zipCode: formData.zipCode,
  //         },
  //         paymentMethod: "Credit Card",
  //       });
  
  //       await newOrder.save();
  //       console.log('Order saved');
  
  //       const result = await cartCollection.deleteMany({ userid: userID });
  //       console.log('Cart deleted', result);
  
  //       return newOrder;
  //     } else {
  //       console.log("Order with these products already exists for this user:", existingOrder);
  //       return existingOrder;
  //     }
  //   } catch (error) {
  //     console.error("Error while processing order:", error);
  //     return null;
  //   }
  // }

  async productsOrdersRepo(userID: string, cartItems: any, formData: Address) {
    const session = await mongoose.startSession();  // Start a transaction session
    session.startTransaction();  // Ensure atomicity for the operations
  
    try {
      // Calculate total price and quantity
      const totalPrice = cartItems.reduce(
        (sum: any, item: any) => sum + item.totalPrice,
        0
      );
  
      const totalQuantity = cartItems.reduce(
        (sum: any, item: any) => sum + item.quantity,
        0
      );
  
      // Prepare the cart data for the order
      const cartData = cartItems.map((item: any) => ({
        productid: item.productid,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        status: item.status || "Pending",
      }));
  
      console.log("cartData", cartData);
  
      // Create a new order
      const newOrder = new Order({
        userid: userID,
        products: cartData,
        totalQuantity: totalQuantity,
        totalPrice: totalPrice,
        address: {
          userName: formData.name,
          country: formData.country,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        paymentMethod: "Credit Card",
      });
  
      await newOrder.save({ session });  // Save the order within the transaction
      console.log('Order saved');
  
      // Delete the user's cart items after successful order creation
      await cartCollection.deleteMany({ userid: userID }, { session });
      console.log('Cart deleted');
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      return newOrder;
  
    } catch (error) {
      console.error("Error while processing order:", error);
  
      // Rollback the transaction in case of error
      await session.abortTransaction();
      session.endSession();
  
      return null;
    }
  }
  
  
}
