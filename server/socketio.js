let usersio = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    //console.log('New client connected:', socket.id);

    socket.on('setUserId', (userId) => {
      if (userId) {
        usersio[userId] = socket;
        console.log(`User with ID ${userId} connected`);
      }
    });

    socket.on('disconnect', () => {
      Object.keys(usersio).forEach((userId) => {
        if (usersio[userId] === socket) {
          console.log(`User with ID ${userId} disconnected`);
          delete usersio[userId];
        }
      });
    });
  });
};

module.exports.usersio = usersio;