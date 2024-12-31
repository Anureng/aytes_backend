"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const uuid_1 = require("uuid");
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueProjectId = (0, uuid_1.v4)();
    const uniqueProjectName = `node-project-${uniqueProjectId}`;
    // Extract custom folders and files from the request body
    const { folders = [], files = [], email } = req.body;
    // Validate email presence
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        // Check if a project exists for the given email
        const existingProject = yield user_1.default.findOne({ email });
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
        const updatedProject = yield user_1.default.findOneAndUpdate({ email }, {
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
        }, { new: true } // Return the updated document
        );
        // Respond with the updated project
        return res.json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    }
    catch (error) {
        console.error("Error updating project in database:", error);
        return res.status(500).json({ error: "An unexpected error occurred while updating the project" });
    }
});
// API to update an existing project by ID
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    // Extract folders and files to update from the request body
    const { folders = [], files = [] } = req.body;
    try {
        // Find the project in the database
        const project = yield user_1.default.findOne({ projectId });
        if (!project) {
            return res.status(404).json({ error: "Project not found in database" });
        }
        // Update folders and files in the database
        project.folders = [...project.folders, ...folders]; // Replace with the new folder list
        project.files = [...project.files, ...files]; // Replace with the new file list
        yield project.save();
        return res.json({ message: "Project updated successfully", project });
    }
    catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error });
    }
});
