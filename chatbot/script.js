const authToken = localStorage.getItem("auth-token");
if (!authToken) {
    window.location.href = "login.html";
}

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const historyList = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat");

let conversations = {};
let currentChatId = null;  // Initially set to null

// Fetch chat history
async function fetchChatHistory() {
    try {
        const response = await fetch('http://localhost:5000/api/chat/chat-history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch chat history: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Chat History:", data);  // Debugging: log the data to inspect
        
        // Check if chatHistory is an array and contains data
        if (Array.isArray(data.chatHistory) && data.chatHistory.length > 0) {
            conversations = {}; // Clear previous conversations

            // Loop through each chat in chatHistory
            data.chatHistory.forEach(chat => {
                const chatId = chat._id; // Use chat _id as the unique identifier
                if (!conversations[chatId]) {
                    conversations[chatId] = { _id: chatId, messages: [] };
                }

                // Add each message in this chat to the messages array
                chat.messages.forEach(msg => {
                    conversations[chatId].messages.push({
                        text: msg.text,
                        sender: msg.sender,
                        timestamp: msg.timestamp
                    });
                });
            });

            // Set currentChatId to the first chat in the history, or null if none exists
            const chatIds = Object.keys(conversations);
            if (chatIds.length > 0) {
                currentChatId = chatIds[0];  // Set the first chat as currentChatId
                console.log("Current chat ID set to:", currentChatId);  // Debugging: log currentChatId
            } else {
                console.log("No existing chats found.");
            }

        } else {
            console.log('No chat history available or chatHistory is empty');
        }

        updateHistoryUI();
    } catch (error) {
        console.error("Error fetching chat history:", error);
    }
}

// Create a new chat
async function createNewChat() {
    try {
        const response = await fetch('http://localhost:5000/api/chat/new-chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to create new chat: ${response.status}`);
        }

        const data = await response.json();
        const newChatId = data._id;

        conversations[newChatId] = { _id: newChatId, messages: [] };

        currentChatId = newChatId;  // Ensure currentChatId is set

        console.log("New Chat Created with ID:", currentChatId);  // Debugging: log the new chat ID

        updateHistoryUI();
        chatBox.innerHTML = '';  // Clear the chat box
    } catch (error) {
        console.error("Error creating new chat:", error);
    }
}

// Update history UI with chat history
function updateHistoryUI() {
    historyList.innerHTML = '';
    const ids = Object.keys(conversations).reverse();
    if (ids.length === 0) {
        console.log("No conversations to display.");
    }
    ids.forEach(id => {
        const div = document.createElement("div");
        div.classList.add("history-item");

        const chat = conversations[id];
        const firstMessage = chat.messages?.[0]?.text || "New Chat";
        div.textContent = firstMessage.length > 20 ? firstMessage.slice(0, 20) + "..." : firstMessage;

        div.onclick = () => loadChat(id);
        historyList.appendChild(div);
    });

    console.log("Updated History UI. Current Chat ID: ", currentChatId);  // Debugging: log currentChatId
}

// Load a specific chat
function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = '';

    const chat = conversations[id];
    if (chat && Array.isArray(chat.messages)) {
        chat.messages.forEach(msg => {
            appendMessage(msg.text, msg.sender, false);  // Load all messages for this chat
        });
    }

    console.log("Loaded Chat ID: ", currentChatId);  // Debugging: log currentChatId after loading chat
}

// Append message safely (both to UI and local conversation)
function appendMessage(text, sender, save = true) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) {
        if (currentChatId && !conversations[currentChatId]) {
            conversations[currentChatId] = { _id: currentChatId, messages: [] };
        }
        if (currentChatId && Array.isArray(conversations[currentChatId].messages)) {
            conversations[currentChatId].messages.push({ text, sender });
        }

        sendMessageToBackend(text);  // Send message to backend for storage
    }
}

// Send message to the backend for storing in the database
async function sendMessageToBackend(text) {
    if (!currentChatId) {
        console.error("No current chat ID found.");
        alert("Please select or create a chat before sending a message.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                message: text,
                chatId: currentChatId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.status}`);
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
async function getGeminiResponse(userText) {
    appendMessage("Thinking...", "bot", false);
    const thinkingMsgElement = chatBox.lastChild;

    try {
        const response = await fetch('http://localhost:5000/api/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                message: userText,
                chatId: currentChatId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch bot response: ${response.status}`);
        }

        const data = await response.json();
        thinkingMsgElement.remove();
        appendMessage(data.reply, "bot");

    } catch (error) {
        console.error("Error fetching bot reply:", error);
        thinkingMsgElement.textContent = "Sorry, I couldn't get a response.";
    }
}

// Send button click
sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (text !== "") {
        appendMessage(text, "user");
        userInput.value = "";
        await getGeminiResponse(text);
    }
});

// Enter key sends message
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

// New chat button
newChatBtn.addEventListener("click", () => {
    createNewChat();
});

// Fetch chat history when page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchChatHistory();
});
