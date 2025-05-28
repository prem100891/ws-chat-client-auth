# 💬 WS Chat Client Auth

A real-time chat app with authentication using WebSockets and ReactJS.

## 🔗 Live Demo
[Click Here](https://ws-chat-client-auth.netlify.app/)

## 🚀 Features
- Real-time messaging
- No login required
- Room-based chat
- Works on mobile and desktop

## 📁 Tech Stack
- ReactJS
- WebSocket
- Material UI

<pre> ## 🧩 Project Flow (Mermaid Diagram) ```mermaid sequenceDiagram participant User participant Browser participant Server User->>Browser: Open Chat App Browser->>Server: WebSocket Connection Server-->>Browser: Connection Established User->>Browser: Type Message Browser->>Server: Send Message Server-->>All Users: Broadcast Message ``` </pre>
