// the express package will run our server
const express = require("express");
const app = express();
app.use(express.static("public")); // this line tells the express app to 'serve' the public folder to clients

// HTTP will expose our server to the web
const http = require("http").createServer(app);

// start our server listening on port 8080 for now (this is standard for HTTP connections)
const server = app.listen(8080);
console.log("Server is running on http://localhost:8080");

/////SOCKET.IO///////
const io = require("socket.io")().listen(server);

const peers = {};

io.on("connection", (socket) => {
  console.log(
    "Someone joined our server using socket.io.  Their socket id is",
    socket.id
  );
  socket.emit("peerNumber", io.engine.clientsCount);
  peers[socket.id] = {};

  console.log("Current peers:", peers);

  socket.on("newPeer", (client) => {
    clientCounter = client;
    console.log(io.engine.clientsCount);
    // console.log("current peer number", clientCounter);
    // socket.emit("currentPeer", clientCounter);
  });

  socket.on("throw", (data) => {
    console.log("throw", data);
    if (io.engine.clientsCount>1){
      setTimeout(function () { 
        socket.broadcast.emit("throwback", data);
        console.log("throwing back");
      }, 1000);
    }
  });

  socket.on("msg", (data) => {
    console.log("Got message from client with id ", socket.id, ":", data);
    let messageWithId = { from: socket.id, data: data };
    socket.broadcast.emit("msg", messageWithId);
  });

  socket.on("disconnect", () => {
    console.log("Someone with ID", socket.id, "left the server");
    delete peers[socket.id];
    socket.emit("peerNumber", io.engine.clientsCount);
  });
});
