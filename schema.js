const graphql = require("graphql");
const axios = require("axios");
const {
  GraphQLSchema,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} = graphql;

const companyType = new GraphQLObjectType({
  name: "Company",
  // Using arrow function to make use of closure, to use userType before it was defined
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(userType),
      resolve: async (parentValue, args) => {
        const resp = await axios.get(
          `http://localhost:3000/companies/${parentValue.id}/users`
        );
        return resp.data;
      }
    }
  })
});

const userType = new GraphQLObjectType({
  name: "User",
  // Using arrow function to make use of closure, to use userType before it was defined
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: companyType,
      resolve: async (parentValue, args) => {
        // console.log(parentValue, args);
        const resp = await axios.get(
          `http://localhost:3000/companies/${parentValue.companyId}`
        );
        return resp.data;
      }
    }
  })
});

const rootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: userType,
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args) => {
        // return users.filter(user => user.id === args.id)[0];
        const resp = await axios.get(`http://localhost:3000/users/${args.id}`);
        return resp.data;
      }
    },
    company: {
      type: companyType,
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args) => {
        const resp = await axios.get(
          `http://localhost:3000/companies/${args.id}`
        );
        return resp.data;
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: userType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve: async (parentValue, { firstName, age }) => {
        const resp = await axios.post(`http://localhost:3000/users`, {
          firstName,
          age
        });
        return resp.data;
      }
    },
    deleteUser: {
      type: userType,
      args: { id: { type: new GraphQLNonNull(GraphQLString) } },
      resolve: async (parentValue, args) => {
        const resp = await axios.delete(
          `http://localhost:3000/users/${args.id}`
        );
        return resp.data;
      }
    },
    editUser: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve: async (parentValue, { firstName, age, companyId, id }) => {
        const resp = await axios.patch(`http://localhost:3000/users/${id}`, {
          firstName,
          age,
          companyId
        });
        return resp.data;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: rootQuery,
  mutation
});
