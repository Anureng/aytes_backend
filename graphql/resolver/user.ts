import User from "../../models/user";

const resolver = {
    Query: {
        getProjectId: async (_: any, { id }: { id: String }) => {
            return await User.findById(id)
        },
        getProjects: async (_: any, { id }: { id: String }) => {
            return await User.find()
        }
    },
    Mutation: {
        createProject: async (_: any, { input }: { input: any }) => {
            const project = new User(input);
            return await project.save();
        },
        updateProject: async (_: any, { id, input }: { id: string; input: any }) => {
            return await User.findByIdAndUpdate(id, input, { new: true });
        }
    }
}

export { resolver }