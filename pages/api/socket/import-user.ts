import { Server } from "socket.io";
import WebSocket from "ws";

const SocketHandler = (req, res) => {
  if (!res.socket.server.io) {
    // Socket is initializing
    // Hand Shake with clientside

    // Socket.io not working anymore from Next.js 13.2.5-canary.27
    // Please read for more details https://github.com/vercel/next.js/issues/49334
    const io = new Server(res.socket.server, { addTrailingSlash: false });

    io.on("connection", (socket) => {
      // Hand Shake with java backend
      const javaWs = new WebSocket(
        `ws://${process.env.WEBSOCKET_URL}/websocket/import-user`
      );
      javaWs.on("open", () => {
        socket.on("import-user-data", (msg) => {
          javaWs.send(msg);
        });
        socket.on("disconnect", () => {
          javaWs.close();
        });

        javaWs.on("message", (data) => {
          socket.emit("receive-user-data", data.toString());
        });
      });
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
