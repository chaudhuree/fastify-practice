import fs from "node:fs";
import {pipeline} from "node:stream/promises";
async function fileUploadRouter(fastify, options) {
    fastify.post(
        "/upload", 
        {
            schema: {
                description: 'Upload a file',
                tags: ['files'],
                summary: 'Uploads a file to the server',
                consumes: ['multipart/form-data'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            filename: { type: 'string' },
                            filepath: { type: 'string' }
                        }
                    }
                }
            }
        },
        async (request, reply) => {
        console.log("from file upload router");
        const data = await request.file();
        console.log(data);
        const filename = data.filename;
        const filepath = `./uploads/${filename}`;
        await pipeline(data.file, fs.createWriteStream(filepath));
        reply.send({
            message: "File uploaded successfully",
            filename,
            filepath,
        });
    });
}

export default fileUploadRouter;
