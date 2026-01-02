
// Create and inject CSS for login overlay
const loginStyles = document.createElement('style');
loginStyles.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

    #login-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #2a0845 0%, #6441A5 50%, #fe3b3b 100%);
        background-size: 400% 400%;
        animation: gradientBG 15s ease infinite;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        font-family: 'Inter', sans-serif;
        color: white;
    }

    @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    .login-container {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        text-align: center;
        max-width: 400px;
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.18);
    }

    .login-title {
        font-size: 2.5em;
        font-weight: 800;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .input-group {
        margin-bottom: 20px;
        text-align: left;
    }

    .input-label {
        font-size: 0.9em;
        margin-bottom: 8px;
        display: block;
        opacity: 0.8;
    }

    .login-input {
        width: 100%;
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        font-size: 1.1em;
        outline: none;
        transition: all 0.3s ease;
        box-sizing: border-box; 
    }

    .login-input:focus {
        border-color: #fe3b3b;
        background: rgba(255, 255, 255, 0.15);
    }

    .login-btn {
        width: 100%;
        padding: 14px;
        background: white;
        color: #6441A5;
        border: none;
        border-radius: 8px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        background: #f0f0f0;
    }
    
    .hidden {
        display: none !important;
    }

    .error-msg {
        color: #ff6b6b;
        font-size: 0.9em;
        margin-top: 10px;
        min-height: 20px;
    }
`;
document.head.appendChild(loginStyles);

// Create Login DOM Elements
const loginOverlay = document.createElement('div');
loginOverlay.id = 'login-overlay';
loginOverlay.innerHTML = `
    <div class="login-container">
        <h1 class="login-title">Radius Raid</h1>
        <div class="input-group">
            <label class="input-label" for="username">Pilot Name</label>
            <input type="text" id="username" class="login-input" placeholder="Enter your alias" autocomplete="off">
        </div>
        <button id="google-login-btn" class="login-btn">
            Login with Google
        </button>
        <div id="login-error" class="error-msg"></div>
    </div>
`;
document.body.appendChild(loginOverlay);

// Login Logic
document.addEventListener('DOMContentLoaded', () => {
    const errorMsg = document.getElementById('login-error');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.getElementById('google-login-btn');

    // Check auth state from SupabaseClient
    // We poll initially to see if user is already signed in (e.g. from redirect)

    const checkAuth = setInterval(() => {
        if (typeof SupabaseClient !== 'undefined' && SupabaseClient.user) {
            // User is logged in
            clearInterval(checkAuth);
            loginOverlay.classList.add('hidden');
            // If we have a username input but user is already logged in, 
            // we might want to ensure they have a profile. 
            // For now, if logged in, we let them play.

            // Start the game if it hasn't started or unpause it?
            // The game initializes in game.js. We might need to coordinate.
            // Currently game.js starts immediately. We should probably pause it or
            // wrap the init in a function that we call here. 
            // BUT, for now let's just use the overlay to block view.
        }
    }, 500);

    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();

        if (username.length < 3) {
            errorMsg.textContent = "Username must be at least 3 characters.";
            return;
        }

        // Store partial username in local storage temporarily to save after redirect?
        // Or better, we can modify the auth flow.
        // But since Google auth redirects, we lose memory state.
        // We can use the 'queryParams' or local storage to persist the desired username.
        localStorage.setItem('pending_username', username);

        await SupabaseClient.signInWithGoogle();
    });

    // Handle return from redirect
    // If we are logged in and have a pending username, save it.
    const handlePostLogin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const pendingUsername = localStorage.getItem('pending_username');
            if (pendingUsername) {
                await SupabaseClient.signInWithUsername(pendingUsername);
                localStorage.removeItem('pending_username');
            }
            loginOverlay.classList.add('hidden');
        }
    };

    // Call immediately in case we just came back
    handlePostLogin();
});
