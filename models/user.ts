import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Project document
interface IProject extends Document {
    projectId: string;
    name: string;
    email: string;
    password: string;
    folders: string[];
    files: { name: string; content: string; folder?: string }[];
}

// Define the schema for the Project model
const projectSchema = new Schema<IProject>({
    projectId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    folders: { type: [String], default: [] },
    files: [
        {
            name: { type: String, required: true },
            content: { type: String, required: true },
            folder: { type: String, default: '' },
        },
    ],
}, { timestamps: true });

// Create the Project model
const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
