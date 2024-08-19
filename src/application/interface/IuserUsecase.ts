import { returnUser } from "../../domain/entities/returnUser";
import { registerUser } from "../../domain/entities/signUpUser";
import {UserDocument} from '../../infastructure/database/model/userModel'

export interface UserLogin{
    token: string;
    userDoc: UserDocument;
}

export interface IuserUsecase {
    userExists(email:string): Promise<returnUser | null>;
    registerUser(values:registerUser): Promise<returnUser|null> 
    otpVerification(otp:string): Promise<returnUser|null> 
    loginVerfication(email:string,password:string): Promise<UserLogin| null>
    getUser(userId:any): Promise<UserDocument|null>
    refreshTokenUsecase(oldToken:string): Promise<UserLogin| null>
    emailVerification(email:string): Promise<registerUser| null>
    forgotOtp(otp:string,email:string): Promise<returnUser|null>
    isBlock(email:string,isBlocked:boolean): Promise<returnUser|null>
  
}