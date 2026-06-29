import mongoose from "mongoose";

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
    throw new Error(
        "CONNECTION_STRING is not defined in the environment variables",
    );
}

mongoose
    .connect(connectionString)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

export default mongoose.connection;
