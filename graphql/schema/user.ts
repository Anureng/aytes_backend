import { gql } from "apollo-server"

const typeDefs = gql`
type Project{
    id:ID!
    name: String
    projectName: String
    email: String
    password: String
    project: [String]
    createdAt: String!
    updatedAt: String!
}

input createProject {
    name: String
    projectName: String
    email: String
    password: String
    project: [String]
}

input updateProject {
    name: String
    projectName: String
    email: String
    password: String
    project: [String]
}

type Query{
    getProjectId(id:ID!):Project
    getProjects:[Project]
}

type Mutation{
    createProject(input:createProject!):Project!
    updateProject(id:ID!,input:updateProject!):Project!
}
`

export default typeDefs