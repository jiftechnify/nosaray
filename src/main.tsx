import { ChakraProvider } from "@chakra-ui/react";
// import { DevTools } from "jotai-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

import "./main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      {/* <DevTools /> */}
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
