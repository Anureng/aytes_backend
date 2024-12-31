import { Request, Response } from "express";
import Project from "../models/user";
import { v4 as uuidv4 } from "uuid";


const createProject = async (req: Request, res: Response): Promise<any> => {
    const uniqueProjectId = uuidv4();
    const uniqueProjectName = `node-project-${uniqueProjectId}`;

    // Extract custom folders and files from the request body
    const { folders = [], files = [], email } = req.body;

    // Validate email presence
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        // Check if a project exists for the given email
        const existingProject = await Project.findOne({ email });

        if (!existingProject) {
            return res.status(404).json({ error: "User or project not found" });
        }

        // Create the default package.json content
        const packageJson = {
            name: uniqueProjectName,
            version: "1.0.0",
            main: "index.js",
            scripts: {
                start: "node index.js",
            },
        };

        // Update the existing project
        const updatedProject = await Project.findOneAndUpdate(
            { email },
            {
                $set: {
                    projectName: uniqueProjectName,
                    folders: folders,
                    files: [
                        ...files,
                        {
                            name: "package.json",
                            content: JSON.stringify(packageJson, null, 2),
                        },
                    ],
                },
            },
            { new: true } // Return the updated document
        );

        // Respond with the updated project
        return res.json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Error updating project in database:", error);
        return res.status(500).json({ error: "An unexpected error occurred while updating the project" });
    }
}

// API to update an existing project by ID
const updateProject = async (req: Request, res: Response): Promise<any> => {
    const { projectId } = req.params;

    // Extract folders and files to update from the request body
    const { folders = [], files = [] } = req.body;

    try {
        // Find the project in the database
        const project = await Project.findOne({ projectId });

        if (!project) {
            return res.status(404).json({ error: "Project not found in database" });
        }

        // Update folders and files in the database
        project.folders = [...project.folders, ...folders]; // Replace with the new folder list
        project.files = [...project.files, ...files];     // Replace with the new file list
        await project.save();

        return res.json({ message: "Project updated successfully", project });
    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error });
    }
}