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
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// Root directory for all user projects
const projectsRoot = path_1.default.join(__dirname, "projects");
// API to create a unique Node.js project for each user
app.post("/create-project", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueProjectId = (0, uuid_1.v4)();
    const uniqueProjectName = `node-project-${uniqueProjectId}`;
    const projectPath = path_1.default.join(projectsRoot, uniqueProjectName);
    // Extract custom folders and files from request body
    const { folders = [], files = [] } = req.body;
    // Create a unique project directory
    fs_1.default.mkdirSync(projectPath, { recursive: true });
    // Create default package.json
    const packageJson = {
        name: uniqueProjectName,
        version: "1.0.0",
        main: "index.js",
        scripts: {
            start: "node index.js"
        }
    };
    fs_1.default.writeFileSync(path_1.default.join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2));
    // Create custom folders
    folders.forEach((folder) => {
        const folderPath = path_1.default.join(projectPath, folder);
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    });
    // Create custom files
    files.forEach(({ name, content, folder = "" }) => {
        const filePath = path_1.default.join(projectPath, folder, name);
        fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
        fs_1.default.writeFileSync(filePath, content || "");
    });
    // Send response
    return res.json({ message: "Project created successfully", projectId: uniqueProjectId });
}));
// API to update an existing project by ID
app.post("/update-project/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const projectPath = path_1.default.join(projectsRoot, `node-project-${projectId}`);
    if (!fs_1.default.existsSync(projectPath)) {
        return res.status(404).json({ error: "Project not found" });
    }
    // Extract folders and files to update from request body
    const { folders = [], files = [] } = req.body;
    // Create or update specified folders
    folders.forEach((folder) => {
        const folderPath = path_1.default.join(projectPath, folder);
        fs_1.default.mkdirSync(folderPath, { recursive: true });
    });
    // Create or update specified files
    files.forEach(({ name, content, folder = "" }) => {
        const filePath = path_1.default.join(projectPath, folder, name);
        fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
        fs_1.default.writeFileSync(filePath, content || "");
    });
    return res.json({ message: "Project updated successfully" });
}));
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
