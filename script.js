// ========== НАСТРОЙКИ ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Режимы игры
let isAdultMode = false;
let adultUnlocked = false;

// ФОТОГРАФИИ
const normalPhotosList = [
    'Images/angel1.jpg', 'Images/angel2.jpg', 'Images/angel3.jpg',
    'Images/angel4.jpg', 'Images/angel5.jpg', 'Images/angel6.jpg',
    'Images/angel7.jpg', 'Images/angel8.jpg', 'Images/angel9.jpg',
    'Images/angel10.jpg', 'Images/angel11.jpg', 'Images/angel12.jpg',
    'Images/angel13.jpg'
];

// 18+ фото - из папки Images18
const adultPhotosList = [
    'Images18/hot1.jpg',
    'Images18/hot2.jpg',
    'Images18/hot3.jpg',
    'Images18/hot4.jpg',
    'Images18/hot5.jpg',
    'Images18/hot6.jpg',
    'Images18/hot7.jpg',
    'Images18/hot8.jpg'
];

let currentPhotos = [];
let gameActive = false;
let gamePaused = false;
let score = 0;
let items = [];
let animationId = null;

const ITEM_W = 110;
const ITEM_H = 140;
const BASE_SPEED = 1.3;
let spawnCounter = 0;
const SPAWN_DELAY = 45;

let mouseX = canvas.width/2, mouseY = canvas.height/2;
let cursorInside = false;

// Элементы интерфейса
const startLoveBtn = document.getElementById('startLoveBtn');
const restartBtn = document.getElementById('restartBtn');
const stopBtn = document.getElementById('stopBtn');
const adultModeBtn = document.getElementById('adultModeBtn');
const gameTitle = document.getElementById('gameTitle');
const warningMsg = document.getElementById('warningMsg');
const instruction = document.getElementById('instruction');

// Загрузка фото
function loadPhotos(photoList, callback) {
    let loaded = 0;
    const photos = [];

    if (photoList.length === 0) {
        console.log('📸 Фото пока не добавлены...');
        callback(photos);
        return;
    }

    photoList.forEach((src) => {
        const img = new Image();
        img.onload = () => {
            photos.push(img);
            loaded++;
            console.log(`✅ Загружено фото ${loaded}/${photoList.length}: ${src}`);
            if (loaded === photoList.length) {
                callback(photos);
            }
        };
        img.onerror = () => {
            console.error(`❌ Не удалось загрузить фото: ${src}`);
            const canvasTemp = document.createElement('canvas');
            canvasTemp.width = ITEM_W;
            canvasTemp.height = ITEM_H;
            const ctxTemp = canvasTemp.getContext('2d');
            ctxTemp.fillStyle = isAdultMode ? '#ff3366' : '#ffb7c5';
            ctxTemp.fillRect(0, 0, ITEM_W, ITEM_H);
            ctxTemp.fillStyle = '#fff';
            ctxTemp.font = 'bold 30px "Segoe UI"';
            ctxTemp.fillText(isAdultMode ? '🔞' : '❤️', ITEM_W/2-15, ITEM_H/2+10);
            const placeholder = new Image();
            placeholder.src = canvasTemp.toDataURL();
            photos.push(placeholder);
            loaded++;
            if (loaded === photoList.length) {
                callback(photos);
            }
        };
        img.src = src;
    });
}

// Модальное окно "Фото в разработке" (милое сообщение)
function showComingSoonModal() {
    const modal = document.createElement('div');
    modal.className = 'coming-soon-modal';
    modal.innerHTML = `
        <div class="coming-soon-content">
            <div class="blushing-heart">😳❤️😳</div>
            <h2>Ой-ой-ой! 🙈</h2>
            <p>Сексуальных фотографий пока мало...</p>
            <div class="shy-message">
                📸 Ждём, когда создатель перестанет стесняться!<br>
                Обещаем, скоро тут будет жарко! 🔥
            </div>
            <div class="coming-soon-buttons">
                <button class="close-comingsoon">Понял, жду с нетерпением! 💕</button>
                <button class="try-button">можно чуть-чуть попробовать)) 😈</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Стили для модалки
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(12px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        animation: fadeIn 0.3s;
    `;

    const content = modal.querySelector('.coming-soon-content');
    content.style.cssText = `
        background: linear-gradient(145deg, #fff0f5, #ffe0e8);
        border-radius: 70px;
        padding: 40px;
        text-align: center;
        max-width: 450px;
        border: 3px solid #ffb7c5;
        animation: bounce 0.4s;
    `;

    const heart = modal.querySelector('.blushing-heart');
    heart.style.cssText = `
        font-size: 70px;
        animation: blush 1s infinite;
    `;

    const title = modal.querySelector('h2');
    title.style.cssText = `
        color: #d43f6b;
        font-size: 2em;
        margin: 15px 0;
    `;

    const message = modal.querySelector('.shy-message');
    message.style.cssText = `
        background: #ffdd99;
        color: #884400;
        padding: 15px;
        border-radius: 40px;
        margin: 20px 0;
        font-weight: bold;
        font-size: 1.1em;
    `;

    const buttonsDiv = modal.querySelector('.coming-soon-buttons');
    buttonsDiv.style.cssText = `
        display: flex;
        gap: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;

    const btn = modal.querySelector('.close-comingsoon');
    btn.style.cssText = `
        background: linear-gradient(135deg, #ff6b8a, #ff3b6b);
        border: none;
        padding: 12px 25px;
        font-size: 1em;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        color: white;
        box-shadow: 0 4px 0 #8f2c48;
        transition: 0.1s;
    `;

    const tryBtn = modal.querySelector('.try-button');
    tryBtn.style.cssText = `
        background: linear-gradient(135deg, #ff8844, #ff6633);
        border: none;
        padding: 12px 25px;
        font-size: 1em;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        color: white;
        box-shadow: 0 4px 0 #aa4422;
        transition: 0.1s;
    `;

    btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)';
    btn.onmouseleave = () => btn.style.transform = 'translateY(0)';
    btn.onclick = () => modal.remove();

    tryBtn.onmouseenter = () => tryBtn.style.transform = 'translateY(-2px)';
    tryBtn.onmouseleave = () => tryBtn.style.transform = 'translateY(0)';
    tryBtn.onclick = () => {
        modal.remove();

        // Загружаем фото из папки Images18
        const tryPhotosList = [
            'Images18/hot1.jpg',
            'Images18/hot2.jpg',
            'Images18/hot3.jpg',
            'Images18/hot4.jpg',
            'Images18/hot5.jpg',
            'Images18/hot6.jpg',
            'Images18/hot7.jpg',
            'Images18/hot8.jpg'
        ];

        let loadedCount = 0;
        const loadedPhotos = [];

        if (tryPhotosList.length === 0) {
            alert('😳 В папке Images18 пока нет фото! Добавь туда фотографии и назови их hot1.jpg, hot2.jpg и т.д.');
            return;
        }

        tryPhotosList.forEach((src) => {
            const img = new Image();
            img.onload = () => {
                loadedPhotos.push(img);
                loadedCount++;
                console.log(`📸 Загружено фото для 18+ режима: ${src}`);
                if (loadedCount === tryPhotosList.length) {
                    currentPhotos = loadedPhotos;
                    console.log(`🔥 Загружено ${currentPhotos.length} фото из папки Images18!`);
                    // Запускаем игру
                    gameActive = true;
                    gamePaused = false;
                    score = 0;
                    items = [];
                    spawnCounter = 5;
                    document.getElementById('score').innerText = '0';

                    const gameOverModal = document.getElementById('gameOverModal');
                    if (gameOverModal) gameOverModal.classList.remove('active');

                    hideStopModal();

                    if (animationId) cancelAnimationFrame(animationId);
                    animationId = requestAnimationFrame(gameLoop);
                }
            };
            img.onerror = () => {
                console.warn(`⚠️ Фото не найдено: ${src}`);
                loadedCount++;
                if (loadedCount === tryPhotosList.length) {
                    if (loadedPhotos.length === 0) {
                        alert('😳 В папке Images18 пока нет фото! Добавь туда фотографии и назови их hot1.jpg, hot2.jpg и т.д.');
                        return;
                    }
                    currentPhotos = loadedPhotos;
                    console.log(`🔥 Загружено ${currentPhotos.length} фото из папки Images18!`);
                    gameActive = true;
                    gamePaused = false;
                    score = 0;
                    items = [];
                    spawnCounter = 5;
                    document.getElementById('score').innerText = '0';

                    const gameOverModal = document.getElementById('gameOverModal');
                    if (gameOverModal) gameOverModal.classList.remove('active');

                    hideStopModal();

                    if (animationId) cancelAnimationFrame(animationId);
                    animationId = requestAnimationFrame(gameLoop);
                }
            };
            img.src = src;
        });
    };

    // Добавляем анимации если их нет
    if (!document.querySelector('#dynamicStyles')) {
        const style = document.createElement('style');
        style.id = 'dynamicStyles';
        style.textContent = `
            @keyframes blush {
                0%, 100% { transform: scale(1); text-shadow: 0 0 0px #ff6688; }
                50% { transform: scale(1.15); text-shadow: 0 0 15px #ff3366; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Смена режима
function switchToAdultMode() {
    isAdultMode = true;
    adultUnlocked = true;

    // Меняем стили
    document.body.classList.add('adult-mode');
    gameTitle.innerHTML = '🔞 ПОПАДИ В ДЕМОНИЦУ 🔞';
    warningMsg.innerHTML = '🔞 ВНИМАНИЕ: 18+ режим! Если промахнёшься — душу дьяволу! 🔞<br>Такую демоницу нельзя упускать!';
    instruction.innerHTML = '😈 Курсор-демон — целься прямо в фото! 😈';

    // Меняем текст кнопки с "ДАРИТЬ ЛЮБОВЬ" на "ДАРИТЬ СТРАСТЬ"
    startLoveBtn.innerHTML = '🔥 ДАРИТЬ СТРАСТЬ 🔥';

    // Очищаем фото, чтобы при нажатии "ДАРИТЬ СТРАСТЬ" показалось милое сообщение
    currentPhotos = [];
    resetGame();
}

function switchToNormalMode() {
    isAdultMode = false;
    document.body.classList.remove('adult-mode');
    gameTitle.innerHTML = '❤️ ПОПАДИ В АНГЕЛОЧКА ❤️';
    warningMsg.innerHTML = '⚠️ ПРЕДУПРЕЖДЕНИЕ: если промахнёшься — умрёшь в реальной жизни! ⚠️<br>Такого ангелочка нельзя упускать!';
    instruction.innerHTML = '❤️ Курсор в виде сердечка — целься прямо в фото! ❤️';

    // Возвращаем текст кнопки
    startLoveBtn.innerHTML = '💝 ДАРИТЬ ЛЮБОВЬ 💝';

    loadPhotos(normalPhotosList, (photos) => {
        currentPhotos = photos;
        resetGame();
    });
}

function getRandomPhoto() {
    if (currentPhotos.length === 0) return null;
    return currentPhotos[Math.floor(Math.random() * currentPhotos.length)];
}

// Курсор
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
    cursorInside = true;
});

canvas.addEventListener('mouseleave', () => cursorInside = false);

// Попадание
canvas.addEventListener('click', (e) => {
    if (!gameActive || gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    let hit = false;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (clickX >= item.x && clickX <= item.x + ITEM_W &&
            clickY >= item.y && clickY <= item.y + ITEM_H) {
            hit = true;
            items.splice(i, 1);
            score++;
            document.getElementById('score').innerText = score;

            canvas.style.transform = 'scale(0.99)';
            setTimeout(() => { if(canvas) canvas.style.transform = ''; }, 80);
            break;
        }
    }

    if (!hit && gameActive && !gamePaused) {
        gameActive = false;
        gamePaused = false;
        showGameOver();
        if (animationId) cancelAnimationFrame(animationId);
    }
});

function trySpawn() {
    if (!gameActive || gamePaused) return;
    if (spawnCounter <= 0 && currentPhotos.length > 0) {
        const photo = getRandomPhoto();
        if (photo) {
            items.push({
                x: Math.random() * (canvas.width - ITEM_W - 40) + 20,
                y: -ITEM_H,
                photo: photo
            });
        }
        spawnCounter = SPAWN_DELAY;
    } else {
        spawnCounter--;
    }
}

function updateItems() {
    if (!gameActive || gamePaused) return;

    for (let i = 0; i < items.length; i++) {
        items[i].y += BASE_SPEED;
    }

    for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].y + ITEM_H > canvas.height) {
            items.splice(i, 1);
            if (gameActive && !gamePaused) {
                gameActive = false;
                gamePaused = false;
                showGameOver();
                if (animationId) cancelAnimationFrame(animationId);
                return;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ФОН
    if (isAdultMode) {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#2a0a0a');
        grad.addColorStop(0.5, '#4a1a2a');
        grad.addColorStop(1, '#2a0a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff336622';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#ffeef4');
        grad.addColorStop(1, '#ffdce8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Надпись "Нажми ДАРИТЬ СТРАСТЬ/ЛЮБОВЬ"
    if (!gameActive && currentPhotos.length === 0 && items.length === 0 && score === 0 && !gamePaused && isAdultMode) {
        ctx.font = 'bold 22px "Segoe UI"';
        ctx.fillStyle = '#ff6688';
        ctx.shadowBlur = 0;
        ctx.fillText('Пока в разработке...', canvas.width/2 - 170, canvas.height/2 - 30);
        ctx.font = '18px "Segoe UI"';
        ctx.fillStyle = '#ff8899';
        ctx.fillText('Создатель обещает скоро добавить жаркие фото! 🔥', canvas.width/2 - 240, canvas.height/2 + 20);
        ctx.font = '16px "Segoe UI"';
        ctx.fillStyle = '#ffaabb';
        ctx.fillText('Нажми "ДАРИТЬ СТРАСТЬ" и выбери "можно чуть-чуть попробовать))" 😇', canvas.width/2 - 250, canvas.height/2 + 70);
    } else if (!gameActive && currentPhotos.length > 0 && items.length === 0 && score === 0 && !gamePaused) {
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.fillStyle = isAdultMode ? '#ff6688' : '#d43f6b';
        ctx.shadowBlur = 0;
        ctx.fillText(isAdultMode ? '🔥 Нажми "ДАРИТЬ СТРАСТЬ" 🔥' : '💝 Нажми "ДАРИТЬ ЛЮБОВЬ" 💝',
            canvas.width/2 - 210, canvas.height/2);
        ctx.font = '18px "Segoe UI"';
        ctx.fillStyle = isAdultMode ? '#ff8899' : '#b84c6e';
        ctx.fillText(isAdultMode ? 'Демоница ждет твою душу 😈' : 'Ангелочек ждет твою любовь ❤️',
            canvas.width/2 - 170, canvas.height/2 + 50);
    }

    // Пауза
    if (gamePaused && gameActive) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 32px "Segoe UI"';
        ctx.fillStyle = isAdultMode ? '#ff6688' : '#ffdd99';
        ctx.fillText('⏸️ ПАУЗА ⏸️', canvas.width/2 - 100, canvas.height/2);
    }

    // Рисуем падающие фото
    for (const item of items) {
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = isAdultMode ? 'rgba(255, 51, 102, 0.5)' : 'rgba(0,0,0,0.2)';

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(item.x - 5, item.y - 5, ITEM_W + 10, ITEM_H + 12);
        ctx.fillStyle = isAdultMode ? '#ff4466' : '#ffb7ca';
        ctx.fillRect(item.x - 2, item.y - 2, ITEM_W + 4, ITEM_H + 6);
        ctx.fillStyle = 'white';
        ctx.fillRect(item.x, item.y, ITEM_W, ITEM_H);

        if (item.photo) {
            ctx.drawImage(item.photo, item.x, item.y, ITEM_W, ITEM_H);
        }

        ctx.font = '22px "Segoe UI"';
        ctx.fillStyle = isAdultMode ? '#ff3366' : '#ff6699';
        ctx.fillText(isAdultMode ? '😈' : '❤️', item.x + ITEM_W - 22, item.y + ITEM_H - 8);
        ctx.restore();
    }

    // КУРСОР
    if (cursorInside && gameActive && !gamePaused) {
        ctx.save();
        ctx.shadowBlur = 8;
        if (isAdultMode) {
            ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
            ctx.font = '38px "Segoe UI"';
            ctx.fillStyle = '#ff3366';
            ctx.fillText('😈', mouseX - 15, mouseY + 10);
            ctx.font = '20px "Segoe UI"';
            ctx.fillStyle = '#ff8800';
            ctx.fillText('🔥', mouseX - 25, mouseY);
        } else {
            ctx.shadowColor = 'rgba(255, 60, 120, 0.6)';
            const hx = mouseX, hy = mouseY;
            ctx.beginPath();
            ctx.moveTo(hx, hy + 7);
            ctx.bezierCurveTo(hx - 12, hy - 5, hx - 18, hy + 5, hx, hy + 18);
            ctx.bezierCurveTo(hx + 18, hy + 5, hx + 12, hy - 5, hx, hy + 7);
            ctx.fillStyle = '#ff3366';
            ctx.fill();
            ctx.fillStyle = '#ff99bb';
            ctx.beginPath();
            ctx.arc(hx - 5, hy - 2, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(hx - 7, hy - 4, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();
    }

    // Game Over
    if (!gameActive && (items.length > 0 || score > 0) && !gamePaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 28px "Segoe UI"';
        ctx.fillStyle = isAdultMode ? '#ff6688' : '#ffccdd';
        ctx.fillText(isAdultMode ? '😈 GAME OVER 😈' : '💀 GAME OVER 💀', canvas.width/2 - 140, canvas.height/2);
    }
}

function showGameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.add('active');
}

function showStopModal() {
    const modal = document.getElementById('stopModal');
    modal.classList.add('active');
}

function hideStopModal() {
    const modal = document.getElementById('stopModal');
    modal.classList.remove('active');
}

// СТАРТ ИГРЫ (с проверкой для 18+ режима)
function startGame() {
    // Если 18+ режим и нет фото - показываем милое сообщение
    if (isAdultMode && currentPhotos.length === 0) {
        showComingSoonModal();
        return;
    }

    if (currentPhotos.length === 0) {
        alert('Фото ещё загружаются... Подожди секунду!');
        return;
    }

    if (gamePaused && gameActive) {
        gamePaused = false;
        hideStopModal();
        return;
    }

    gameActive = true;
    gamePaused = false;
    score = 0;
    items = [];
    spawnCounter = 5;
    document.getElementById('score').innerText = '0';

    const gameOverModal = document.getElementById('gameOverModal');
    if (gameOverModal) gameOverModal.classList.remove('active');

    hideStopModal();

    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
    if (!gameActive || gamePaused) return;
    gamePaused = true;
    showStopModal();
}

function resetGame() {
    gameActive = false;
    gamePaused = false;
    score = 0;
    items = [];
    spawnCounter = 5;
    document.getElementById('score').innerText = '0';

    const gameOverModal = document.getElementById('gameOverModal');
    if (gameOverModal) gameOverModal.classList.remove('active');
    hideStopModal();
}

function restartGame() {
    resetGame();
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameActive && !gamePaused) {
        trySpawn();
        updateItems();
    }
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// 18+ модалка
function showAdultModal() {
    if (adultUnlocked) {
        switchToAdultMode();
    } else {
        document.getElementById('adultModal').classList.add('active');
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordError').innerHTML = '';
    }
}

function checkPassword() {
    const password = document.getElementById('passwordInput').value.trim();
    if (password.toLowerCase() === 'лео') {
        document.getElementById('adultModal').classList.remove('active');
        switchToAdultMode();
    } else {
        document.getElementById('passwordError').innerHTML = '❌ Неправильно! Котенок обиделся... Попробуй ещё! ❌';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// Кнопки
startLoveBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
restartBtn.addEventListener('click', restartGame);
adultModeBtn.addEventListener('click', showAdultModal);
document.getElementById('restartModalBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.remove('active');
    restartGame();
});
document.getElementById('resumeFromStopBtn').addEventListener('click', () => {
    gamePaused = false;
    hideStopModal();
});
document.getElementById('submitPasswordBtn').addEventListener('click', checkPassword);
document.getElementById('closeAdultBtn').addEventListener('click', () => {
    document.getElementById('adultModal').classList.remove('active');
});

// Enter в поле ввода
document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});

// ЗАПУСК
console.log('🎮 Игра загружается...');
loadPhotos(normalPhotosList, (photos) => {
    currentPhotos = photos;
    console.log('✅ Обычный режим готов!');
    console.log('😈 Для 18+ режима нужен пароль: Лео');
    console.log('📸 В папке Images18 лежат фото для кнопки "можно чуть-чуть попробовать))"');
});

animationId = requestAnimationFrame(gameLoop);