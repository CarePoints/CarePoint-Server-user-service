import mongoose from "mongoose";
// mongodb+srv://user-service:user-service@cluster0.loo8dpj.mongodb.net/

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect("mongodb+srv://user-service:user-service@cluster0.loo8dpj.mongodb.net/", {
      dbName: "user-service",
    });
    console.log("databse connected sucessfully");
  } catch (error) {
    console.log(error);
  }
};

export default connectDatabase;