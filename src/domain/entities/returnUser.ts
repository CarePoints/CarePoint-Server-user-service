import mongoose, { Schema, Document } from 'mongoose';

export interface returnUser {
    firstname:string,
    lastname:string,
    email:string,
    isBlocked: boolean;
    isVerified?: boolean;
    verificationToken?: string;
    roles?:string;
    profilePic?: string | null;
    
}