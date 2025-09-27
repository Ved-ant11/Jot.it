const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[CONNECTED] User connected with socket ID: ${socket.id}`);

  socket.on("join-document", (documentId) => {
    socket.join(documentId);
    console.log(`[JOIN] User ${socket.id} joined room: ${documentId}`);
  });

  socket.on("text-change", (data) => {
    // Use socket.broadcast.to() to send to everyone in the room *except* the sender
    socket.broadcast.to(data.documentId).emit("receive-change", data.newText);
    console.log(
      `[TEXT-CHANGE] User ${socket.id} in room ${data.documentId} changed text.`
    );
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECTED] User disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
});
