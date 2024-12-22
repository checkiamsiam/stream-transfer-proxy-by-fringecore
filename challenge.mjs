import net from "node:net";

const targetHost = "localhost";
const targetPort = 3032;

const streamServer = net.createServer();

const CHUNK_BUFFER_SIZE = 3;

streamServer.on("connection", (clientConn) => {
  console.log("New client connected to the streaming server.");

  const targetConn = net.createConnection({ host: targetHost, port: targetPort }, () => {
    console.log("Connected to the target server.");
  });

  targetConn.write("a");

  let chunkBuffer = [];

  function processAndFlushBuffer() {
    if (chunkBuffer.length >= CHUNK_BUFFER_SIZE) {
      const previusChunk = chunkBuffer[0];
      const currentChunk = chunkBuffer[1];
      const nextChunk = chunkBuffer[2];

      const { refinedPreviusChunk, refinedCurrentChunk, refinedNextChunk } = maskTargetPhrase(previusChunk, currentChunk, nextChunk);

      clientConn.write(refinedPreviusChunk);
      chunkBuffer = [refinedCurrentChunk, refinedNextChunk];
    }
  }

  function maskTargetPhrase(previusChunk, chunk, nextChunk) {
    const fullToCompare = previusChunk + chunk + nextChunk;
    const targetPhrase = "i like big trains and i cant lie";

    const refined = fullToCompare.replace(targetPhrase, (match) => {
      return match
        .split("")
        .map((char) => (char === " " ? " " : "-"))
        .join("");
    });

    const refinedPreviusChunk = refined.slice(0, previusChunk.length);
    const refinedCurrentChunk = refined.slice(previusChunk.length, previusChunk.length + chunk.length);
    const refinedNextChunk = refined.slice(previusChunk.length + chunk.length);

    return {
      refinedPreviusChunk,
      refinedCurrentChunk,
      refinedNextChunk,
    };
  }

  targetConn.on("data", (chunk) => {
    chunkBuffer.push(chunk.toString());
    processAndFlushBuffer();
  });

  targetConn.on("close", () => {
    console.log("Target server connection closed.");
    clientConn.end();
  });

  targetConn.on("error", (error) => {
    console.error("Error with target server connection:", error.message);
    clientConn.end();
  });

  clientConn.on("close", () => {
    console.log("Client disconnected from streaming server.");
    targetConn.end();
  });

  clientConn.on("error", (error) => {
    console.error("Error with client connection:", error.message);
    targetConn.end();
  });
});

const streamPort = parseInt(process.env.STREAM_PORT ?? "3031");

streamServer.listen(streamPort, () => {
  console.log(`Streaming server started on 0.0.0.0:${streamPort}`);
});