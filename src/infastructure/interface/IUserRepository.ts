import { registerUser } from '../../domain/entities/signUpUser';
import { IAppointment, IDoctor } from '../database/model/appoinments';
import { IMedicine } from '../database/model/medicines';
import { Address, IOrder } from '../database/model/orderSchema';
import {UserDocument} from '../database/model/userModel';

export interface UserLoginResponse {
    token?: string;
    userDoc?: UserDocument;
    error?: string;
  }
export interface IUserRepository {
    findUserExists(email:string): Promise<UserDocument | null>;
    saveNewUser(values:registerUser): Promise<UserDocument| null>
    otpVerify(otp:any): Promise<UserDocument|null> 
    userLogin(email:string,password:string): Promise<UserLoginResponse | null>
    getUserById(userId:string): Promise<UserDocument | null>
    refreashToken(token: string): Promise<any | null>;
    emailVerify(email:string): Promise<any|null>
    forgotOtpVerify(otp:string,email:string) : Promise<UserDocument|null>
    isBlockDb(email:string,isBlocked:boolean) : Promise<UserDocument|null>
    passwordReseted(email:string, password:string): Promise<Boolean| null>
    savingAppoinmentsDB(selectedDoctor:IDoctor,Date:string,Time:string,user:IAppointment,appointmentType:string): Promise<Boolean | any | null>
    getBookedDoctors(): Promise<any|null>
    cancelBookingRepo(cancelDoctor:string): Promise<any | null>
    appointmentAcceptedRepo(doctorEmail:string,userEmail:string): Promise<boolean| null>
    appointmentRejected(doctorEmail:string,userEmail:string): Promise<boolean| null>
    addMedicines(file:any,productData:any): Promise<void| null>
    medicinesRepo(): Promise<any| null>
    addToCartRepo(userId:string,medicineId:string): Promise<any| null>
    getCartProductsRepo(userId:string): Promise<any| null>
    updateQuantityRepo(userId:string,productId:string,quantity:string): Promise<any| null>
    removeItemRepo(productId:string): Promise<any| null>
    cartProductsRepo(userId:string): Promise<any| null> 
    productsOrdersRepo(userID:string,cartItems:IOrder[],formData:Address): Promise<any| null>
    orderDataRepo(userId:string): Promise<any| null> 
    getAdminOrderDataRepo(): Promise<any| null> 
    updateStatusRepo(orderId:string,status:string): Promise<any | null>
    deleteOrderRepo(orderId:string): Promise<any | null>
    orderCancelRepo(orderId:string): Promise<any | null>
}