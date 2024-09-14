import { Document } from 'mongoose';

// Define the interface for the Medicine document
export interface IMedicine extends Document {
  name: string;
  category: string;
  price: number;
  stock: number;
  dosage: string;
  expiryDate: Date;
  sideEffects: string;
  productImage?: string; // Optional field
}

// Define the Mongoose schema
import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  sideEffects: {
    type: String,
    required: true
  },
  productImage: {
    type: String, 
    required: false
  }
});

// Create the model
const Medicine = mongoose.model<IMedicine>('Medicine', medicineSchema);

export default Medicine;
