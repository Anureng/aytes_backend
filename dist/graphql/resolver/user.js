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
exports.resolver = void 0;
const user_1 = __importDefault(require("../../models/user"));
const resolver = {
    Query: {
        getProjectId: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            return yield user_1.default.findById(id);
        }),
        getProjects: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id }) {
            return yield user_1.default.find();
        })
    },
    Mutation: {
        createProject: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { input }) {
            const project = new user_1.default(input);
            return yield project.save();
        }),
        updateProject: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { id, input }) {
            return yield user_1.default.findByIdAndUpdate(id, input, { new: true });
        })
    }
};
exports.resolver = resolver;
