import { ChakraProvider } from "@chakra-ui/react";
import { DevTools } from "jotai-devtools";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <Suspense>
        <DevTools />
        <App />
      </Suspense>
    </ChakraProvider>
  </React.StrictMode>
);
