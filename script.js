// ===============================
// STARTUP SCREEN
// ===============================

const startupVideo = document.getElementById("startup-video");
const logoScreen = document.getElementById("logo-screen");
const startupLogo = document.getElementById("startup-logo");
const startupScreen = document.getElementById("startup-screen");
const mainWebsite = document.getElementById("main-website");

let logoAlreadyShown = false;

function showLogoPopup() {
    if (logoAlreadyShown) return;
    logoAlreadyShown = true;

    if (logoScreen) {
        logoScreen.style.display = "block";
    }
}

if (startupVideo) {
    startupVideo.addEventListener("play", () => {
        setTimeout(showLogoPopup, 1000);
    });
}

// Backup in case video autoplay is delayed
setTimeout(showLogoPopup, 1500);

// Click logo to enter website directly
if (startupLogo) {
    startupLogo.addEventListener("click", () => {
        if (startupVideo) startupVideo.pause();

     startupScreen.classList.add("hidden");
mainWebsite.style.display = "block";

/* Reset scroll control and let browser handle normal page scrolling */
document.body.style.overflow = "";
document.documentElement.style.overflow = "";

setTimeout(() => {
    startupScreen.style.display = "none";
}, 500);

setTimeout(() => {
    document.querySelectorAll(".scroll-reveal").forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top < window.innerHeight - 80) {
            element.classList.add("show");
        }
    });
}, 100);
    });
}

// ===============================
// UPCOMING EVENTS TIMELINE
// ===============================

const eventTimeline = document.getElementById("event-timeline");

function loadUpcomingEvents() {
    if (!eventTimeline || typeof upcomingEvents === "undefined") return;

    eventTimeline.innerHTML = "";

    upcomingEvents.forEach((semesterGroup) => {
        const semesterBlock = document.createElement("div");
        semesterBlock.className = "semester-block";

        semesterBlock.innerHTML = `
            <h3 class="semester-title">${semesterGroup.semester}</h3>
            <div class="timeline-list"></div>
        `;

        const timelineList = semesterBlock.querySelector(".timeline-list");

        semesterGroup.events.forEach((event) => {
            const eventCard = document.createElement("div");
            eventCard.className = "timeline-card";

            eventCard.innerHTML = `
                <div class="timeline-dot"></div>

                <div class="timeline-content">
                    <div class="timeline-top">
                        <span class="event-date">${event.date}</span>
                        <span class="event-week">${event.week}</span>
                    </div>

                    <h3>${event.name}</h3>

                    <div class="event-meta">
                        <span>${event.venue}</span>
                        <span>${event.department}</span>
                    </div>

                    <p>${event.objective}</p>
                </div>
            `;

            timelineList.appendChild(eventCard);
        });

        eventTimeline.appendChild(semesterBlock);
    });
}

// ===============================
// PAST ACTIVITIES GALLERY SYSTEM
// ===============================

const activityGrid = document.getElementById("activity-grid");
const galleryModal = document.getElementById("gallery-modal");
const closeGallery = document.getElementById("close-gallery");
const galleryTitle = document.getElementById("gallery-title");
const galleryDescription = document.getElementById("gallery-description");
const galleryImages = document.getElementById("gallery-images");

function loadActivities() {
    if (!activityGrid) {
        console.warn("activity-grid not found in index.html");
        return;
    }

    if (typeof activities === "undefined") {
        console.warn("activities array not found. Check activities.js file.");
        return;
    }

    activityGrid.innerHTML = "";

    activities.forEach((activity, index) => {
        const card = document.createElement("div");
        card.className = "activity-card";

        card.innerHTML = `
            <img src="${activity.cover}" alt="${activity.title}" class="activity-cover">

            <div class="activity-card-body">
                <h3>${activity.title}</h3>
                <p>${activity.description}</p>
                <button class="gallery-btn" data-index="${index}">View Gallery</button>
            </div>
        `;

        const coverImage = card.querySelector("img");

        coverImage.onerror = () => {
            coverImage.src = "images/logo.png";
            coverImage.classList.add("fallback-logo");
            console.warn("Cover image not found:", activity.cover);
        };

        activityGrid.appendChild(card);
    });

    document.querySelectorAll(".gallery-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const index = button.getAttribute("data-index");
            openGallery(index);
        });
    });
}

function openGallery(index) {
    const activity = activities[index];

    galleryTitle.textContent = activity.title;
    galleryDescription.textContent = `${activity.description} • ${activity.images.length} media files`;
    galleryImages.innerHTML = "";

    activity.images.forEach((imagePath) => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-image-wrapper";

        const image = document.createElement("img");
        image.src = imagePath;
        image.alt = activity.title;

        image.addEventListener("click", () => {
            openImageZoom(imagePath, activity.title);
        });

        image.onerror = () => {
            wrapper.classList.add("missing-image-box");
            image.style.display = "none";

            const missingText = document.createElement("p");
            missingText.className = "image-file-name";
            missingText.textContent = "Missing image";

            wrapper.appendChild(missingText);

            console.warn("Image not found or cannot load:", imagePath);
        };

        wrapper.appendChild(image);
        galleryImages.appendChild(wrapper);
    });

    galleryModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeGalleryModal() {
    if (!galleryModal) return;

    galleryModal.style.display = "none";
    document.body.style.overflow = "";
}

if (closeGallery) {
    closeGallery.addEventListener("click", closeGalleryModal);
}

if (galleryModal) {
    galleryModal.addEventListener("click", (event) => {
        if (event.target === galleryModal) {
            closeGalleryModal();
        }
    });
}

// ===============================
// IMAGE ZOOM SYSTEM
// ===============================

const imageZoomModal = document.getElementById("image-zoom-modal");
const zoomedImage = document.getElementById("zoomed-image");
const closeZoom = document.getElementById("close-zoom");

function openImageZoom(imagePath, imageAlt) {
    if (!imageZoomModal || !zoomedImage) return;

    zoomedImage.src = imagePath;
    zoomedImage.alt = imageAlt;

    imageZoomModal.style.display = "flex";
}

function closeImageZoom() {
    if (!imageZoomModal || !zoomedImage) return;

    imageZoomModal.style.display = "none";
    zoomedImage.src = "";
}

if (closeZoom) {
    closeZoom.addEventListener("click", closeImageZoom);
}

if (imageZoomModal) {
    imageZoomModal.addEventListener("click", (event) => {
        if (event.target === imageZoomModal) {
            closeImageZoom();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeGalleryModal();
        closeImageZoom();
    }
});

// Leadership image zoom
document.querySelectorAll(".leadership-card img").forEach((image) => {
    image.addEventListener("click", () => {
        openImageZoom(image.src, image.alt);
    });
});

// ===============================
// STELLAR AI CHAT SYSTEM
// ===============================

const aiChatForm = document.getElementById("ai-chat-form");
const aiUserInput = document.getElementById("ai-user-input");
const aiChatMessages = document.getElementById("ai-chat-messages");
const aiSendBtn = document.getElementById("ai-send-btn");

function addAIMessage(message, sender) {
    if (!aiChatMessages) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `ai-message ${sender}`;
    messageDiv.textContent = message;

    aiChatMessages.appendChild(messageDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

if (aiChatForm) {
    aiChatForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userMessage = aiUserInput.value.trim();

        if (!userMessage) return;

        addAIMessage(userMessage, "user");

        aiUserInput.value = "";
        aiSendBtn.disabled = true;
        aiSendBtn.textContent = "Thinking...";

        const loadingMessage = document.createElement("div");
        loadingMessage.className = "ai-message bot";
        loadingMessage.textContent = "Stellar AI is thinking...";
        aiChatMessages.appendChild(loadingMessage);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        try {
            const response = await fetch("/api/stellar-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userMessage
                })
            });

            const data = await response.json();

            loadingMessage.textContent = data.reply || "Sorry, I could not answer that.";
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        } catch (error) {
            console.error("AI chat error:", error);

            loadingMessage.textContent = "Sorry, Stellar AI is not available right now.";
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

        } finally {
            aiSendBtn.disabled = false;
            aiSendBtn.textContent = "Send";
            aiUserInput.focus();
        }
    });
}

// ===============================
// RECRUITMENT FORM SYSTEM
// ===============================

const recruitmentForm = document.getElementById("recruitment-form");
const recruitmentSubmitBtn = document.getElementById("recruitment-submit-btn");
const recruitmentStatus = document.getElementById("recruitment-status");

if (recruitmentForm) {
    recruitmentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(recruitmentForm);
        const application = Object.fromEntries(formData.entries());

        application.email = application.email.trim().toLowerCase();

        if (!application.email.endsWith("@utp.edu.my")) {
            recruitmentStatus.textContent = "Please use your official UTP email address ending with @utp.edu.my.";
            recruitmentStatus.className = "recruitment-status error";
            return;
        }

        if (application.firstDepartment === application.secondDepartment) {
            recruitmentStatus.textContent = "Please choose a different second choice department.";
            recruitmentStatus.className = "recruitment-status error";
            return;
        }

        recruitmentSubmitBtn.disabled = true;
        recruitmentSubmitBtn.textContent = "Submitting...";
        recruitmentStatus.textContent = "";
        recruitmentStatus.className = "recruitment-status";

        try {
            const response = await fetch("/api/recruitment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(application)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Submission failed.");
            }

            recruitmentStatus.textContent = data.message;
            recruitmentStatus.className = "recruitment-status success";

            recruitmentForm.reset();

        } catch (error) {
            console.error("Recruitment form error:", error);

            recruitmentStatus.textContent = error.message || "Sorry, your application could not be submitted. Please try again.";
            recruitmentStatus.className = "recruitment-status error";

        } finally {
            recruitmentSubmitBtn.disabled = false;
            recruitmentSubmitBtn.textContent = "Submit Application";
        }
    });
}

// ===============================
// LOAD WEBSITE CONTENT
// ===============================
// ===============================
// WHOLE PAGE SCROLL ANIMATION
// ===============================

function initPageAnimations() {
    const animatedElements = document.querySelectorAll(`
        .section-header,
        .section > p,
        .card,
        .project-card,
        .activity-card,
        .leadership-card,
        .timeline-card,
        .ai-feature,
        .ai-chat-box,
        .recruitment-info,
        .jobscope-card,
        .recruitment-form,
        footer
    `);

    animatedElements.forEach((element, index) => {
        element.classList.add("scroll-reveal");
        element.style.setProperty("--delay", `${Math.min((index % 6) * 0.08, 0.4)}s`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    animatedElements.forEach((element) => {
        observer.observe(element);
    });
}

// ===============================
// STELLAR DEFENDER MINI GAME
// ===============================

const gameCanvas = document.getElementById("stellar-game");
const gameOverlay = document.getElementById("game-overlay");
const startGameBtn = document.getElementById("start-game-btn");
const gameLevelText = document.getElementById("game-level");
const gameScoreText = document.getElementById("game-score");
const gameLivesText = document.getElementById("game-lives");

const moveLeftBtn = document.getElementById("move-left-btn");
const moveRightBtn = document.getElementById("move-right-btn");
const shootBtn = document.getElementById("shoot-btn");

let gameCtx;
let gameRunning = false;
let gameAnimationId = null;

let player;
let bullets;
let enemies;
let enemyBullets;
let stars;
let boss;

let keys = {};
let score = 0;
let lives = 3;
let level = 1;
let lastShotTime = 0;
let lastEnemyShotTime = 0;

const gameSettings = {
    width: 800,
    height: 500
};

function initStellarGame() {
    if (!gameCanvas) return;

    gameCtx = gameCanvas.getContext("2d");

    player = {
        x: gameSettings.width / 2 - 22,
        y: gameSettings.height - 70,
        width: 44,
        height: 44,
        speed: 6
    };

    bullets = [];
    enemies = [];
    enemyBullets = [];
    stars = [];
    boss = null;

    score = 0;
    lives = 3;
    level = 1;

    createStars();
    createLevelEnemies();

    updateGameStats();
    drawGame();
}

function createStars() {
    stars = [];

    for (let i = 0; i < 90; i++) {
        stars.push({
            x: Math.random() * gameSettings.width,
            y: Math.random() * gameSettings.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.4 + 0.4
        });
    }
}

function createLevelEnemies() {
    enemies = [];
    enemyBullets = [];
    boss = null;

    let rows = level === 1 ? 2 : level === 2 ? 3 : 2;
    let cols = level === 1 ? 6 : level === 2 ? 7 : 5;
    let spacingX = 86;
    let spacingY = 58;
    let startX = (gameSettings.width - (cols - 1) * spacingX) / 2 - 20;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            enemies.push({
                x: startX + col * spacingX,
                y: 70 + row * spacingY,
                width: 38,
                height: 30,
                speed: 0.8 + level * 0.35,
                direction: 1,
                type: row % 2 === 0 ? "alien" : "ufo"
            });
        }
    }

    if (level === 3) {
        boss = {
            x: gameSettings.width / 2 - 70,
            y: 35,
            width: 140,
            height: 58,
            speed: 2,
            direction: 1,
            hp: 20,
            maxHp: 20
        };
    }
}

function updateGameStats() {
    if (gameLevelText) gameLevelText.textContent = level;
    if (gameScoreText) gameScoreText.textContent = score;
    if (gameLivesText) gameLivesText.textContent = lives;
}

function startStellarGame() {
    initStellarGame();

    gameRunning = true;

    if (gameOverlay) {
        gameOverlay.style.display = "none";
    }

    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }

    gameLoop();
}

function showGameOverlay(title, message, buttonText = "Play Again") {
    gameRunning = false;

    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }

    if (!gameOverlay) return;

    gameOverlay.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button id="restart-game-btn">${buttonText}</button>
    `;

    gameOverlay.style.display = "flex";

    const restartBtn = document.getElementById("restart-game-btn");
    restartBtn.addEventListener("click", startStellarGame);
}

function shootBullet() {
    const now = Date.now();

    if (now - lastShotTime < 230) return;

    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 16,
        speed: 8
    });

    lastShotTime = now;
}

function enemyShoot() {
    const now = Date.now();
    const interval = level === 1 ? 1200 : level === 2 ? 850 : 650;

    if (now - lastEnemyShotTime < interval) return;

    const shooters = [...enemies];

    if (boss) shooters.push(boss);

    if (shooters.length === 0) return;

    const shooter = shooters[Math.floor(Math.random() * shooters.length)];

    enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 3,
        y: shooter.y + shooter.height,
        width: 6,
        height: 14,
        speed: 3 + level
    });

    lastEnemyShotTime = now;
}

function updateGame() {
    if (!gameRunning) return;

    stars.forEach((star) => {
        star.y += star.speed;

        if (star.y > gameSettings.height) {
            star.y = 0;
            star.x = Math.random() * gameSettings.width;
        }
    });

    if (keys.ArrowLeft || keys.KeyA) {
        player.x -= player.speed;
    }

    if (keys.ArrowRight || keys.KeyD) {
        player.x += player.speed;
    }

    player.x = Math.max(10, Math.min(gameSettings.width - player.width - 10, player.x));

    if (keys.Space) {
        shootBullet();
    }

    bullets.forEach((bullet) => {
        bullet.y -= bullet.speed;
    });

    bullets = bullets.filter((bullet) => bullet.y + bullet.height > 0);

    enemyBullets.forEach((bullet) => {
        bullet.y += bullet.speed;
    });

    enemyBullets = enemyBullets.filter((bullet) => bullet.y < gameSettings.height);

    updateEnemies();
    updateBoss();
    enemyShoot();
    checkCollisions();

    if (lives <= 0) {
        showGameOverlay(
            "MISSION FAILED",
            "Your spacecraft was destroyed. Try again and defend the Stellar galaxy.",
            "Retry Mission"
        );
    }

    if (enemies.length === 0 && (!boss || boss.hp <= 0)) {
        if (level < 3) {
            level++;
            createLevelEnemies();
            updateGameStats();
        } else {
            showGameOverlay(
                "MISSION COMPLETE ✨",
                "You passed the UTP Stellar Booth Challenge! Show this screen to the committee to claim your souvenir.",
                "Play Again"
            );
        }
    }
}

function updateEnemies() {
    let shouldDrop = false;

    enemies.forEach((enemy) => {
        enemy.x += enemy.speed * enemy.direction;

        if (enemy.x <= 15 || enemy.x + enemy.width >= gameSettings.width - 15) {
            shouldDrop = true;
        }
    });

    if (shouldDrop) {
        enemies.forEach((enemy) => {
            enemy.direction *= -1;
            enemy.y += 18 + level * 2;
        });
    }

    enemies.forEach((enemy) => {
        if (enemy.y + enemy.height >= player.y) {
            lives = 0;
        }
    });
}

function updateBoss() {
    if (!boss) return;

    boss.x += boss.speed * boss.direction;

    if (boss.x <= 20 || boss.x + boss.width >= gameSettings.width - 20) {
        boss.direction *= -1;
    }
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 20;
                updateGameStats();
            }
        });

        if (boss && isColliding(bullet, boss)) {
            bullets.splice(bulletIndex, 1);
            boss.hp--;
            score += 10;

            if (boss.hp <= 0) {
                score += 150;
            }

            updateGameStats();
        }
    });

    enemyBullets.forEach((bullet, bulletIndex) => {
        if (isColliding(bullet, player)) {
            enemyBullets.splice(bulletIndex, 1);
            lives--;
            updateGameStats();
        }
    });

    enemies.forEach((enemy) => {
        if (isColliding(enemy, player)) {
            lives = 0;
            updateGameStats();
        }
    });
}

function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function drawGame() {
    if (!gameCtx) return;

    gameCtx.clearRect(0, 0, gameSettings.width, gameSettings.height);

    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawBoss();
    drawEnemyBullets();
}

function drawBackground() {
    gameCtx.fillStyle = "#02010d";
    gameCtx.fillRect(0, 0, gameSettings.width, gameSettings.height);

    stars.forEach((star) => {
        gameCtx.fillStyle = "rgba(255,255,255,0.8)";
        gameCtx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawPlayer() {
    const x = player.x;
    const y = player.y;

    gameCtx.save();

    gameCtx.shadowBlur = 18;
    gameCtx.shadowColor = "#bca8ff";

    gameCtx.fillStyle = "#bca8ff";
    gameCtx.beginPath();
    gameCtx.moveTo(x + player.width / 2, y);
    gameCtx.lineTo(x, y + player.height);
    gameCtx.lineTo(x + player.width, y + player.height);
    gameCtx.closePath();
    gameCtx.fill();

    gameCtx.fillStyle = "#ffffff";
    gameCtx.fillRect(x + 17, y + 22, 10, 12);

    gameCtx.fillStyle = "#52d7ff";
    gameCtx.fillRect(x + 10, y + player.height, 8, 14);
    gameCtx.fillRect(x + 26, y + player.height, 8, 14);

    gameCtx.restore();
}

function drawBullets() {
    bullets.forEach((bullet) => {
        gameCtx.save();
        gameCtx.shadowBlur = 16;
        gameCtx.shadowColor = "#ffffff";
        gameCtx.fillStyle = "#ffffff";
        gameCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        gameCtx.restore();
    });
}

function drawEnemies() {
    enemies.forEach((enemy) => {
        gameCtx.save();

        gameCtx.shadowBlur = 12;
        gameCtx.shadowColor = enemy.type === "ufo" ? "#ffcb4d" : "#ff5cab";

        if (enemy.type === "ufo") {
            gameCtx.fillStyle = "#ffcb4d";
            gameCtx.fillRect(enemy.x, enemy.y + 12, enemy.width, 14);

            gameCtx.fillStyle = "#69d2ff";
            gameCtx.fillRect(enemy.x + 9, enemy.y, enemy.width - 18, 18);
        } else {
            gameCtx.fillStyle = "#ff5cab";
            gameCtx.fillRect(enemy.x + 6, enemy.y + 6, enemy.width - 12, enemy.height - 8);

            gameCtx.fillStyle = "#fff";
            gameCtx.fillRect(enemy.x + 12, enemy.y + 12, 5, 5);
            gameCtx.fillRect(enemy.x + 22, enemy.y + 12, 5, 5);
        }

        gameCtx.restore();
    });
}

function drawBoss() {
    if (!boss || boss.hp <= 0) return;

    gameCtx.save();

    gameCtx.shadowBlur = 24;
    gameCtx.shadowColor = "#ff5cab";

    gameCtx.fillStyle = "#ff5cab";
    gameCtx.fillRect(boss.x, boss.y + 18, boss.width, boss.height - 18);

    gameCtx.fillStyle = "#bca8ff";
    gameCtx.fillRect(boss.x + 25, boss.y, boss.width - 50, 28);

    gameCtx.fillStyle = "#ffffff";
    gameCtx.fillRect(boss.x + 42, boss.y + 32, 10, 10);
    gameCtx.fillRect(boss.x + 88, boss.y + 32, 10, 10);

    gameCtx.fillStyle = "rgba(255,255,255,0.2)";
    gameCtx.fillRect(250, 18, 300, 12);

    gameCtx.fillStyle = "#ff5cab";
    gameCtx.fillRect(250, 18, 300 * (boss.hp / boss.maxHp), 12);

    gameCtx.fillStyle = "#ffffff";
    gameCtx.font = "14px Arial";
    gameCtx.fillText("BOSS UFO", 365, 14);

    gameCtx.restore();
}

function drawEnemyBullets() {
    enemyBullets.forEach((bullet) => {
        gameCtx.save();
        gameCtx.shadowBlur = 14;
        gameCtx.shadowColor = "#ff5cab";
        gameCtx.fillStyle = "#ff5cab";
        gameCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        gameCtx.restore();
    });
}

function gameLoop() {
    updateGame();
    drawGame();

    if (gameRunning) {
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
}

// Keyboard controls
document.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space" && gameRunning) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// Button controls
function holdButton(button, keyCode) {
    if (!button) return;

    button.addEventListener("mousedown", () => {
        keys[keyCode] = true;
    });

    button.addEventListener("mouseup", () => {
        keys[keyCode] = false;
    });

    button.addEventListener("mouseleave", () => {
        keys[keyCode] = false;
    });

    button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        keys[keyCode] = true;
    });

    button.addEventListener("touchend", () => {
        keys[keyCode] = false;
    });
}

holdButton(moveLeftBtn, "ArrowLeft");
holdButton(moveRightBtn, "ArrowRight");

if (shootBtn) {
    shootBtn.addEventListener("click", shootBullet);

    shootBtn.addEventListener("touchstart", (event) => {
        event.preventDefault();
        shootBullet();
    });
}

if (startGameBtn) {
    startGameBtn.addEventListener("click", startStellarGame);
}

initStellarGame();

loadUpcomingEvents();
loadActivities();
initPageAnimations();