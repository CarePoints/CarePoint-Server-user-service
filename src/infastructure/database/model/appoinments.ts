import mongoose, { Schema, Document } from 'mongoose';

// Define the Doctor interface (embedded subdocument)
export interface IDoctor {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  profilePic?: string;
  consultationTypes?: string[];
  onCallAvailability?: string;
}

// Define the Appointment interface
export interface IAppointment extends Document {
  userId: string;
  doctor: IDoctor; // Embedding doctor details directly
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  reason?: string; 
  createdAt: Date;
  updatedAt: Date;
}

// Define the embedded Doctor schema
const DoctorSchema: Schema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  specialization: { type: String },
  yearsOfExperience: { type: Number },
  profilePic: { type: String },
  consultationTypes: [{ type: String }],
  onCallAvailability: { type: String },
});

// Define the Appointment schema
const AppointmentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: DoctorSchema,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'canceled', 'completed'],
      default: 'pending',
    },
    // reason: {
    //   type: String,
    // },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt` fields
  }
);

// Create the Appointment model
const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
