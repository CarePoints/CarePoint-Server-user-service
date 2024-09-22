import mongoose, { Schema, Document, Types } from "mongoose";



export interface Address {
  name: string;
  country: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface IOrder extends Document {
  userid: string;
  products: {
    productid: string; 
    productName: string;
    quantity: number;
    price: number;
    status: string; 
  }; 
  totalQuantity: number;
  totalPrice: number;
  address: Address;
  paymentMethod: string;
  orderDate: Date;
  status?: string; 
}

const orderSchema: Schema = new mongoose.Schema({
  userid: { type: String, required: true },
  products: [
    {
      productid: { type: mongoose.Schema.Types.ObjectId, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      status: { type: String, default: "Pending" }, 
    },
  ],
  totalQuantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  address: {
    userName: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" }, // Added status to the order
});

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
