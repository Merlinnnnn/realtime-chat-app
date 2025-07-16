import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Nhận tin nhắn nhóm và gửi tới các thành viên
  socket.on("sendGroupMessage", ({ groupId, message, members }) => {
    console.log("Backend received sendGroupMessage", { groupId, message, members, from: userId });
    members.forEach(memberId => {
      if (memberId !== userId && userSocketMap[memberId]) {
        console.log("Emit newGroupMessage to", memberId, "socket", userSocketMap[memberId]);
        io.to(userSocketMap[memberId]).emit("newGroupMessage", { groupId, message });
      }
    });
  });

  // Gửi lời mời kết bạn realtime
  socket.on("sendFriendRequest", ({ receiverId, request }) => {
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("newFriendRequest", request);
    }
  });

  // Gửi thông báo (ví dụ: chấp nhận kết bạn)
  socket.on("sendNotification", ({ receiverId, notification }) => {
    if (userSocketMap[receiverId]) {
      io.to(userSocketMap[receiverId]).emit("newNotification", notification);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };