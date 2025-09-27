import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const httpRequestHandler = (req, res) => {
  res.writeHead(200);
  res.end('Server is running and healthy.');
};

const httpServer = createServer(httpRequestHandler);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`[CONNECTED] User connected with socket ID: ${socket.id}`);

  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`[JOIN] User ${socket.id} joined room: ${documentId}`);
  });

  socket.on('text-change', (data) => {
    socket.broadcast.to(data.documentId).emit('receive-change', data.newText);
    console.log(`[TEXT-CHANGE] User ${socket.id} in room ${data.documentId} changed text.`);
  });

  socket.on('disconnect', () => {
    console.log(`[DISCONNECTED] User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

