import React from "react";
import { ChatInterface } from "./components/ChatInterface";

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden">
      <ChatInterface />
    </div>
  );
}
