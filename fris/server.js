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
  var address = socket.request.connection.remoteAddress;
  if (address.match(/^::ffff:/)) {
    address = address.replace(/^::ffff:/, "");
    console.log("address", address);
  }
  socket.emit("peerNumber", io.engine.clientsCount);
  peers[socket.id] = address;


  socket.on("newPeer", (location) => {
    // console.log(io.engine.clientsCount);
    console.log("peer location", location);
    peers[location.id] = [location.latitude, location.longitude];
    console.log("Current peers:", peers);
  });

  socket.on("throw", (data) => {
    console.log("throw", data);
    let currentPeer = peers[data.id];
    console.log("currentPeer", currentPeer);
    if (io.engine.clientsCount>1){
      setTimeout(function () { 
        socket.broadcast.emit("throwback", data);
        socket.broadcast.emit("peerID", currentPeer);
        console.log("throwing back");
      }, 1000);
    }
  });


  socket.on("disconnect", () => {
    console.log("Someone with ID", socket.id, "left the server");
    delete peers[socket.id];
    socket.emit("peerNumber", io.engine.clientsCount);
  });
});
