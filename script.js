const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");

let userMessage = null;

let isResponseGenerating = false;


// API setup
const API_KEY  = "AIzaSyAq98ej7zmLk40wK8SfEetqrT082RRspYM"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "Light_mode");
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    // Header visibility logic
    if (savedChats) {
        document.body.classList.add("hide-header");
    } else {
        document.body.classList.remove("hide-header");
    }

    chatList.scrollTo(0, chatList.scrollHeight);
}

loadLocalstorageData();

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        textElement.innerText += (currentWordIndex == 0 ? '' : ' ') + words[currentWordIndex++];
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating=false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatList.innerHTML);
            chatList.scrollTo(0, chatList.scrollHeight);
        }
    }, 75);
}

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: `Answer like a chill tamil bro: ${userMessage}` }]
                }]
            })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        // Accessing the API response safely
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text.replace(/\*\*(.*?)\*\*/g, '$1');

        
        if (apiResponse) {
            console.log(apiResponse);
            showTypingEffect(apiResponse, textElement, incomingMessageDiv);
        } else {
            throw new Error("Invalid API response");
        }
    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
}

// Show loading animation
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
                <img src="./Assets/google-gemini-icon.png" alt="Gemini Image" class="avatar" width="64px">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatList.appendChild(incomingMessageDiv);

    chatList.scrollTo(0, chatList.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done";
    setTimeout(() => copyIcon.innerText = "content_copy", 1000);
}

// Ensure the suggestions are correctly working with updated logic
suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
        userMessage = suggestion.querySelector(".text").innerText.trim();
        handleOutgoingChat();
    });
}); 

const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;

    isResponseGenerating = true;
    const html = `<div class="message-content">
                <img src="./Assets/gigachad.webp" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500);
}

toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "Light_mode" : "Dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure to delete all the chats bro?")) {
        // Clear the chat list from the DOM
        chatList.innerHTML = "";
        
        // Remove chats from local storage
        localStorage.removeItem("savedChats");

        // Reapply the header visibility logic
        document.body.classList.remove("hide-header");
    }
});





typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
