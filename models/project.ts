import mongoose, { Document, Schema } from 'mongoose';
// Interface for the Project document
interface IProject extends Document {
    projectId: string;
    userId: string;
    folders: string[];
    files: { name: string; content: string; folder?: string }[];
    projectName: string
    email: string
}
// Define the schema for the Project model
const projectSchema = new Schema<IProject>({
    projectId: { type: String, sparse: true, unique: true },
    userId: { type: String },
    folders: { type: [String], default: [] },
    projectName: { type: String },
    email: { type: String },
    files: [
        {
            name: { type: String, required: true },
            content: { type: String, required: true },
            folder: { type: String, default: '' },
        },
    ],
}, { timestamps: true });
// Create the Project model
const Project = mongoose.models.Project || mongoose.model<IProject>('ProjectData', projectSchema);
export default Project;