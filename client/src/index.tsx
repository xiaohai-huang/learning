import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import adapter from "webrtc-adapter";

import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import ChatRoom from "./routes/chat-room";
import Master from "./routes/master";
import Slave from "./routes/slave";
console.log(adapter);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/master/:roomId" element={<Master />} />
        <Route path="/slave/:roomId" element={<Slave />} />
        <Route path="/chat-room/:roomId" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
