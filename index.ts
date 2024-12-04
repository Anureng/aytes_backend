import express from "express";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import mongoose from 'mongoose';
import Project from "./models/user";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const port = 3001;

app.use(express.json()); // Middleware to parse JSON bodies
const corsOption = {
  origin: ["http://localhost:3000", "https://aytes.vercel.app"]
}
app.use(cors(corsOption))

mongoose.connect("mongodb+srv://nrgsidhu:test123@cluster0.on4vu.mongodb.net/")
  .then(() => { console.log("Connected to MongoDB") })
  .catch((err) => console.log(err))


const tokeni = "AJHBDJKADJKGJKSWFKJKEGFGKFGKKGEFKJGFJKGKJSJKFKJKFJKFJKVJKKJVDJKFCJKFJKFJKFJKBFSJKFJKFJKFJKB"

// Root directory for all user projects
const projectsRoot = path.join(__dirname, "projects");

// API to create a unique Node.js project for each user
app.post("/create-project", async (req: Request, res: Response): Promise<any> => {
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

app.post("/createUser", async (req: Request, res: Response): Promise<any> => {
  const { name, email, password } = req.body;
  try {

    const findData = await Project.findOne({ email })
    if (findData) {
      return res.status(400).json({ error: "User already exists" })
    }
    const data = new Project({
      projectId: uuidv4(),
      name: name,
      email: email,
      password: password
    })
    await data.save();
    const getToken = jwt.sign({ email: data.email, id: data.id }, tokeni, { expiresIn: "3d" })
    return res.json({ message: "User created successfully", token: getToken })
  } catch (error) {
    return res.status(500).json({ error: error })
  }
})

app.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const findData = await Project.findOne({ email });
    if (!findData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the password matches
    if (findData.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a token (you can use jwt for this)
    const token = jwt.sign({ email: findData.email, id: findData._id }, tokeni, {
      expiresIn: "3d",
    });

    return res.json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/auth", async (req: Request, res: Response): Promise<any> => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  try {

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const decoded = jwt.decode(token) as string;
    const verify = jwt.verify(token, tokeni);

    if (!verify) {
      return res.status(500).json("not verify")
    }

    return res.json({ message: "User created successfully", decoded })
  } catch (error) {
    return res.status(500).json({ error })
  }
})


app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});