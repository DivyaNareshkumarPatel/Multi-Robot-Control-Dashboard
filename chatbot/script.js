const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const historyList = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat");

let conversations = JSON.parse(localStorage.getItem("chat-history")) || {};
let currentChatId = Object.keys(conversations)[0] || createNewChat();

function createNewChat() {
    const id = Date.now().toString();
    conversations[id] = [];
    updateHistoryUI();
    localStorage.setItem("chat-history", JSON.stringify(conversations));
    chatBox.innerHTML = '';
    return id;
}

function updateHistoryUI() {
    historyList.innerHTML = '';
    const ids = Object.keys(conversations).reverse(); // <-- reverse to show newest first
    ids.forEach(id => {
        const div = document.createElement("div");
        div.classList.add("history-item");
        div.textContent = conversations[id][0]?.text || "New Chat";
        div.onclick = () => loadChat(id);
        historyList.appendChild(div);
    });
}


function loadChat(id) {
    currentChatId = id;
    chatBox.innerHTML = '';
    conversations[id].forEach(msg => {
        appendMessage(msg.text, msg.sender, false);
    });
}

function appendMessage(text, sender, save = true) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) {
        conversations[currentChatId].push({ text, sender });
        localStorage.setItem("chat-history", JSON.stringify(conversations));
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
            },
            body: JSON.stringify({ message: userText, chatId: currentChatId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        thinkingMsgElement.remove();
        appendMessage(data.reply, "bot");

    } catch (error) {
        console.error("Error fetching bot reply:", error);
        thinkingMsgElement.textContent = "Sorry, I couldn't get a response.";
    }
}

sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (text !== "") {
        appendMessage(text, "user");
        userInput.value = "";
        await getGeminiResponse(text);
    }
});

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});

newChatBtn.addEventListener("click", () => {
    currentChatId = createNewChat();
});
