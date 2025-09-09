const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config();
const userRoute = require('./routers/userRoute');
const chatRoute = require('./routers/chatRoute');
const messageRoute = require('./routers/messageRoute');
const missedCallRoute = require('./routers/missedCallRoute');

const passwordRoute = require('./routers/passwordRoute');
const { socketSetup, getIO } = require("./socket");
const Http = require("http");
const app = express();
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 8000;
const server = Http.createServer(app);
const io = socketSetup(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());


app.use((req, res, next) => {
  req.io = getIO(); // safely access the shared `io` instance
  next();
});


app.use('/api/users', userRoute);
app.use('/api/chat', chatRoute);
app.use('/api/messages', messageRoute);
app.use('/api/password', passwordRoute);
app.use('/api/missed-call', missedCallRoute);






mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




