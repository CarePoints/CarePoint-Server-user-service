import { generateOtpWithTime } from "../../utils/generateOtp";
import otpSending from "../../utils/otpSending";
import { registerUser } from "../../domain/entities/signUpUser";
import { IUserRepository } from "../../infastructure/interface/IUserRepository";
import { IuserUsecase } from "../interface/IuserUsecase";
import { publishMessage } from "../../infastructure/rabitMQ/producer";
import { generateToken } from "../../utils/authUtlis";
import { IAppointment, IDoctor } from "../../infastructure/database/model/appoinments";
import { publishMessageForAppoinment } from "../../infastructure/rabitMQ/appoinmentProducer";
import { Address, IOrder } from "../../infastructure/database/model/orderSchema";

export class UserUsecase implements IuserUsecase {
  private repository: IUserRepository;
  constructor(repository: IUserRepository) {
    this.repository = repository;
  }
  async userExists(email: string) {
    const user = await this.repository.findUserExists(email);
    console.log("user is ", user);

    return user ? user : null;
  }
  async registerUser(values: registerUser) {
    const { otp, creationTime } = generateOtpWithTime();
    values.otp = otp;
    values.createdAt = creationTime;
    if (!values.firstname) {
      const user = await this.repository.saveNewUser(values);
    }
    const user = await this.repository.saveNewUser(values);
    console.log("Chenking");

    otpSending(values.email, otp);
    return user ? user : null;
  }
  async otpVerification(otp: string) {
    console.log("Otp useCase working", otp);

    const userData = await this.repository.otpVerify(otp);
    publishMessage(userData);
    return userData ? userData : null;
  }
  async loginVerfication(email: string, password: string) {
    const checkUser = await this.repository.userLogin(email, password);
    if (!checkUser) {
      return null;
    }
    return checkUser;
  }

  async getUser(userId: string) {
    const userData = await this.repository.getUserById(userId);
    if (!userData) {
      return null;
    }
    return userData;
  }

  async refreshTokenUsecase(oldToken: string) {
    if (!oldToken) {
      return null;
    }
    const checkToken = await this.repository.refreashToken(oldToken);
    if (!checkToken) {
      return null;
    } else {
      console.log("refresh token creaedd usecase");

      return checkToken;
    }
  }

  async emailVerification(email: string) {
    const user = await this.repository.emailVerify(email);
    if (!user) {
      return null;
    }
    return user;
  }

  async forgotOtp(otp: string, email: string) {
    const checking = await this.repository.forgotOtpVerify(otp, email);
    if (checking) {
      return checking;
    }

    return null;
  }
  // async isBlock(email:string,isBlocked:boolean){

  //   const checking = await this.repository.isBlockDb(email,isBlocked);
  //   console.log('user issss',checking);
  //  return checking ? checking : null
  // }

  async resetingPassword(email: string, password: string) {
    const result = await this.repository.passwordReseted(email, password);
    if (!result) {
      return false;
    }
    return true;
  }

  async googleRetriveData(user:any){
    console.log('userewrwe',user);
    publishMessage(user)
    if(user){
      let {_id,email} = user
      let token = generateToken({_id,email})
      console.log('tokenfdsafsafdas',token);
      
      return token
    }
  }

  async savingAppoinments(selectedDoctor:IDoctor,Date:string,Time:string,user:IAppointment,appointmentType:string){
    console.log('user real user is', user)
    const result = await this.repository.savingAppoinmentsDB(selectedDoctor,Date,Time,user,appointmentType);
    publishMessageForAppoinment(selectedDoctor,Date,Time,user,appointmentType)
    if(!result){
      return false
    }
    return result
  }
  async findBookedDoctors(){
    const result = await this.repository.getBookedDoctors();
    return result
  }

  async cancelBooking(cancelDoctor:string){
    const result = await this.repository.cancelBookingRepo(cancelDoctor)
    return null
  }
  async appointmentAccepted(doctorEmail:string,userEmail:string){
    const result = await this.repository.appointmentAcceptedRepo(doctorEmail,userEmail)
    if(!result){
      return false
    }
    return true
  }
  async appointmentRejected(doctorEmail:string,userEmail:string){
    const result = await this.repository.appointmentRejected(doctorEmail,userEmail)
    if(!result){
      return false
    }
    return true
  }
  async medicines(){
    const result = await this.repository.medicinesRepo()
    if(!result){
      return null
    }
    return result
  }
  async addToCart(userId:string,medicineId:string){
    const result = await this.repository.addToCartRepo(userId,medicineId)
    if(!result){
      return null
    }
    return result
  }
  async getCartProducts(userId:string){
    const result = await this.repository.getCartProductsRepo(userId)
    if(!result){
      return null
    }
    return result
  }
  async updateQuantity(userId:string,productId:string,quantity:string){
    const result = await this.repository.updateQuantityRepo(userId,productId,quantity)
    if(!result){
      return null
    }
    return result
  }

  async removeItem(productId:string){
    console.log('removeItem',productId);
    const result = await this.repository.removeItemRepo(productId)
    if(!result){
      return null
    }
    return result
  }
  async cartProducts(userId:string){
    const result = await this.repository.cartProductsRepo(userId)
    if(!result){
      return null
    }
    return result
  }
  async productsOrders(userID:string,cartItems:IOrder[],formData:Address){
    const result = await this.repository.productsOrdersRepo(userID,cartItems,formData)
    if(!result){
      return null
    }
    return result
  }

}
