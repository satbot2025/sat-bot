function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value;
    if (!message) return;
    appendMessage('You', message);
    input.value = '';
    fetch('/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message})
    })
    .then(res => res.json())
    .then(data => {
        appendMessage('SAT Bot', data.answer);
    });
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${sender}: ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
