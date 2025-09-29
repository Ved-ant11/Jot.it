import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const httpRequestHandler = (req, res) => {
  res.writeHead(200);
  res.end("Server is running and healthy.");
};

const httpServer = createServer(httpRequestHandler);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log(`[CONNECTED] User connected with socket ID: ${socket.id}`);

  socket.on("join-document", ({ documentId, user }) => {
    socket.join(documentId);
    console.log(
      `[JOIN] User ${user.name} (${socket.id}) joined room: ${documentId}`
    );

    if (!rooms[documentId]) {
      rooms[documentId] = [];
    }
    if (!rooms[documentId].some((u) => u.id === user.id)) {
      rooms[documentId].push({
        id: user.id,
        name: user.name,
        image: user.image,
      });
    }

    io.in(documentId).emit("update-user-list", rooms[documentId]);

    socket.data.userId = user.id;
    socket.data.documentId = documentId;
  });

  socket.on("text-change", (data) => {
    socket.broadcast.to(data.documentId).emit("receive-change", data.newText);
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECTED] User disconnected: ${socket.id}`);
    const { userId, documentId } = socket.data;

    if (documentId && rooms[documentId]) {
      rooms[documentId] = rooms[documentId].filter((u) => u.id !== userId);
      io.in(documentId).emit("update-user-list", rooms[documentId]);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
