"use strict";

require("dotenv").config();

const compression = require("compression");
const express = require("express");
const app = express();
app.use((compression()));
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const ngrok = require("ngrok");

let channels = {}; //collect channels
let sockets = {}; //collect sockets
let peers = {}; //collect peers info grp by channels
let meetingURL;

// Peer
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/rejoin", (req,res) =>{
  res.render("endScreen");
});

app.get("/", (req, rsp) => {
  meetingURL = `${uuidv4()}`;
  rsp.redirect(`/${meetingURL}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  //console.log(socket);
  
  console.log("["+socket.id+"]---> connection accepted");
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
      //console.log("disconnect message broadcasted");
    });
    
  });
});

server.listen(process.env.PORT || 3030);