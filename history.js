window.onload = function() {
    const passcode = prompt("Enter the passcode to view chat history");
    if (passcode) {
        const savedChat = JSON.parse(localStorage.getItem(passcode) || '[]');
        const previousChatsDiv = document.getElementById('previous-chats');
        
        if (savedChat.length > 0) {
            savedChat.forEach(msg => {
                previousChatsDiv.innerHTML += `<p>${msg}</p>`;
            });
        } else {
            previousChatsDiv.innerHTML = '<p>No previous chats found.</p>';
        }
    } else {
        alert("Invalid passcode. Redirecting back.");
        window.location.href = 'index.html'; // Redirect to the main page if no passcode is provided
    }
};
