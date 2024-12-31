import jwt from "jsonwebtoken"
import { Request, Response } from "express";

const tokeni = "AJHBDJKADJKGJKSWFKJKEGFGKFGKKGEFKJGFJKGKJSJKFKJKFJKFJKVJKKJVDJKFCJKFJKFJKFJKBFSJKFJKFJKFJKB"

export const authHandler = async (req: Request, res: Response): Promise<Response> => {
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
}