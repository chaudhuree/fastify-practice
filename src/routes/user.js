import {authHandler} from "../hooks/auth.js";
async function userRouter(fastify, options) {
 
  // user schema
  const userSchema = {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
      },
      required: ["name", "email", "password"],
    },
    response: {
      201: {
        type: "object",
        properties: {
          message: { type: "string" },
          result: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" },
            },
          },
        },
      },
    },
  };
  // create user (with validation)
  fastify.post(
    "/users",
    { 
      schema: {
        ...userSchema,
        description: 'Create a new user',
        tags: ['users'],
        summary: 'Creates a new user with the given information'
      }
    },
    async (request, reply) => {
      const { name, email, password } = request.body;
    //   console.log("bodydata", request.body);
      const userCollection = fastify.mongo.db.collection("users");
      const result = await userCollection.insertOne({ name, email, password });
    //   console.log("user created successfully", result);
      reply.code(201);
      return {
        message: "User created successfully",
        result: {
            id: result.insertedId,
            name,
            email,
            password,
        },
      };
    }
  );

  // get all users
  fastify.get(
    "/users", 
    {
      schema: {
        description: 'Get all users',
        tags: ['users'],
        summary: 'Returns all users with optional name filter',
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Filter users by name' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              result: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
    const query = request.query;
    console.log(query)
    let filter = {}
    if(query.name){
        filter.name = query.name
    }
    const userCollection = fastify.mongo.db.collection("users");
    const result = await userCollection.find(filter).toArray();
    console.log("users", result);
    reply.code(200);
    return {
      message: "Users fetched successfully",
      result,
    };
  });

  // get single user (with auth middleware)
  fastify.get(
    "/users/:id", 
    {
      preHandler: authHandler,
      schema: {
        description: 'Get a single user by ID',
        tags: ['users'],
        summary: 'Returns a specific user by ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              result: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }, 
    async (request, reply) => {
    console.log(request.params.id)
    const userCollection = fastify.mongo.db.collection("users");
    const id = new fastify.mongo.ObjectId(request.params.id)
    const result = await userCollection.findOne({ _id: id });
    console.log(result)
    console.log("user", result);
    reply.code(200);
    return {
      message: "User fetched successfully",
      result,
    };
  });
}

export default userRouter;
