// script.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authMessage = document.getElementById('authMessage');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // Function to switch tabs
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .auth-form').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Form').classList.add('active');
            authMessage.textContent = ''; // Clear any previous messages
            authMessage.className = 'message';
        });
    });

    // Function to store user credentials
    function storeCredentials(username, passcode) {
        localStorage.setItem('users', JSON.stringify({
            ...JSON.parse(localStorage.getItem('users') || '{}'),
            [username]: passcode
        }));
    }

    // Handle signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const passcode = document.getElementById('signupPasscode').value.trim();
        const confirmPasscode = document.getElementById('confirmPasscode').value.trim();

        if (passcode !== confirmPasscode) {
            authMessage.textContent = 'Passcodes do not match!';
            authMessage.className = 'message error';
            return;
        }

        if (!username || !passcode) {
            authMessage.textContent = 'Please enter a username and passcode.';
            authMessage.className = 'message error';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            authMessage.textContent = 'Username already exists. Please choose another.';
            authMessage.className = 'message error';
            return;
        }

        storeCredentials(username, passcode);
        authMessage.textContent = 'Account created successfully! Please log in.';
        authMessage.className = 'message success';
        setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
        }, 1500);
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const passcode = document.getElementById('loginPasscode').value.trim();

        if (!username || !passcode) {
            authMessage.textContent = 'Please enter your username and passcode.';
            authMessage.className = 'message error';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username] === passcode) {
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('passcode', passcode);
            authMessage.textContent = 'Login successful! Redirecting to dashboard...';
            authMessage.className = 'message success';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            authMessage.textContent = 'Invalid username or passcode.';
            authMessage.className = 'message error';
        }
    });
});