import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ClientProfiles from "./components/ClientProfile/ClientProfiles.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App>
      <ClientProfiles />
    </App>
  </StrictMode>,
);