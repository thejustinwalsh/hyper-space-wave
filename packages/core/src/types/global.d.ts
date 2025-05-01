declare global {
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
