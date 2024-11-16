import express from "express";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from 'mongoose';
import Project from "./models/user";

const app = express();
const port = 3001;

app.use(express.json()); // Middleware to parse JSON bodies

mongoose.connect("mongodb+srv://nrgsidhu:test123@cluster0.on4vu.mongodb.net/")
  .then(() => { console.log("Connected to MongoDB") })
  .catch((err) => console.log(err))

// Root directory for all user projects
const projectsRoot = path.join(__dirname, "projects");

// API to create a unique Node.js project for each user
app.post("/create-project", async (req: Request, res: Response): Promise<any> => {
  const uniqueProjectId = uuidv4();
  const uniqueProjectName = `node-project-${uniqueProjectId}`;

  // Extract custom folders and files from request body
  const { folders = [], files = [] } = req.body;

  // Create the default package.json content
  const packageJson = {
    name: uniqueProjectName,
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "node index.js"
    }
  };

  try {
    // Create a new Project instance with the provided data
    const project = new Project({
      projectId: uniqueProjectId,
      name: uniqueProjectName,
      folders: folders,
      files: [
        ...files,
        {
          name: "package.json",
          content: JSON.stringify(packageJson, null, 2)
        }
      ]
    });

    // Save the project to MongoDB
    await project.save();

    // Return success response
    return res.json({ message: "Project created successfully", projectId: uniqueProjectId });
  } catch (error) {
    console.error("Error saving project to database:", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
});

// API to update an existing project by ID
app.post("/update-project/:projectId", async (req: Request, res: Response): Promise<any> => {
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
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
