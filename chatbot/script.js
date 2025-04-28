const authToken = localStorage.getItem("auth-token");
if (!authToken) {
    window.location.href = "login.html";
}

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const historyList = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat");
const fileInput = document.getElementById("file-input");
const fileBtn = document.getElementById("file-btn");

const CLOUDINARY_CLOUD_NAME = "ddcf7mx3l";
const CLOUDINARY_UPLOAD_PRESET = "chatbot";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;

let conversations = {};
let currentChatId = null;
let selectedFile = null;

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        displayFileInfo(file.name);
    }
});

function displayFileInfo(fileName) {
    const existingFileInfo = document.getElementById('file-info');
    if (existingFileInfo) {
        existingFileInfo.remove();
    }

    const fileInfoSpan = document.createElement('span');
    fileInfoSpan.id = 'file-info';
    fileInfoSpan.textContent = `Selected: ${fileName}`;
    fileInfoSpan.style.marginLeft = '10px';
    fileInfoSpan.style.fontSize = '0.8em';
    fileInfoSpan.style.color = 'grey';
    userInput.parentNode.insertBefore(fileInfoSpan, sendBtn);
}

function removeFileInfo() {
    const fileInfoSpan = document.getElementById('file-info');
    if (fileInfoSpan) {
        fileInfoSpan.remove();
    }
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        appendMessage(`Uploading ${file.name}...`, "system", false);
        const uploadStatusMsg = chatBox.lastChild;

        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        console.log("Cloudinary Upload Success:", data);
        uploadStatusMsg.remove();
        return data.secure_url;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        appendMessage(`Failed to upload ${file.name}.`, "system-error", false);
        const uploadStatusMsg = Array.from(chatBox.childNodes).find(node => node.textContent.startsWith(`Uploading ${file.name}`));
        if (uploadStatusMsg) uploadStatusMsg.remove();
        return null;
    }
}

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
        console.log("Fetched Chat History:", data);
        
        if (Array.isArray(data.chatHistory) && data.chatHistory.length > 0) {
            conversations = {};

            data.chatHistory.forEach(chat => {
                const chatId = chat._id;
                if (!conversations[chatId]) {
                    conversations[chatId] = { _id: chatId, messages: [] };
                }

                chat.messages.forEach(msg => {
                    conversations[chatId].messages.push({
                        text: msg.text,
                        sender: msg.sender,
                        timestamp: msg.timestamp,
                        fileUrl: msg.fileUrl
                    });
                });
            });

            const chatIds = Object.keys(conversations).reverse();
            if (chatIds.length > 0) {
                currentChatId = chatIds[0];
                loadChat(currentChatId);
                console.log("Current chat ID set to:", currentChatId);
            } else {
                createNewChat();
                console.log("No existing chats found, created a new one.");
            }

        } else {
            createNewChat();
            console.log('No chat history available or chatHistory is empty, created a new chat.');
        }

        updateHistoryUI();
    } catch (error) {
        console.error("Error fetching chat history:", error);
         createNewChat();
    }
}

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

        currentChatId = newChatId;

        console.log("New Chat Created with ID:", currentChatId);

        updateHistoryUI();
        chatBox.innerHTML = '';
    } catch (error) {
        console.error("Error creating new chat:", error);
    }
}

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

    console.log("Updated History UI. Current Chat ID: ", currentChatId);
}

function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = '';

    const chat = conversations[id];
    if (chat && Array.isArray(chat.messages)) {
        chat.messages.forEach(msg => {
            appendMessage(msg.text, msg.sender, false, msg.fileUrl);
        });
    } else {
        console.warn(`No messages found for chat ID: ${id}`);
    }

    console.log("Loaded Chat ID: ", currentChatId);
    updateHistoryUI();
}

function appendMessage(text, sender, save = true, fileUrl = null) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    if (fileUrl) {
        const fileLink = document.createElement('a');
        fileLink.href = fileUrl;
        fileLink.target = '_blank';
        fileLink.textContent = text || fileUrl.split('/').pop();

        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileUrl)) {
             const imgPreview = document.createElement('img');
             imgPreview.src = fileUrl;
             imgPreview.style.maxWidth = '200px';
             imgPreview.style.display = 'block';
             imgPreview.style.marginTop = '5px';
             msgDiv.appendChild(imgPreview);
             if (text) {
                const caption = document.createElement('p');
                caption.textContent = text;
                msgDiv.appendChild(caption);
             } else {
                msgDiv.appendChild(fileLink);
             }

        } else {
            msgDiv.textContent = text ? `${text} (` : '';
            msgDiv.appendChild(fileLink);
            if (text) msgDiv.append(')');

        }
    } else {
        msgDiv.textContent = text;
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) {
        if (currentChatId && conversations[currentChatId] && Array.isArray(conversations[currentChatId].messages)) {
            conversations[currentChatId].messages.push({ text, sender, fileUrl });
        } else {
             console.warn("Could not save message locally: currentChatId or conversation invalid.");
        }
    }
}

async function sendMessageToBackend(text, fileUrl = null) {
    if (!currentChatId) {
        console.error("No current chat ID found.");
        alert("Please select or create a chat before sending a message.");
        return null;
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
                fileUrl: fileUrl
            }),
        });

        if (!response.ok) {
             const errorData = await response.json();
            throw new Error(`Failed to send message: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
         const data = await response.json();
         console.log("Message sent to backend:", data);
         return data;

    } catch (error) {
        console.error("Error sending message:", error);
        appendMessage(`Error: ${error.message}`, "system-error", false);
        return null;
    }
}

async function getGeminiResponse(userText, fileUrl = null) {
    appendMessage("Thinking...", "bot", false);
    const thinkingMsgElement = chatBox.lastChild;

    const backendResponse = await sendMessageToBackend(userText, fileUrl);

     thinkingMsgElement.remove();

    if (backendResponse && backendResponse.reply) {
        appendMessage(backendResponse.reply, "bot", true, backendResponse.fileUrl);
    } else {
        appendMessage("Sorry, I couldn't get a response.", "bot", false);
        console.error("Failed to get response from backend or backend response format incorrect.");
    }
}

sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    let fileUrl = null;

    if (text === "" && !selectedFile) {
        return;
    }

    if (selectedFile) {
        fileUrl = await uploadToCloudinary(selectedFile);
        if (!fileUrl) {
            selectedFile = null;
            fileInput.value = '';
            removeFileInfo();
            return;
        }
        appendMessage(text || selectedFile.name, "user", true, fileUrl);
    } else {
        appendMessage(text, "user", true);
    }

    const messageToSend = text;
    userInput.value = "";
    selectedFile = null;
    fileInput.value = '';
    removeFileInfo();

    await getGeminiResponse(messageToSend, fileUrl);

    updateHistoryUI();
});

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

newChatBtn.addEventListener("click", () => {
    createNewChat();
});

document.addEventListener("DOMContentLoaded", () => {
    fetchChatHistory();
});
