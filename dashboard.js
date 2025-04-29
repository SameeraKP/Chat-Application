document.addEventListener('DOMContentLoaded', () => {
    const username = sessionStorage.getItem('username');
    if (!username) {
        window.location.href = '/';
        return;
    }

    // Set user info
    document.getElementById('usernameDisplay').textContent = username;
    document.getElementById('userAvatar').textContent = username.charAt(0).toUpperCase();

    // Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.getElementById(btn.dataset.section + 'Section').classList.add('active');
        });
    });

    // Verify Passcode
    document.getElementById('verifyPasscode').addEventListener('click', async () => {
        const passcode = document.getElementById('dashboardPasscode').value.trim();
        
        try {
            const response = await fetch('/api/verify-passcode', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ passcode }),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            showPasscodeMessage('Verified!', 'success');
            document.getElementById('passcodeSection').classList.remove('active');
            document.getElementById('chatSection').classList.add('active');
            
        } catch (error) {
            showPasscodeMessage(error.message, 'error');
        }
    });

    // Load Users
    async function loadUsers() {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });
            
            const users = await response.json();
            
            const userList = document.getElementById('userList');
            userList.innerHTML = users
                .filter(u => u.username !== username)
                .map(user => `
                    <div class="user-card" data-username="${user.username}">
                        <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
                        <div class="user-info">
                            <div class="username">${user.username}</div>
                            <div class="status offline">Offline</div>
                        </div>
                        <button class="message-btn">Message</button>
                    </div>
                `).join('');
                
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            sessionStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Initial Load
    loadUsers();
});
