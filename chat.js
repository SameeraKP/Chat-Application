const socket = io();

const messageInput = document.getElementById('message-input');
const usernameInput = document.getElementById('username-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

// Function to send message
function sendMessage() {
  const message = messageInput.value.trim();
  const username = usernameInput.value.trim() || 'Anonymous';

  if (message !== '') {
    const data = { username, message };
    socket.emit('chat message', data);
    messageInput.value = '';
    messageInput.focus();
  }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

// Receive and display messages
socket.on('chat message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.textContent = `${data.username}: ${data.message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
