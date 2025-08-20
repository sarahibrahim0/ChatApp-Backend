const { Server } = require('socket.io');
const { createMessage } = require('./controllers/messageController');

let io;

const socketSetup = (server) => {
  io = new Server(server, {
    cors: {
    origin: "*",
      methods: ["GET", "POST"]
    },
  });

  let onlineUsers = [];

  io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('addNewUser', (userId) => {
      onlineUsers = onlineUsers.filter(user => user.userId !== userId); // remove old entries
  onlineUsers.push({ userId, socketId: socket.id });
  
  console.log('👤 Current online users:', onlineUsers.map(user => ({
    userId: user.userId.toString(),
    socketId: user.socketId
  })));

  io.emit("getOnlineUsers", onlineUsers); // <-- Add this here too  
 });

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('userTyping', { chatId, userId });
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      socket.to(chatId).emit('userStopTyping', { chatId, userId });
    });

    socket.on('sendMessage', async (data) => {
      try {
        const req = { body: data, io };
        const res = {
          status: () => ({
            json: () => {},
          }),
        };
        await createMessage(req, res , onlineUsers, socket);
      } catch (error) {
        console.error('Error processing sendMessage:', error);
      }
    });

 socket.on('disconnect', () => {
  console.log('User disconnected: ' + socket.id);
  onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
  io.emit("getOnlineUsers", onlineUsers); // notify all clients
});
  });

  return io;
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { socketSetup, getIO };
