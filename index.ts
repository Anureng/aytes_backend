import express from "express";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Root directory for all user projects
const projectsRoot = path.join(__dirname, "projects");

// API to create a unique Node.js project for each user
app.post("/create-project", async (req: Request, res: Response): Promise<any> => {
  const uniqueProjectId = uuidv4();
  const uniqueProjectName = `node-project-${uniqueProjectId}`;
  const projectPath = path.join(projectsRoot, uniqueProjectName);

  // Extract custom folders and files from request body
  const { folders = [], files = [] } = req.body;

  // Create a unique project directory
  fs.mkdirSync(projectPath, { recursive: true });

  // Create default package.json
  const packageJson = {
    name: uniqueProjectName,
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "node index.js"
    }
  };
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create custom folders
  folders.forEach((folder: string) => {
    const folderPath = path.join(projectPath, folder);
    fs.mkdirSync(folderPath, { recursive: true });
  });

  // Create custom files
  files.forEach(({ name, content, folder = "" }: { name: string; content: string; folder?: string }) => {
    const filePath = path.join(projectPath, folder, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content || "");
  });

  // Send response
  return res.json({ message: "Project created successfully", projectId: uniqueProjectId });
});

// API to update an existing project by ID
app.post("/update-project/:projectId", async (req: Request, res: Response): Promise<any> => {
  const { projectId } = req.params;
  const projectPath = path.join(projectsRoot, `node-project-${projectId}`);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: "Project not found" });
  }

  // Extract folders and files to update from request body
  const { folders = [], files = [] } = req.body;

  // Create or update specified folders
  folders.forEach((folder: string) => {
    const folderPath = path.join(projectPath, folder);
    fs.mkdirSync(folderPath, { recursive: true });
  });

  // Create or update specified files
  files.forEach(({ name, content, folder = "" }: { name: string; content: string; folder?: string }) => {
    const filePath = path.join(projectPath, folder, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content || "");
  });

  return res.json({ message: "Project updated successfully" });
});


app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
