import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./popup.css";

const App: React.FC<{}> = () => {
  return <div></div>;
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
