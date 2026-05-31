import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element tidak ditemukan. Pastikan public/index.html memiliki <div id='root'></div>.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
