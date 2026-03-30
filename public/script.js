document.addEventListener('DOMContentLoaded', () => {
    // Top Stats elements
    const totalHoursStat = document.getElementById('totalHoursStat');
    const focusPointsStat = document.getElementById('focusPointsStat');
    const streakCountStat = document.getElementById('streakCountStat');
    
    // Forms
    const createUserForm = document.getElementById('createUserForm');
    const createLogForm = document.getElementById('createLogForm');
    const userStatus = document.getElementById('userStatus');
    const logStatus = document.getElementById('logStatus');
    
    // Search & Buttons
    const logSearchInput = document.getElementById('logSearchInput');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const themeToggle = document.getElementById('themeToggle');
    const userReminderToggle = document.getElementById('userReminderToggle');
    
    // Tables
    const logsTableBody = document.querySelector('#logsTable tbody');
    const leaderboardTableBody = document.querySelector('#leaderboardTable tbody');

    // SPA Routing
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                e.preventDefault();
                navLinks.forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(tab => {
                    tab.classList.remove('active');
                    tab.style.display = 'none';
                });
                const targetTab = document.getElementById(targetId);
                if (targetTab) {
                    targetTab.classList.add('active');
                    targetTab.style.display = 'block';
                }
                if (targetId === 'market-section') fetchMarketUpdates();
            }
        });
    });

    // Community Feed Logic
    async function fetchCommunityFeed() {
        const feedContainer = document.getElementById('communityFeedContainer');
        const activePeersAlert = document.getElementById('activePeersAlert');
        const activePeersText = document.getElementById('activePeersText');
        try {
            const res = await fetch('http://localhost:3000/api/community-feed');
            if (res.ok) {
                const data = await res.json();
                
                // Update Peer Alert
                if (activePeersAlert && activePeersText) {
                    const peerCount = data.length > 5 ? data.length + Math.floor(Math.random() * 10) : data.length; // Fake scale for feel if too low
                    if (data.length > 0) {
                        activePeersAlert.style.display = 'block';
                        activePeersText.textContent = `${peerCount} peers are studying right now. Don't fall behind!`;
                    }
                }

                // Update UI Feed
                if (!feedContainer) return;
                feedContainer.innerHTML = '';
                if (data.length === 0) {
                    feedContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No peer activity yet.</div>';
                    return;
                }

                data.forEach((log, i) => {
                    const card = document.createElement('div');
                    card.className = 'community-card';
                    card.style.animationDelay = `${i * 0.05}s`;
                    card.innerHTML = `
                        <div class="community-info">
                            <p>A <strong style="color: var(--lavender);">${log.year || 'Fellow'}</strong> student is currently mastering: <span style="color: var(--cyan);">${log.task}</span></p>
                            <span>Live Feed</span>
                        </div>
                        <div class="btn-wrapper" title="Upgrade to Premium to form study groups with these peers">
                            <button class="btn btn-outline btn-blurred" onclick="event.preventDefault();">Connect</button>
                        </div>
                    `;
                    feedContainer.appendChild(card);
                });
            }
        } catch(e) {
            console.error('Failed to fetch community feed', e);
        }
    }
    
    // Poll every 5 minutes (300000ms)
    setInterval(fetchCommunityFeed, 300000);

    // Initial Fetch call
    fetchCommunityFeed();

    // Wrapper User Actions
    window.triggerPaymentGateway = async function() {
        alert("Redirecting to Secure Payment Gateway...");
        if (!currentUserId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${currentUserId}/upgrade`, { method: 'PUT' });
            if (res.ok) {
                setTimeout(() => {
                    alert("Payment Successful! Welcome to PathPilot Pro.");
                    window.location.reload();
                }, 1000);
            }
        } catch (e) { console.error('Upgrade request failed', e); }
    };

    // Market Updates Fetch
    async function fetchMarketUpdates() {
        const feed = document.getElementById('marketNewsFeed');
        if (!feed || feed.dataset.loaded === "true") return; // Cache locally

        // Enforce Premium Tier restrictions
        if (currentDashboardState?.userProfile && currentDashboardState.userProfile.tier !== 'Pro') {
            feed.innerHTML = `
                <div style="text-align: center; padding: 5rem 2rem; color: var(--text-muted); background: var(--card-bg); border-radius: 16px; border: 1px solid var(--border);">
                    <i data-lucide="lock" style="width: 48px; height: 48px; margin-bottom: 1rem; color: #f59e0b;"></i>
                    <h2 style="color: #f8fafc; font-size: 1.5rem; margin-bottom: 0.5rem;">Premium Feature Locked</h2>
                    <p style="margin: 0.5rem 0 1.5rem; font-size: 1.1rem;">Upgrade your workspace strictly to access real-time AI Market Alerts functionally mapped via Backend models natively.</p>
                    <button class="btn btn-glow" onclick="document.querySelector('[data-target=\\'premium-section\\']').click()">Join Pro</button>
                </div>
            `;
            if(window.lucide) window.lucide.createIcons();
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/api/market-updates');
            if (res.ok) {
                const data = await res.json();
                feed.innerHTML = '';
                
                // Style as Canva "Design Templates" Grid
                feed.style.display = 'grid';
                feed.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
                feed.style.gap = '1.5rem';
                
                const gradients = [
                    'linear-gradient(135deg, #FF9A9E, #FECFEF)',
                    'linear-gradient(135deg, #A18CD1, #FBC2EB)',
                    'linear-gradient(135deg, #84FAB0, #8FD3F4)'
                ];
                
                data.forEach((article, i) => {
                    const doc = document.createElement('div');
                    doc.className = 'card animate-slide-in';
                    doc.style.animationDelay = `${i * 0.1}s`;
                    doc.style.overflow = 'hidden';
                    doc.style.display = 'flex';
                    doc.style.flexDirection = 'column';
                    
                    const g = gradients[i % gradients.length];
                    
                    doc.innerHTML = `
                        <div style="height: 120px; background: ${g}; position: relative;">
                            <span style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;">PRIORITY HIGH</span>
                        </div>
                        <div style="padding: 1.5rem;">
                            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-main); line-height: 1.3;">${article.title}</h3>
                            <p style="font-size: 0.9rem; color: var(--text-muted);">${article.description}</p>
                        </div>
                    `;
                    feed.appendChild(doc);
                });
                feed.dataset.loaded = "true";
            }
        } catch (e) {
            feed.innerHTML = `<div style="color: #ef4444; padding: 2rem; text-align: center;">Could not load market trends at this time. Backend AI proxy may be offline.</div>`;
        }
    }

    // Moods map
    const moodEmojiMap = {
        stuck: '😫 Stuck',
        okay: '😐 Okay',
        good: '🙂 Good',
        great: '🚀 Great'
    };

    let currentUserId = localStorage.getItem('pathpilot_userId');
    if (!currentUserId && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
        return;
    }
    let currentDashboardState = null;
    let topMarketSkill = "Generative AI"; // Initial fallback

    // Fetch market skill globally on load
    async function fetchTopMarketSkill() {
        try {
            const res = await fetch('http://localhost:3000/api/market-updates');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) topMarketSkill = data[0].title;
            }
        } catch(e) {
            console.error("Failed to fetch market skill for status card.");
        }
    }
    fetchTopMarketSkill();

    // Fetch and Set Quote Background
    async function fetchQuoteBackground() {
        const bgEl = document.getElementById('quoteBackground');
        if (!bgEl) return;
        const images = [
            'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop'
        ];
        const randomImgUrl = images[Math.floor(Math.random() * images.length)];
        bgEl.style.backgroundImage = `url('${randomImgUrl}')`;
    }
    fetchQuoteBackground();

    // Motivational Quote Fetch
    async function fetchQuote() {
        const quoteTextEl = document.getElementById('quoteText');
        const quoteAuthorEl = document.getElementById('quoteAuthor');
        if (!quoteTextEl || !quoteAuthorEl) return;
        try {
            const response = await fetch('https://zenquotes.io/api/random');
            if (!response.ok) throw new Error('API down');
            const data = await response.json();
            if (data && data.length > 0 && data[0].q) {
                quoteTextEl.textContent = `"${data[0].q}"`;
                quoteAuthorEl.textContent = `— ${data[0].a}`;
            } else throw new Error();
        } catch (error) {
            quoteTextEl.textContent = '"The future belongs to those who believe in the beauty of their dreams."';
            quoteAuthorEl.textContent = '— Eleanor Roosevelt';
        }
    }
    fetchQuote();

    // Theme logic
    // Light is the default. Dark is opt-in via saved preference.
    const savedTheme = localStorage.getItem('pathpilot_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggle) themeToggle.textContent = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeToggle) themeToggle.textContent = '🌙 Dark Mode';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            localStorage.setItem('pathpilot_theme', isDark ? 'dark' : 'light');
            // Re-initialise Lucide so SVG icons pick up new CSS var colours
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Helper: Progress Ring SVG
    const getProgressRing = (hours) => {
        const targetHours = 8;
        let percent = (hours / targetHours) * 100;
        if (percent > 100) percent = 100;
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const dashoffset = circumference - (percent / 100) * circumference;

        return `
        <div class="progress-ring-container" title="${hours} hours">
            <svg class="progress-ring" width="40" height="40">
                <circle class="progress-ring__circle bg" stroke="var(--border)" stroke-width="4" fill="transparent" r="${radius}" cx="20" cy="20"/>
                <circle class="progress-ring__circle" stroke="var(--cyan)" stroke-width="4" fill="transparent" r="${radius}" cx="20" cy="20" style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${dashoffset};"/>
            </svg>
            <div class="progress-text">${hours}h</div>
        </div>
        `;
    };

    // User Creation
    if (createUserForm) {
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = {
                name: document.getElementById('userName').value,
                year: document.getElementById('userYear').value,
                goal: document.getElementById('userGoal').value,
                focus: document.getElementById('userFocus').value,
                joinedAt: new Date().toISOString()
            };
            try {
                const res = await fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });
                const data = await res.json();
                if (data.id) {
                    currentUserId = data.id;
                    localStorage.setItem('pathpilot_userId', currentUserId);
                    userStatus.textContent = `Profile saved! (ID: ${currentUserId})`;
                    userStatus.style.color = 'var(--cyan)';
                    createUserForm.reset();
                    fetchDashboardData(currentUserId);
                } else throw new Error(data.error || 'Failed to create user');
            } catch (error) {
                userStatus.textContent = error.message;
                userStatus.style.color = '#ef4444';
            }
        });
    }

    // Log Creation
    if (createLogForm) {
        createLogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUserId) {
                logStatus.textContent = 'Please setup your profile first.';
                logStatus.style.color = '#ef4444';
                return;
            }
            const log = {
                userId: currentUserId,
                date: new Date().toISOString().split('T')[0],
                studied: true,
                task: document.getElementById('logTask').value,
                focus: document.getElementById('logFocus').value,
                hours: parseFloat(document.getElementById('logHours').value),
                mood: document.getElementById('logMood').value,
                doubts: document.getElementById('logDoubts').value
            };
            try {
                const res = await fetch('http://localhost:3000/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(log)
                });
                const data = await res.json();
                if (res.ok) {
                    logStatus.textContent = 'Log added securely.';
                    logStatus.style.color = 'var(--cyan)';
                    createLogForm.reset();
                    fetchDashboardData(currentUserId);
                    setTimeout(() => { logStatus.textContent = ''; }, 3000);
                } else throw new Error(data.error);
            } catch (error) {
                logStatus.textContent = error.message;
                logStatus.style.color = '#ef4444';
            }
        });
    }

    // Export PDF
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            if (!currentDashboardState || !currentDashboardState.userProfile) {
                alert('No sufficient data parsed locally to generate the report.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const state = currentDashboardState;
            doc.setFontSize(22);
            doc.setTextColor(15, 23, 42);
            doc.text("PathPilot Study Report", 14, 20);
            doc.setFontSize(12);
            doc.setTextColor(51, 65, 85);
            doc.text(`User: ${state.userProfile.name || 'Anonymous'}`, 14, 30);
            doc.text(`Goal: ${state.userProfile.goal || 'No goal set'}`, 14, 38);
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(`Total Focus Score: ${state.focusPoints} pts`, 14, 52);
            doc.text(`Total Hours Studied: ${state.totalHours} hrs`, 14, 60);
            const tableData = state.logs.map(log => [
                new Date(log.date).toLocaleDateString(),
                log.focus || '-',
                log.task || '-',
                `${log.hours}`,
                log.mood ? (moodEmojiMap[log.mood] || log.mood) : '-'
            ]);
            doc.autoTable({
                startY: 68,
                head: [['Date', 'Focus', 'Task', 'Hours', 'Mood']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [6, 182, 212] }
            });
            doc.save(`PathPilot_Report_${state.userProfile.name || 'User'}.pdf`);
        });
    }

    // Search Logs
    if (logSearchInput) {
        logSearchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            if (!currentUserId) return;
            try {
                let url = `http://localhost:3000/api/logs/${currentUserId}`;
                if (query) url = `http://localhost:3000/api/logs/search/${currentUserId}?query=${encodeURIComponent(query)}`;
                const res = await fetch(url);
                if (res.ok) {
                    const searchedLogs = await res.json();
                    const sortedSearchedLogs = [...searchedLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
                    logsTableBody.innerHTML = '';
                    if (sortedSearchedLogs.length === 0) {
                        logsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No logs match.</td></tr>`;
                        return;
                    }
                    sortedSearchedLogs.forEach((log, index) => {
                        const tr = document.createElement('tr');
                        tr.style.animationDelay = `${index * 0.05}s`;
                        tr.innerHTML = `
                            <td>${new Date(log.date).toLocaleDateString()}</td>
                            <td>${log.focus || '-'}</td>
                            <td>${log.task || '-'}</td>
                            <td style="text-align: center;">${getProgressRing(log.hours)}</td>
                            <td style="text-align: center;">
                                <span class="mood-tag ${log.mood === 'great' || log.mood === 'good' ? 'mood-great' : log.mood === 'stuck' ? 'mood-stuck' : 'mood-okay'}">
                                    ${moodEmojiMap[log.mood] || log.mood || '-'}
                                </span>
                            </td>
                            <td>${log.doubts || '-'}</td>
                        `;
                        logsTableBody.appendChild(tr);
                    });
                }
            } catch (error) { console.error("Search API Error:", error); }
        });
    }

    // Core Fetch Flow
    async function fetchDashboardData(userId) {
        try {
            let userProfile = null;
            const userRes = await fetch(`http://localhost:3000/api/users/${userId}`);
            if (userRes.ok) userProfile = await userRes.json();
            
            const logsRes = await fetch(`http://localhost:3000/api/logs/${userId}`);
            if (logsRes.ok) {
                const logs = await logsRes.json();
                renderDashboard(logs, userProfile);
            }
            await fetchLeaderboard();
            
            const moodRes = await fetch(`http://localhost:3000/api/mood-stats/${userId}`);
            if (moodRes.ok) {
                const moodStats = await moodRes.json();
                renderMoodInsights(moodStats);
            }

            // Secure explicit market alert sync
            fetchMarketUpdates();
        } catch (error) { console.error('Dashboard Fetch failed:', error); }
    }

    // Mood insight injection
    function renderMoodInsights(stats) {
        const insightsCard = document.getElementById('insightsCard');
        const moodInsightText = document.getElementById('moodInsightText');
        if (!insightsCard || !moodInsightText) return;
        if (!stats || stats.length === 0) return;
        const topMood = stats[0];
        if (topMood && topMood.avg_hours > 0) {
            insightsCard.style.display = 'inline-block';
            moodInsightText.innerHTML = `Most productive mood: <span style="background: rgba(139,92,246,0.2); padding: 0.15rem 0.5rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; transform: translateY(2px);">${moodEmojiMap[topMood.mood] || topMood.mood}</span> averaging ${Number(topMood.avg_hours).toFixed(1)} hrs/session.`;
        }
    }

    // Leaderboard Injection
    async function fetchLeaderboard() {
        try {
            const res = await fetch(`http://localhost:3000/api/leaderboard`);
            if (res.ok) {
                const leaderboard = await res.json();
                if (!leaderboardTableBody) return;
                leaderboardTableBody.innerHTML = '';
                if (leaderboard.length === 0) {
                    leaderboardTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Empty</td></tr>`;
                    return;
                }
                leaderboard.forEach((user, index) => {
                    const tr = document.createElement('tr');
                    if (index === 0) tr.classList.add('rank-1');
                    else if (index === 1) tr.classList.add('rank-2');
                    else if (index === 2) tr.classList.add('rank-3');
                    const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
                    tr.style.animationDelay = `${index * 0.1}s`;
                    tr.innerHTML = `
                        <td style="font-weight: 600; text-align: center;">${rankIcon}</td>
                        <td style="font-weight: 500;">${user.name || 'Anonymous'}</td>
                        <td style="text-align: center;"><span style="font-weight: 600; color: var(--cyan);">${user.total_hours}h</span></td>
                    `;
                    leaderboardTableBody.appendChild(tr);
                });
            }
        } catch (e) { console.error('Leaderboard Fetch failed', e); }
    }

    // Wrapper Notification Function
    function sendStudyReminder(message) {
        if (Notification.permission === 'granted') {
            new Notification('PathPilot Reminder', { body: message });
        } else {
            console.log("Notification: " + message);
        }
    }

    // Smart 8:00 PM Active Watcher
    setInterval(() => {
        if (!currentUserId || !currentDashboardState) return;
        const state = currentDashboardState;
        const now = new Date();
        if (now.getHours() === 20 && now.getMinutes() === 0) {
            const todayISO = now.toISOString().split('T')[0];
            const studiedToday = state.logs.some(log => log.date.startsWith(todayISO) && log.studied);
            const notifiedDate = localStorage.getItem(`pathpilot_notified_${currentUserId}`);
            if (!studiedToday && notifiedDate !== todayISO) {
                sendStudyReminder(`Don't break your streak, ${state.userProfile?.name || 'there'}! Log your study session now.`);
                localStorage.setItem(`pathpilot_notified_${currentUserId}`, todayISO);
            }
        }
    }, 60000);

    // Profile Reminder Toggle
    if (userReminderToggle) {
        userReminderToggle.addEventListener('change', () => {
            if (currentUserId) {
                localStorage.setItem(`pathpilot_reminder_${currentUserId}`, userReminderToggle.checked);
            }
        });
    }

    // Pomodoro Logic
    let timerInterval = null;
    let timeRemaining = 25 * 60; // 25 mins
    let isStudyMode = true;

    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerBtn = document.getElementById('startTimerBtn');
    const breakTimerBtn = document.getElementById('breakTimerBtn');
    const resetTimerBtn = document.getElementById('resetTimerBtn');

    function updateTimerDisplay() {
        if (!timerDisplay) return;
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Update circular ring
        const ring = document.getElementById('timerProgressRing');
        if (ring) {
            const total = isStudyMode ? 25 * 60 : 5 * 60;
            const progress = timeRemaining / total;
            const circumference = 2 * Math.PI * 70; // r=70
            ring.style.strokeDasharray = `${circumference}`;
            ring.style.strokeDashoffset = circumference - (progress * circumference);
        }
    }

    function timerComplete() {
        clearInterval(timerInterval);
        timerInterval = null;

        if (isStudyMode) {
            const focusContext = currentDashboardState?.userProfile?.focus || 'progress';
            sendStudyReminder(`Session Complete! Time to log your ${focusContext} progress.`);

            // Auto switch to study tracker
            const targetId = 'study-section';
            navLinks.forEach(nav => nav.classList.remove('active'));
            const targetNav = document.querySelector(`.nav-link[data-target="${targetId}"]`);
            if (targetNav) targetNav.classList.add('active');
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                tab.style.display = 'none';
            });
            const targetTab = document.getElementById(targetId);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.style.display = 'block';
            }
            
            // Auto-fill hours with 0.45
            const logHours = document.getElementById('logHours');
            if (logHours) {
                logHours.value = 0.45;
                logHours.focus();
            }
        }
    }

    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', () => {
            if (Notification.permission && Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
            isStudyMode = true;
            if (timeRemaining === 5 * 60) timeRemaining = 25 * 60; // reset to 25 if switching
            if (timerInterval) clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                if (timeRemaining <= 0) timerComplete();
            }, 1000);
        });
    }

    if (breakTimerBtn) {
        breakTimerBtn.addEventListener('click', () => {
             if (Notification.permission && Notification.permission !== "granted" && Notification.permission !== "denied") {
                 Notification.requestPermission();
             }
             isStudyMode = false;
             timeRemaining = 5 * 60;
             if (timerInterval) clearInterval(timerInterval);
             timerInterval = setInterval(() => {
                 timeRemaining--;
                 updateTimerDisplay();
                 if (timeRemaining <= 0) timerComplete();
             }, 1000);
        });
    }

    if (resetTimerBtn) {
        resetTimerBtn.addEventListener('click', () => {
             if (timerInterval) clearInterval(timerInterval);
             timeRemaining = isStudyMode ? 25 * 60 : 5 * 60;
             updateTimerDisplay();
        });
    }

    // =============================================
    // COMMUNITY CHAT ENGINE (SOCKET.IO)
    // =============================================
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatPeersCount = document.getElementById('chatPeersCount');
    let socket = null;

    window.initSocket = function() {
        if (!window.io) return;
        socket = io();

        socket.on('presence_update', (data) => {
            updatePeersOnlineUI();
        });

        socket.on('receive_message', (msg) => {
            appendChatMessage(msg);
        });
    };

    function updatePeersOnlineUI() {
        if (!chatPeersCount) return;
        const peers = Math.floor(Math.random() * 8) + 3; // 3 to 10
        chatPeersCount.textContent = peers;
    }
    updatePeersOnlineUI();

    function appendChatMessage(msg) {
        if (!chatMessagesContainer) return;

        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const initials = msg.name ? msg.name.substring(0, 2).toUpperCase() : 'ST';
        const avatarHtml = msg.picture 
            ? `<img src="${msg.picture}" class="chat-msg-avatar" alt="Avatar">` 
            : `<div class="chat-msg-avatar">${initials}</div>`;
        
        const row = document.createElement('div');
        row.className = `chat-message-row animate-slide-in`;
        row.style.animationDuration = '0.2s';
        
        row.innerHTML = `
            <div class="chat-msg-avatar-col">
                ${avatarHtml}
                <div class="presence-dot online"></div>
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-header">
                    <span class="chat-msg-author">${msg.name || msg.username || 'Student'}</span>
                    <span class="chat-msg-time">${timeStr}</span>
                </div>
                <div class="chat-msg-text">${msg.text.replace(/\\n/g, '<br>')}</div>
            </div>
        `;
        chatMessagesContainer.appendChild(row);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    function handleSendChatMessage() {
        if (!chatInput || !socket) return;
        const text = chatInput.value.trim();
        if (!text || !currentUserId) return;
        
        socket.emit('send_message', { text });
        chatInput.value = '';
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', handleSendChatMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChatMessage();
            }
        });
    }

    // Dashboard Engine

    function renderDashboard(logs, userProfile) {
        logsTableBody.innerHTML = '';
        
        let totalFocusPoints = 0;
        let studyStreak = 0;
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
        const totalHours = logs.reduce((acc, log) => acc + log.hours, 0);

        if (logs.length > 0) {
            // Focus points
            if (userProfile && userProfile.focus) {
                const userRef = userProfile.focus.trim().toLowerCase();
                logs.forEach(log => {
                    if (log.focus && log.focus.trim().toLowerCase() === userRef) totalFocusPoints += 10;
                });
            }
            // Study streak
            const today = new Date(); today.setHours(0,0,0,0);
            const firstLogDate = new Date(sortedLogs[0].date); firstLogDate.setHours(0,0,0,0);
            if (Math.floor((today - firstLogDate) / 86400000) <= 1) {
                let expectedDate = new Date(firstLogDate);
                for (let i = 0; i < sortedLogs.length; i++) {
                    const log = sortedLogs[i];
                    if (log.studied === false) break;
                    const logDay = new Date(log.date); logDay.setHours(0,0,0,0);
                    if (logDay.getTime() === expectedDate.getTime()) {
                        studyStreak++;
                        expectedDate.setDate(expectedDate.getDate() - 1);
                    } else if (logDay.getTime() < expectedDate.getTime()) break;
                }
            }
        }

        // Cache state
        currentDashboardState = { userProfile, logs: sortedLogs, focusPoints: totalFocusPoints, totalHours };

        // Handle Chat Profile Guard
        const chatProfileOverlay = document.getElementById('chatProfileOverlay');
        if (chatProfileOverlay) {
            chatProfileOverlay.style.display = 'none';
        }

        // Update Mission Control Header
        const missionControlSub = document.getElementById('missionControlSub');
        if (userProfile && missionControlSub) {
            missionControlSub.textContent = `Target: ${userProfile.goal || 'TBD'} | Status: ${userProfile.confidence || 0}% Ready`;
        }

        // Handle Reminder Alert
        const reminderAlert = document.getElementById('reminderAlert');
        const reminderAlertText = document.getElementById('reminderAlertText');
        const isReminderEnabled = localStorage.getItem(`pathpilot_reminder_${currentUserId}`) === 'true';

        if (userReminderToggle) userReminderToggle.checked = isReminderEnabled;

        if (reminderAlert && userProfile && isReminderEnabled) {
            const currentHour = new Date().getHours();
            if (currentHour >= 20) {
                const todayStr = new Date().toLocaleDateString();
                const studiedToday = sortedLogs.some(log => {
                    return new Date(log.date).toLocaleDateString() === todayStr && log.studied;
                });
                if (!studiedToday) {
                    reminderAlert.style.display = 'block';
                    reminderAlertText.innerHTML = `Hey ${userProfile.name || 'there'}, your goal for this year is <strong>${userProfile.goal || 'greatness'}</strong>. Don't break your streak today!`;
                } else {
                    reminderAlert.style.display = 'none';
                }
            } else {
                reminderAlert.style.display = 'none';
            }
        } else if (reminderAlert) {
            reminderAlert.style.display = 'none';
        }
        
        // Update Journey Status Card
        const journeyStatusCard = document.getElementById('journeyStatusCard');
        const journeyGoalText = document.getElementById('journeyGoalText');
        const journeySubText = document.getElementById('journeySubText');

        if (userProfile && journeyStatusCard) {
            journeyStatusCard.style.display = 'block';
            journeyGoalText.textContent = `PathPilot: Your Journey to ${userProfile.goal || 'Success'}`;
            journeySubText.innerHTML = `You have logged <span style="color: var(--cyan); font-weight: 600;">${totalHours} hours</span> toward mastering <span style="color: var(--lavender); font-weight: 600;">${userProfile.focus || 'your skills'}</span>. The market is currently trending toward <span style="color: #f59e0b; font-weight: 600;">${topMarketSkill}</span>.`;
        }

        // Update UI Stats
        if (totalHoursStat) totalHoursStat.innerHTML = `${totalHours} <span class="unit">h</span>`;
        if (focusPointsStat) focusPointsStat.innerHTML = `${totalFocusPoints} <span class="unit">pts</span>`;
        if (streakCountStat) streakCountStat.innerHTML = `${studyStreak} <span class="unit">🔥</span>`;

        if (logs.length === 0) {
            logsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No logs documented yet.</td></tr>`;
            return;
        }

        // Render Table
        sortedLogs.forEach((log, index) => {
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${index * 0.05}s`;
            tr.innerHTML = `
                <td>${new Date(log.date).toLocaleDateString()}</td>
                <td>${log.focus || '-'}</td>
                <td>${log.task || '-'}</td>
                <td style="text-align: center;">${getProgressRing(log.hours)}</td>
                <td style="text-align: center; font-size: 1.25rem;">${moodEmojiMap[log.mood] || log.mood || '-'}</td>
                <td>${log.doubts || '-'}</td>
            `;
            logsTableBody.appendChild(tr);
        });
    }

    // Secure Session Validation & UI Construction
    async function verifySessionAndInitProfile() {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const user = await res.json();
                if (user.requiresOnboarding) {
                    window.location.href = '/onboard.html';
                    return;
                }
                currentUserId = user.id;
                userStatus.textContent = `Session Verified`;
                userStatus.style.color = 'var(--cyan)';
                
                if (window.initSocket) window.initSocket();
                
                const profileWidget = document.getElementById('profileWidget');
                if (profileWidget) {
                    const initials = (user.name || 'S').substring(0, 2).toUpperCase();
                    const avatarSrc = user.picture ? `<img src="${user.picture}" class="profile-avatar" alt="Avatar">` : `<div class="profile-avatar">${initials}</div>`;
                    const drpAvatarSrc = user.picture ? `<img src="${user.picture}" class="dropdown-avatar" alt="Avatar">` : `<div class="dropdown-avatar">${initials}</div>`;
                    const firstName = user.name ? user.name.split(' ')[0] : 'Student';
                    
                    profileWidget.innerHTML = `
                        <button class="profile-btn" id="profileDropdownBtn">
                            ${avatarSrc}
                            <span class="profile-name">${firstName}</span>
                        </button>
                        <div class="profile-dropdown" id="profileDropdownMenu">
                            <div class="dropdown-user-info">
                                ${drpAvatarSrc}
                                <div class="dropdown-text">
                                    <h4>${user.name || 'Anonymous Student'}</h4>
                                    <p>${user.email || user.username || 'No email provided'}</p>
                                </div>
                            </div>
                            <button class="dropdown-logout-btn" id="logoutBtn">
                                <i data-lucide="log-out" style="width: 16px; height: 16px;"></i> Log Out
                            </button>
                        </div>
                    `;
                    
                    document.getElementById('profileDropdownBtn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        document.getElementById('profileDropdownMenu').classList.toggle('open');
                    });
                    
                    document.addEventListener('click', (e) => {
                        const menu = document.getElementById('profileDropdownMenu');
                        if (menu && menu.classList.contains('open') && !e.target.closest('#profileWidget')) {
                            menu.classList.remove('open');
                        }
                    });
                    
                    document.getElementById('logoutBtn').addEventListener('click', async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        localStorage.removeItem('pathpilot_userId');
                        window.location.href = '/login.html';
                    });
                    
                    if(window.lucide) window.lucide.createIcons();
                }
                
                fetchDashboardData(currentUserId);
            } else {
                throw new Error("Invalid session");
            }
        } catch(e) {
            localStorage.removeItem('pathpilot_userId');
            const profileWidget = document.getElementById('profileWidget');
            if (profileWidget) {
                profileWidget.innerHTML = `<button class="btn btn-glow" onclick="window.location.href='/login.html'" style="padding: 0.5rem 1.25rem;">Sign In</button>`;
            }
            if (!window.location.pathname.includes('login.html')) window.location.href = '/login.html';
        }
    }
    
    verifySessionAndInitProfile();
});
