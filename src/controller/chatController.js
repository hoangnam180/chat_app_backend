const uuidv4 = require('uuid').v4;

const messages = new Set();
const users = [];

const defaultUser = {
  id: 'anon',
  name: 'Anonymous',
};

const messageExpirationTimeMS = 5 * 60 * 1000;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;
    socket.on('getMessages', () => this.getMessages());
    socket.on('message', (value) => this.handleMessage(value));
    socket.on('disconnect', () => this.disconnect());
    socket.on('join', (user) => this.join(user));
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  userbyId = (id) => users.find((user) => user.id === id);

  sendMessage(message, room) {
    this.io.to(room || message.user.room).emit('message', message);
  }
  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessageBot(value, room) {
    const message = {
      id: uuidv4(),
      user: {
        id: 'bot',
        name: 'Bot',
        room,
      },
      value,
      time: Date.now(),
    };
    messages.add(message);
    this.sendMessage(message, message.user.room);
  }

  join(user) {
    this.disconnect();
    users.push({
      ...user,
      id: this.socket.id,
    });
    this.socket.join(user.room);
    this.handleMessageBot(
      `${user.name} has joined the chat ${user.room}`,
      user.room
    );
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: this.userbyId(this.socket.id) || defaultUser,
      value,
      time: Date.now(),
    };
    console.log(message);
    messages.add(message);
    this.sendMessage(message, message.user.room);

    setTimeout(() => {
      messages.delete(message);
      this.io.sockets.emit('deleteMessage', message.id);
    }, messageExpirationTimeMS);
  }

  disconnect() {
    const user = this.userbyId(this.socket.id);
    if (user) {
      this.handleMessageBot(
        `${user.name} has left the chat ${user.room}`,
        user.room
      );
      users.splice(users.indexOf(user), 1);

      // clear messages from room old
      messages.forEach((message) => {
        if (message.user.room === user.room) {
          messages.delete(message);
          this.io.sockets.emit('deleteMessage', message.id);
        }
      });
    }
  }
}

function chat(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
  });
}

module.exports = chat;
