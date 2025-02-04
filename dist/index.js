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
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const project_1 = __importDefault(require("./models/project"));
const User_1 = __importDefault(require("./models/user"));
const app = (0, express_1.default)();
const port = 3002;
app.use(express_1.default.json()); // Middleware to parse JSON bodies
const corsOption = {
    origin: ["http://localhost:3000", "https://aytes.vercel.app", "https://aytes.vercel.app/test"]
};
app.use((0, cors_1.default)(corsOption));
mongoose_1.default.connect("mongodb+srv://nrgsidhu:test123@cluster0.on4vu.mongodb.net/")
    .then(() => { console.log("Connected to MongoDB"); })
    .catch((err) => console.log(err));
const tokeni = "AJHBDJKADJKGJKSWFKJKEGFGKFGKKGEFKJGFJKGKJSJKFKJKFJKFJKVJKKJVDJKFCJKFJKFJKFJKBFSJKFJKFJKFJKB";
// Root directory for all user projects
const projectsRoot = path_1.default.join(__dirname, "projects");
// API to create a unique Node.js project for each user
app.post("/create-project", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueProjectId = (0, uuid_1.v4)();
    const uniqueProjectName = `node-project-${uniqueProjectId}`;
    // Extract custom folders and files from the request body
    const { folders = [], files = [], email, projectName } = req.body;
    // ✅ Validate email presence
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    try {
        // ✅ Check if the user exists first
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found. Please register first." });
        }
        // ✅ Check if a project exists for the given email
        let existingProject = yield project_1.default.findOne({ email });
        // ✅ Create the default package.json content
        const packageJson = {
            name: projectName,
            version: "1.0.0",
            main: "index.js",
            scripts: {
                start: "node index.js",
            },
        };
        if (!existingProject) {
            // ✅ If no project exists, create a new one
            existingProject = new project_1.default({
                email,
                projectName,
                projectId: uniqueProjectId,
                folders,
                files: [
                    ...files,
                    {
                        name: "package.json",
                        content: JSON.stringify(packageJson, null, 2),
                    },
                ],
            });
            yield existingProject.save();
            return res.status(201).json({
                message: "New project created successfully",
                project: existingProject,
            });
        }
        // ✅ If project exists, update it
        const updatedProject = yield project_1.default.findOneAndUpdate({ email }, {
            $set: {
                projectName,
                projectId: uniqueProjectId,
                folders,
                files: [
                    ...files,
                    {
                        name: "package.json",
                        content: JSON.stringify(packageJson, null, 2),
                    },
                ],
            },
        }, { new: true, upsert: true } // ✅ Ensures a new project is created if none exists
        );
        return res.status(200).json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    }
    catch (error) {
        console.error("Error updating project in database:", error);
        return res.status(500).json({ error: "An unexpected error occurred while updating the project" });
    }
}));
// API to update an existing project by ID
app.post("/update-project/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    // Extract folders and files to update from the request body
    const { folders = [], files = [] } = req.body;
    try {
        // Find the project in the database
        const project = yield project_1.default.findOne({ projectId });
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
}));
app.post("/createUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const findData = yield User_1.default.findOne({ email });
        if (findData) {
            return res.status(400).json({ error: "User already exists" });
        }
        const data = new User_1.default({
            name: name,
            email: email,
            password: password
        });
        yield data.save();
        const getToken = jsonwebtoken_1.default.sign({ email: data.email, id: data.id }, tokeni, { expiresIn: "3d" });
        return res.json({ message: "User created successfully", token: getToken });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find user by email
        const findData = yield User_1.default.findOne({ email });
        if (!findData) {
            return res.status(404).json({ error: "User not found" });
        }
        // Check if the password matches
        if (findData.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate a token (you can use jwt for this)
        const token = jsonwebtoken_1.default.sign({ email: findData.email, id: findData._id }, tokeni, {
            expiresIn: "3d",
        });
        return res.json({ message: "Login successful", token });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}));
app.get("/getData/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const getData = yield project_1.default.findById(id);
        if (!getData) {
            return res.status(400).json("First Create User");
        }
        return res.status(200).json(getData);
    }
    catch (error) {
        return res.status(500).json(error);
    }
}));
app.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    try {
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        const verify = jsonwebtoken_1.default.verify(token, tokeni);
        if (!verify) {
            return res.status(500).json("not verify");
        }
        return res.json({ message: "User created successfully", decoded });
    }
    catch (error) {
        return res.status(500).json({ error });
    }
}));
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
