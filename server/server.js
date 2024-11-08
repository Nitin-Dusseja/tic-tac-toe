const { createServer } = require("http");
const { Server } = require("socket.io");
// const dotenv = require("dotenv");
// dotenv.config();

// const PORT = process.env.PORT;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "*",
});

const allUsers = {};

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  // console.log(allUsers.playerName);
  socket.on("request_to_play", (data) => {
    const currentPlayer = allUsers[socket.id];
    currentPlayer.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      opponentPlayer.socket.emit("opponentFound", {
        opponentName: currentPlayer.playerName,
        playingAs: "circle",
      });

      currentPlayer.socket.emit("opponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "cross",
      });

      currentPlayer.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentPlayer.socket.emit("opponentNotFound");
    }
  });
  socket.on("disconnect", () => {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
  });
});
// console.log("i m on " + PORT);
httpServer.listen(3000);
