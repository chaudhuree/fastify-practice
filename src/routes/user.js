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
    "/api/v1/users",
    { schema: userSchema },
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
  fastify.get("/api/v1/users", async (request, reply) => {
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
  fastify.get("/api/v1/users/:id", {preHandler: authHandler}, async (request, reply) => {
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
