import Fastify from "fastify";
// import { fastifyCaching } from "@fastify/caching";
import swagger from "@fastify/swagger";
import swaggerUI from '@fastify/swagger-ui';
import multipart from "@fastify/multipart";
import userRouter from "./src/routes/user.js";
import fileUploadRouter from "./src/routes/fileUpload.js";
import fastifyMongo from "@fastify/mongodb";
const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true
    }
  }
});

// fastify.register(
//     fastifyCaching,
//     {privacy: fastifyCaching.privacy.NOCACHE},
//     (err) => { if (err) throw err }
//   )

// Register Swagger first
fastify.register(swagger, {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: "Fastify API",
      description: "Fastify API documentation",
      version: "1.0.0"
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json', 'multipart/form-data'],
    produces: ['application/json'],
    tags: [
      { name: 'users', description: 'User related endpoints' },
      { name: 'files', description: 'File upload related endpoints' }
    ]
  },
  exposeRoute: true
});

// Register Swagger UI
fastify.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
});

// mongodb connection
fastify.register(fastifyMongo, {
  forceClose: true,
  url: process.env.MONGO_URL || 'mongodb://localhost:27017',
  database: "fastify-practice",
});

fastify.register(multipart, {
  fieldNameSize: 100, // Max field name size in bytes
  fieldSize: 100, // Max field value size in bytes
  fields: 10, // Max number of non-file fields
  fileSize: 1000000, // For multipart forms, the max file size in bytes
  files: 1, // Max number of file fields
  headerPairs: 2000, // Max number of header key=>value pairs
  parts: 1000, // For multipart forms, the max number of parts (fields + files)
});

// Register routes after Swagger
fastify.register(userRouter, { prefix: '/api/v1' });
fastify.register(fileUploadRouter, { prefix: '/api/v1' });


fastify.get("/", async (request, reply) => {
  reply.send("Hello World!");
});

fastify.get("/health", async (request, reply) => {
  reply.send({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

const startServer = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(
      `Server listening on port ${fastify.server.address().port}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

startServer();
