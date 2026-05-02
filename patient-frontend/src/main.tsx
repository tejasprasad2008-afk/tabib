import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
window.addEventListener('resize', setVh);
setVh();

createRoot(document.getElementById("root")!).render(<App />);
