import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { Studio } from "./components/studio/Studio";
import "./styles.css";
createRoot(document.getElementById("app")!).render(
  <StrictMode><Studio /><Toaster theme="dark" position="bottom-center" /></StrictMode>,
);
