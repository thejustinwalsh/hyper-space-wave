import { createRoot } from "react-dom/client";

import { App } from "@hyper-space-wave/core";

const container = document.getElementById("pixi-container")!;
createRoot(document.getElementById("pixi-container")!).render(<App resizeTo={container} />);
