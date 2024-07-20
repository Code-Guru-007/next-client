import io, { Socket } from "socket.io-client";

/**
 * To handle global websocket connections.
 */
class WebsocketRegister {
  websockets: {
    [key: string]: Socket | undefined;
  } = {};

  private checkNameIsExist(name: string) {
    if (typeof this.websockets[name] === "undefined") {
      return false;
    }
    return true;
  }

  public register(name: string) {
    if (!this.checkNameIsExist(name)) {
      this.websockets[name] = io({
        autoConnect: false,
        // configuration for socket.io connection
        // Socket.io not working anymore from Next.js 13.2.5-canary.27
        // Please read for more details https://github.com/vercel/next.js/issues/49334
        addTrailingSlash: false,
      });
    }
  }

  public unregister(name: string) {
    if (this.checkNameIsExist(name)) {
      this.websockets[name]?.close();
      this.websockets[name] = undefined;
    }
  }

  public unregisterAll() {
    Object.keys(this.websockets).forEach((key) => {
      const element = this.websockets[key];
      if (element) {
        element.close();
        this.websockets[key] = undefined;
      }
    });
  }

  public get(name: string) {
    if (this.checkNameIsExist(name)) {
      return this.websockets[name];
    }
    return undefined;
  }
}

const websocketRegister = new WebsocketRegister();

export default websocketRegister;
