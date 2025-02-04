import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Project document
interface IUser extends Document {
    projectId: string;
    name: string;
    projectName: string;
    email: string;
    password: string;
    project: [string]
}

// Define the schema for the Project model
const userSchema = new Schema<IUser>({
    name: { type: String },
    projectName: { type: String },
    email: { type: String },
    password: { type: String },
    project: { type: [String] }
}, { timestamps: true });

// Create the Project model
const User = mongoose.model<IUser>('Project', userSchema);

export default User;