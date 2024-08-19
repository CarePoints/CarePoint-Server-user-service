export interface registerUser {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phonenumber: number;
  otp?:number;
  createdAt?: Date;
  _id?:string
}
