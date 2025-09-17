const { Server } = require('socket.io');
const { createMessage } = require('./controllers/messageController');
const MissedCall = require ('./models/missedCall');
let io;

const socketSetup = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  let onlineUsers = [];

  let users = {}; // لتخزين userId -> socketId

  io.on('connection', (socket) => {

socket.on("addNewUser", async (userId) => {
  onlineUsers = onlineUsers.filter(user => user.userId !== userId); 
  onlineUsers.push({ userId, socketId: socket.id });

  users[userId] = socket.id;

  console.log('👤 Current online users:', onlineUsers);

  io.emit("getOnlineUsers", onlineUsers);  

  // 🟢 هنا بقى async/await يشتغل عادي
  try {
    const calls = await MissedCall.find({ to: userId, seen: false })
      .populate("from", "name email profilePhoto")
      .sort({ timestamp: -1 });

    io.to(socket.id).emit("missed-calls-initial", calls);
  } catch (err) {
    console.error("Error fetching missed calls:", err);
  }
});

    // ------------------- Chat Events -------------------
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('userTyping', { chatId, userId });
      console.log(chatId  +  userId + 'typing'  )
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      socket.to(chatId).emit('userStopTyping', { chatId, userId });
          console.log(chatId  +  userId + 'typingStopped'  )

    });

    socket.on('sendMessage', async (data) => {
      try {
        const req = { body: data, io };
        const res = { status: () => ({ json: () => {} }) };
        await createMessage(req, res, onlineUsers, socket);
      } catch (error) {
        console.error('Error processing sendMessage:', error);
      }
    });

    // ------------------- WebRTC Signaling -------------------
// بدء مكالمة (إرسال الـ Offer)
  // 🟢 handle call
  socket.on("call-user", async ({ to, offer, from,type , name
  }) => {
    const toSocketId = users[to];

    if (toSocketId) {
      io.to(toSocketId).emit("incoming-call", { from, offer, type,name   });
    } else {
      
      try {
        await MissedCall.create({
          to,
          from,
          name,
          callType: type
        });
        console.log("Missed call saved in DB");
      } catch (err) {
        console.error("Error saving missed call:", err);
      }
    }
  });

// لو رفض
socket.on("reject-call", ({ to }) => {
  const toSocketId = users[to];
  if (toSocketId) {
    io.to(toSocketId).emit("end-call");
  }
});


socket.on("mark-missed-calls-seen", async (userId) => {
  try {
    await MissedCall.updateMany(
      { to: userId, seen: false },
      { $set: { seen: true } }
    );

    // رجّع رد للكلاينت اللي عمل Seen
    io.to(socket.id).emit("marked-seen");

    // ابعت broadcast لباقي الكلاينتس (لو مهم)
    // socket.broadcast.emit("missed-calls-updated", userId);
  } catch (err) {
    console.error("Error marking missed calls as seen:", err);
  }
});


    // الرد على المكالمة (Answer)
    socket.on("make-answer", ({ to, answer, from }) => {
      const toSocketId = users[to];
            console.log(toSocketId +'make');

      if (toSocketId) {
        io.to(toSocketId).emit("answer-made", { answer, from });
      }
    });

    // تبادل الـ ICE Candidates
    socket.on("ice-candidate", ({ to, candidate, from }) => {
      const toSocketId = users[to];
            console.log(toSocketId+ 'ice');
            console.log("users object in server:", users);


      if (toSocketId) {
        io.to(toSocketId).emit("ice-candidate", { candidate, from });
      }
    });

    // إنهاء المكالمة

 socket.on("end-call", ({ to, from }) => {
  io.to(users[to]).emit("end-call", { from });
});
    // ------------------- Disconnect -------------------
    socket.on('disconnect', () => {
      console.log('User disconnected: ' + socket.id);

      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);

      for (let userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          break;
        }
      }
    });



    

  });

  return io;
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { socketSetup, getIO };
