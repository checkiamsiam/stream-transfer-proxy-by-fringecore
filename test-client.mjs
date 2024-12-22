import net from "node:net";

const client = new net.Socket();

const host = "localhost"; 

const port = 3031; 

client.connect(port, host, () => {
  console.log(`Connected to server at ${host}:${port}`);
});

client.on("data", (data) => {
  console.log(data.toString());
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (err) => {
  console.error("Error:", err.message);
});
