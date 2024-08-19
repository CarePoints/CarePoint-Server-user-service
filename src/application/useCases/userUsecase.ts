import { generateOtpWithTime } from "../../utils/generateOtp";
import otpSending from "../../utils/otpSending";
import { registerUser } from "../../domain/entities/signUpUser";
import { IUserRepository } from "../../infastructure/interface/IUserRepository";
import { IuserUsecase } from "../interface/IuserUsecase";


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
    console.log("userdaaaaaaaa", userData);

    return userData ? userData : null;
  }
  async loginVerfication(email: string, password: string) {
    console.log("Login verification on usecase", email);
    const checkUser = await this.repository.userLogin(email, password);
    if (!checkUser) {
      return null;
    }
    console.log("checkUser",checkUser);
    
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
    if(!checkToken){
        return null
    }else{
        console.log('refresh token creaedd usecase');
        
        return checkToken
    }
  }

  async emailVerification(email:string){
    const user = await this.repository.emailVerify(email);
    if(!user){
      return null
    }
    return user
  }

  async forgotOtp(otp:string,email:string){
    console.log('otp',otp,'email',email);
    const checking = await this.repository.forgotOtpVerify(otp,email);
    console.log('user issss',checking);
    if(checking){
      return checking
    }
    
    return null
  }
  async isBlock(email:string,isBlocked:boolean){

    const checking = await this.repository.isBlockDb(email,isBlocked);
    console.log('user issss',checking);
   return checking ? checking : null
  }

}
