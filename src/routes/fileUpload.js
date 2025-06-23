import fs from "node:fs";
import {pipeline} from "node:stream/promises";
async function fileUploadRouter(fastify, options) {
    fastify.post("/api/v1/upload", async (request, reply) => {
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
