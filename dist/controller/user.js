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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const user_1 = __importDefault(require("../models/user"));
const tokeni = "AJHBDJKADJKGJKSWFKJKEGFGKFGKKGEFKJGFJKGKJSJKFKJKFJKFJKVJKKJVDJKFCJKFJKFJKFJKBFSJKFJKFJKFJKB";
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const findData = yield user_1.default.findOne({ email });
        if (findData) {
            return res.status(400).json({ error: "User already exists" });
        }
        const data = new user_1.default({
            projectId: (0, uuid_1.v4)(),
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
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find user by email
        const findData = yield user_1.default.findOne({ email });
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
});
