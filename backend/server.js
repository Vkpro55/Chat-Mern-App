const express = require('express');
const dotenv = require("dotenv");
const chats = require('./data/data.js');
const cors = require('cors'); // Import the cors middleware
const connectDB = require('./config/db.js')
const userRoutes = require("./routes/userRoutes.js")
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js')
const { notFound, errorHandler }= require('./middleware/errorMiddleware.js')
const path = require('path');


 dotenv.config();
// const xyz = path.resolve(__dirname, '.env');
// console.log('Resolved path:', xyz);

// require('dotenv').config({ path: path.resolve(__dirname, '.env') });
connectDB();

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Update the origin
// app.use(cors({ credentials: true, origin: 'http://localhost:3001' }));

app.use(express.json())

// app.get("/", (req, res) => {
//     res.send("Api is called successfully!!!");
// });




/*

app.get('/api/chats', (req, res) => {
    res.send(chats);
});
app.get("/api/chat/:id", (req, res) => {
    const singleChat = chats.find((c) => c._id === req.params.id);
    res.send(singleChat);
});
*/

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);



app.post('/proxy/cloudinary', async (req, res) => {
  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any Cloudinary authentication headers here if needed
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Proxy server error' });
  }
});

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();
// Determine the base directory for local and deployment environments
const baseDir = process.env.NODE_ENV === 'production' ? __dirname1 : path.resolve();
// const baseDir = process.env.NODE_ENV === 'production' ? '/opt/render/project' : path.resolve();
console.log('Base Dire:- ', baseDir);


if (process.env.NODE_ENV === "production") {
  // Adjust the path to the frontend build folder based on your project structure
  //const frontendBuildPath = path.resolve(__dirname1, '../frontend/build');
  const frontendBuildPath = path.resolve(baseDir, 'frontend/build');
  console.log('Resolved path:', frontendBuildPath);
  // const renderrepo = 'C:\Users\\Vinod Kumar\\Desktop\\ChatApp\\frontend\\build';
  // console.log('Rende repo:- ', renderrepo);
  
  // const frontendBuildPath = process.env.frontendBuildPath || '/opt/render/project/frontend/build';


  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) =>
    res.sendFile('index.html', { root: frontendBuildPath })
  );

  // app.get("*", (req, res) =>
  //   res.sendFile(path.join(frontendBuildPath, "index.html"))
  // );
  
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server= app.listen(PORT, () => {
    console.log(`Sever started on ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
  
 