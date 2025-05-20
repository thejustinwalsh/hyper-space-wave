declare global {
  var __PIXI_APP__: Application;

  interface Window {
    __PIXI_DEV__: boolean;
  }

  var process: {
    env: {
      NODE_ENV: string;
    };
  };
}

export {};
