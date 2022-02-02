const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

const port = process.env.PORT || 4000;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("icecandidate", (roomId, candidate) => {
    console.log(candidate);

    socket.to(roomId).emit("icecandidate", candidate);
  });

  socket.on("offer", (roomId, offer) => {
    console.log(`Received an offer from room "${roomId}"`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (roomId, answer) => {
    console.log(`Received an answer from room "${roomId}"`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });
});

app.use(express.static(path.resolve(__dirname, "../client/build")));

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
