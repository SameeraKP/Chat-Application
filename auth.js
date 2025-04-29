document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn, .auth-form')
                .forEach(el => el.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Form')
                .classList.add('active');
        });
    });

    // Login Form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const passcode = document.getElementById('loginPasscode').value.trim();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passcode }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            showMessage('Login successful! Redirecting...', 'success');
            sessionStorage.setItem('username', username);
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
            
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Signup Form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const passcode = document.getElementById('signupPasscode').value.trim();
        const confirmPasscode = document.getElementById('confirmPasscode').value.trim();

        if (passcode !== confirmPasscode) {
            showMessage('Passcodes do not match!', 'error');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passcode }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            showMessage('Account created successfully!', 'success');
            setTimeout(() => document.querySelector('[data-tab="login"]').click(), 1000);
            
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    function showMessage(message, type) {
        const msgElement = document.getElementById('authMessage');
        msgElement.textContent = message;
        msgElement.className = `message ${type}`;
    }
});
