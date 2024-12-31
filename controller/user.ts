import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import { v4 as uuidv4 } from "uuid";
import Project from "../models/user";
const tokeni = "AJHBDJKADJKGJKSWFKJKEGFGKFGKKGEFKJGFJKGKJSJKFKJKFJKFJKVJKKJVDJKFCJKFJKFJKFJKBFSJKFJKFJKFJKB"

const createUser = async (req: Request, res: Response): Promise<Response> => {
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
}

const login = async (req: Request, res: Response): Promise<Response> => {
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
};