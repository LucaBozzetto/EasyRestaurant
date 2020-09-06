/**
 * This utility provides a bunch of functions to handle sockets in an easier way.
 * This class uses the singleton pattern.
 * This way we dont need to pass the io to the constructor several times too.
 */
class SocketUtility {
  /**
   * This class uses the singleton pattern.
   * This way we dont need to pass the io to the constructor several times too.
   * @param {SocketIO.Server} io the socket.io server reference. Only the first time this
   * parameter is actually used. All later calls ignore it and simply return the first instance of the class.
   */
  constructor(io) {
    if (!!SocketUtility.instance) {
      return SocketUtility.instance;
    }
    SocketUtility.instance = this;

    this.io = io;
    this.socketsList = [];

    return this;
  }

  /**
   * Add a pair user/socket to the list of sockets handled by the utility class.
   * @param {*} user The user id.
   * @param {*} socket The newly created socket.
   * @param {string} room If this parameter is passed, the user will join a room with the given name.
   */
  addSocket(user, socket, room) {
    if (!this.socketExists(user)) {
      this.socketsList.push({'user': user, 'socket': socket});
    }

    if (room) {
      socket.join(room);
    }
  }

  /**
   * Remove a socket from the list of sockets.
   * @param {*} socket The socket to be removed.
   */
  removeSocket(socket) {
    this.socketsList = this.socketsList.filter((elem) => {
      return elem.socket != socket;
    });
  }

  /**
   * Fetch a socket associated with the given user. If nothing is found undefined is returned.
   * @param {*} user The user id.
   * @returns the socket associated with the user or undefined.
   */
  getSocket(user) {
    const socket = this.socketsList.find((elem) => {
      return elem.user == user;
    });

    return socket?socket.socket:undefined;
  }

  /**
   * Checks if a user exists in the list of sockets.
   * @param {*} user The user id.
   */
  socketExists(user) {
    return this.getSocket(user) != undefined;
  }

  /**
   * If the user's socket exist he joins the room
   * @param {*} user The user id.
   * @param {*} room The room name
   */
  joinRoom(user, room) {
    if (this.socketExists(user)) {
      this.getSocket(user).join(room);
    }
  }

  /**
   * If the user's socket exist and he's in the room, he leaves it
   * @param {*} user The user id.
   * @param {*} room The room name
   */
  leaveRoom(user, room) {
    if (this.socketExists(user)) {
      const socket = this.getSocket(user);

      if (Object.keys(socket.rooms).includes(room)) {
        socket.leave(room);
      }
    }
  }

  /**
   * Broadcast a message to all connected sockets.
   * @param {string} event The event to be broadcasted
   * @param {*} data The message broadcasted. Can be a simple string or even a json payload.
   */
  broadcast(event, data) {
    this.io.sockets.emit(event, data);
  }

  /**
   * If the user is connected a message will be sent to him.
   * @param {string} event The event to be sent
   * @param {*} data The message to be sent. Can be a simple string or even a json payload.
   * @param {*} user The receiver user id.
   */
  sendTo(event, data, user) {
    if (this.socketExists(user)) {
      this.getSocket(user).emit(event, data);
    }
  }

  /**
   *
   * @param {string} event The event to be broadcasted
   * @param {*} data The message broadcasted. Can be a simple string or even a json payload.
   * @param {string} room The name of the room where the message will be broadcasted.
   */
  roomBroadcast(event, data, room) {
    // First i check that the room exists
    if (this.io.sockets.adapter.rooms.hasOwnProperty(room)) {
      this.io.to(room).emit(event, data);
    }
  }

  /**
   * Call this function the first time you instantiate the class in order to setup
   * and catch the basic events.
   */
  setup() {
    this.io.on('connection', (socket) => {
      socket.on(this.USER_AUTHENTICATED_EVENT, (obj) => {
        try {
          const res = JSON.parse(obj);
          this.addSocket(res.id, socket, res.role);
        } catch (error) {
          console.log(error);
          console.log('Invalid token after connection via socket.io');
        }
      });

      socket.on(this.USER_SIGNED_OUT_EVENT, (obj) => {
        try {
          const res = JSON.parse(obj);
          this.leaveRoom(res.id, res.role);
        } catch (error) {
          console.log(error);
          console.log('Invalid token after connection via socket.io');
        }
      });

      socket.on('disconnect', () => {
        this.removeSocket(socket);
        // console.log('A socket has disconnected!');
      });
    });
  }

  /**
   * Return the event associated with a user that has succesfully authenticated.
   */
  get USER_AUTHENTICATED_EVENT() {
    return 'user-authenticated';
  }

  /**
   * Return the event associated with a user that has succesfully authenticated.
   */
  get USER_SIGNED_OUT_EVENT() {
    return 'user-signed-out';
  }

  /**
   * Return the event associated with an user getting deleted
   */
  get USER_SIGNED_UP_EVENT() {
    return 'user-signed-up';
  }

  /**
   * Return the event associated with a change in status of a table (usually from free to occupied and viceversa).
   */
  get TABLE_STATUS_CHANGED_EVENT() {
    return 'table-status-changed';
  }

  /**
   * Return the event associated with a table being added
   */
  get TABLE_ADDED_EVENT() {
    return 'table-added';
  }

  /**
   * Return the event associated with a new order submitted to the system.
   */
  get ORDER_ADDED_EVENT() {
    return 'order-added';
  }

  /**
   * Return the event associated with a change of an order's status.
   */
  get ORDER_STATUS_CHANGED_EVENT() {
    return 'order-status-changed';
  }

  /**
   * Returned when an order is completed.
   */
  get ORDER_COMPLETED_EVENT() {
    return 'order-completed';
  }

  /**
   * Returned when an order is checkedout.
   */
  get ORDER_CHECKEDOUT_EVENT() {
    return 'order-checkedout';
  }

  /**
   * Returned when an order is completed.
   */
  get ORDER_DELETED_EVENT() {
    return 'order-deleted';
  }

  /**
   * Return the event associated with a new notification generated.
   */
  get NOTIFICATION_EVENT() {
    return 'new-notification';
  }

  /**
   * Return the event associated with notification delete.
   */
  get NOTIFICATION_DELETED_EVENT() {
    return 'deleted-notification';
  }

  /**
   * Return the event associated with the deleting of all notifications for a specific table.
   */
  get TABLE_NOTIFICATIONS_DELETED_EVENT() {
    return 'table-notifications-deleted';
  }

  /**
   * Return the event associated with the deleting of all notifications for a specific table.
   */
  get ELEMENT_STATUS_CHANGED_EVENT() {
    return 'element-status-changed';
  }

  /**
   * Return the event associated with an user becoming admin.
   */
  get USER_PROMOTED_EVENT() {
    return 'user-promoted';
  }

  /**
   * Return the event associated with an user getting deleted
   */
  get USER_DELETED_EVENT() {
    return 'user-deleted';
  }

  /**
   * Return the event associated with an user getting deleted
   */
  get STATISTIC_UPDATED_EVENT() {
    return 'statistic-updated';
  }

  /**
   * Return the event associated with an item being added
   */
  get ITEM_ADDED_EVENT() {
    return 'item-added';
  }
}

module.exports = {SocketUtility};
