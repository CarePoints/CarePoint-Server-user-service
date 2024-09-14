import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICart extends Document {
    userid: string;
    productid: Types.ObjectId;
    productName: string;
    price: number;
    category?: string;
    quantity: number;
    dosage?: string;
    address?: {
        firstName?: string;
        lastName?: string;
        state?: string;
        address?: string;
        city?: string;
        zip?: string;
    };
    image?: string[];
    sideEffects?: string;
    expiryDate?: Date;
    status?: string;
    totalPrice: number;
}

const cartSchema = new Schema<ICart>({
    userid: {
        type: String,
        required: true
    },
    productid: {
        type: Schema.Types.ObjectId, 
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String
    },
    quantity: {
        type: Number,
        required: true
    },
    dosage: {
        type: String
    },
    address: {
        firstName: String,
        lastName: String,
        state: String,
        address: String,
        city: String,
        zip: String,
    },
    image: {
        type: [String]
    },
    sideEffects: {
        type: String
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        default: "Pending"
    },
    totalPrice: {
        type: Number,  // Changed to Number for totalPrice
        required: true
    }
});

const cartCollection = mongoose.model<ICart>('Cart', cartSchema);

export default cartCollection;
