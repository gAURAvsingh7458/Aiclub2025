// Inject Google Script with dynamic client ID if backend serves it
async function initGoogleAuth() {
    try {
        const res = await fetch('/api/auth/client-id');
        if(res.ok) {
            const data = await res.json();
            if (data.clientId) {
                document.getElementById('g_id_onload').setAttribute('data-client_id', data.clientId);
            }
        }
    } catch(e) { console.error('Failed fetching client id', e); }
    
    // Inject Script after setting ID
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', initGoogleAuth);

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if(tab === 'login') {
        document.getElementById('tabLogin').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('tabSignup').classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

// Standard Login
async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const ogText = btn.innerText;
    btn.innerText = 'Logging in...';
    
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('pathpilot_userId', data.id); // For legacy frontend compat
            window.location.href = '/';
        } else {
            showFeedback('loginFeedback', data.error || 'Login failed', 'error');
        }
    } catch(err) {
        showFeedback('loginFeedback', 'Network error', 'error');
    }
    btn.innerText = ogText;
}

// Standard Signup
async function handleSignup(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const ogText = btn.innerText;
    btn.innerText = 'Signing up...';
    
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('signupName').value,
                username: document.getElementById('signupUsername').value,
                password: document.getElementById('signupPassword').value
            })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('pathpilot_userId', data.id); // For legacy frontend compat
            window.location.href = '/';
        } else {
            showFeedback('signupFeedback', data.error || 'Signup failed', 'error');
        }
    } catch(err) {
        showFeedback('signupFeedback', 'Network error', 'error');
    }
    btn.innerText = ogText;
}

// Google OAuth Credential Handler
async function handleCredentialResponse(response) {
    try {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });
        const data = await res.json();
        if(res.ok) {
            localStorage.setItem('pathpilot_userId', data.id);
            if (data.requiresOnboarding) {
                window.location.href = '/onboard.html';
            } else {
                window.location.href = '/';
            }
        } else {
            alert('Google Auth Failed: ' + data.error);
        }
    } catch(e) {
        console.error(e);
        alert('Verification error.');
    }
}

function showFeedback(id, message, type) {
    const el = document.getElementById(id);
    el.innerText = message;
    el.style.color = type === 'error' ? '#ef4444' : '#22c55e';
    setTimeout(() => { el.innerText = ''; }, 4000);
}
