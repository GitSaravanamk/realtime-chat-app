const socket = io();

const loginPanel = document.getElementById("loginPanel");
const chatPanel = document.getElementById("chatPanel");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const loginError = document.getElementById("loginError");
const myUsername = document.getElementById("myUsername");
const usersList = document.getElementById("usersList");
const userCount = document.getElementById("userCount");
const messages = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

let currentUsername = "";

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.textContent = "";
  socket.emit("user:join", usernameInput.value, (result) => {
    if (!result || !result.ok) {
      loginError.textContent = result?.error || "Unable to join. Please try again.";
      return;
    }
    currentUsername = result.username;
    myUsername.textContent = currentUsername;
    loginPanel.classList.add("hidden");
    chatPanel.classList.remove("hidden");
    messageInput.focus();
  });
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  socket.emit("chat:message", message);
  messageInput.value = "";
  messageInput.focus();
});

socket.on("users:update", (users) => {
  usersList.replaceChildren();
  userCount.textContent = users.length;
  users.forEach((username) => {
    const item = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "user-dot";
    const name = document.createElement("span");
    name.textContent = username + (username === currentUsername ? " (you)" : "");
    item.append(dot, name);
    usersList.appendChild(item);
  });
});

socket.on("chat:message", (data) => {
  const empty = messages.querySelector(".empty-state");
  if (empty) empty.remove();

  const bubble = document.createElement("article");
  bubble.className = "message" + (data.username === currentUsername ? " mine" : "");

  const meta = document.createElement("div");
  meta.className = "message-meta";
  const name = document.createElement("strong");
  name.textContent = data.username;
  const time = document.createElement("time");
  const date = new Date(data.time);
  time.textContent = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  meta.append(name, time);

  const text = document.createElement("div");
  text.className = "message-text";
  text.textContent = data.message; // textContent prevents HTML injection

  bubble.append(meta, text);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("system:message", (data) => {
  const line = document.createElement("div");
  line.className = "system-message";
  line.textContent = data.text;
  messages.appendChild(line);
  messages.scrollTop = messages.scrollHeight;
});

socket.on("connect_error", () => {
  loginError.textContent = "Cannot connect to the chat server. Refresh and try again.";
});
