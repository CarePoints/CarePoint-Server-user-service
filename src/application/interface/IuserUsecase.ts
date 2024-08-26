import { returnUser } from "../../domain/entities/returnUser";
import { registerUser } from "../../domain/entities/signUpUser";
import { IAppointment, IDoctor } from "../../infastructure/database/model/appoinments";
import {UserDocument} from '../../infastructure/database/model/userModel'

export interface UserLogin{
    token?: string;
    userDoc?: UserDocument;
    error?: string;
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
    // isBlock(email:string,isBlocked:boolean): Promise<returnUser|null>
    resetingPassword(email:string,password:string): Promise<Boolean | null>
    googleRetriveData(user:any): Promise<any|null>
    savingAppoinments(selectedDoctor:IDoctor,Date:string,Time:string,user:IAppointment,appointmentType:string): Promise<any|null>
    findBookedDoctors(): Promise<any>
}