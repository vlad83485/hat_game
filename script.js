(function(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const leftCountSpan = document.getElementById('leftCount');
    const messageDiv = document.getElementById('message');
    const itemsListDiv = document.getElementById('itemsList');

    const W = 700;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    let hats = [];
    let backgroundImg = null;
    let hatImages = [];
    let imagesLoaded = 0;
    let gameReady = false;
    let useFallbackDrawing = false;

    const hatData = [
        { id: 0, name: "Цилиндр", x: 100, y: 170, w: 55, h: 65, emoji: "🎩" },
        { id: 1, name: "Панама", x: 280, y: 360, w: 55, h: 60, emoji: "🧢" },
        { id: 2, name: "Бейсболка", x: 500, y: 140, w: 55, h: 60, emoji: "⛑️" },
        { id: 3, name: "Ковбойская", x: 580, y: 400, w: 60, h: 65, emoji: "🤠" },
        { id: 4, name: "Пилотка", x: 200, y: 430, w: 55, h: 55, emoji: "✈️" }
    ];

    const hatImageUrls = [
        "img/cylinder.png",
        "img/panama.png",
        "img/cap.png",
        "img/cowboy.png",
        "img/pilotka.png"
    ];

    const fallbackHats = ["🎩", "🧢", "⛑️", "🤠", "✈️"];

    // Функция для создания списка предметов
    function buildItemsList() {
        itemsListDiv.innerHTML = '';
        for(let i = 0; i < hatData.length; i++) {
            const hat = hatData[i];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'hat-item';
            if(hats[i] && hats[i].found) itemDiv.classList.add('found');
            itemDiv.id = `hat${i}`;
            itemDiv.innerHTML = `
                <span class="check">${(hats[i] && hats[i].found) ? '✅' : '❌'}</span>
                <span>${hat.name}</span>
            `;
            itemsListDiv.appendChild(itemDiv);
        }
    }

    function updateItemsList() {
        for(let i = 0; i < hats.length; i++) {
            const itemDiv = document.getElementById(`hat${i}`);
            if(itemDiv) {
                if(hats[i].found) {
                    itemDiv.classList.add('found');
                    itemDiv.querySelector('.check').innerHTML = '✅';
                } else {
                    itemDiv.classList.remove('found');
                    itemDiv.querySelector('.check').innerHTML = '❌';
                }
            }
        }
    }

    function loadImages() {
        backgroundImg = new Image();
        backgroundImg.src = "img/room.jpg";
        
        for(let i = 0; i < 5; i++) {
            hatImages[i] = new Image();
            hatImages[i].src = hatImageUrls[i];
            hatImages[i].onload = () => {
                imagesLoaded++;
                checkAllLoaded();
            };
            hatImages[i].onerror = () => {
                console.log("Не загрузилась шляпа " + i + ", используем эмодзи");
                useFallbackDrawing = true;
                imagesLoaded++;
                checkAllLoaded();
            };
        }
        
        backgroundImg.onload = () => {
            imagesLoaded++;
            checkAllLoaded();
        };
        backgroundImg.onerror = () => {
            console.log("Фон не загрузился");
            useFallbackDrawing = true;
            imagesLoaded++;
            checkAllLoaded();
        };
    }

    function checkAllLoaded() {
        if(imagesLoaded >= 6) {
            gameReady = true;
            resetGame();
        }
    }

    function drawFallbackBackground() {
        ctx.fillStyle = "#d9b48b";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#b97f44";
        ctx.fillRect(0, H-70, W, 70);
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(550, 30, 120, 100);
        ctx.fillStyle = "#f5e2b0";
        ctx.fillRect(555, 35, 110, 90);
        ctx.fillStyle = "#ab8a5c";
        ctx.fillRect(30, 380, 130, 90);
        ctx.fillStyle = "#dbb87a";
        ctx.fillRect(35, 350, 120, 35);
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(450, 380, 140, 100);
        ctx.fillStyle = "#c27e3a";
        ctx.fillRect(460, 340, 120, 50);
        ctx.fillStyle = "#c0a080";
        ctx.beginPath();
        ctx.ellipse(350, 440, 130, 40, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#2d2116";
        ctx.font = "bold 18px Arial";
        ctx.fillText("🖼️ КОМНАТА", 20, 50);
    }

    function drawFallbackHat(x, y, type) {
        ctx.font = "48px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText(fallbackHats[type], x+5, y+50);
    }

    function drawFullScene() {
        if(!gameReady) {
            ctx.fillStyle = "#555";
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Загрузка картинок...", W/2-100, H/2);
            return;
        }

        if(backgroundImg.complete && backgroundImg.naturalWidth > 0 && !useFallbackDrawing) {
            ctx.drawImage(backgroundImg, 0, 0, W, H);
        } else {
            drawFallbackBackground();
        }

        for(let i = 0; i < hats.length; i++) {
            if(!hats[i].found) {
                const hat = hats[i];
                if(hatImages[hat.type] && hatImages[hat.type].complete && hatImages[hat.type].naturalWidth > 0 && !useFallbackDrawing) {
                    ctx.drawImage(hatImages[hat.type], hat.x, hat.y, hat.w, hat.h);
                } else {
                    drawFallbackHat(hat.x, hat.y, hat.type);
                }
            }
        }

        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 3;
        ctx.shadowColor = "black";
        ctx.fillText("🔍 Найди 5 разных шляп! Кликай на них", 20, 40);
        ctx.shadowBlur = 0;
    }

    function checkHatClick(clickX, clickY) {
        for(let i = 0; i < hats.length; i++) {
            const hat = hats[i];
            if(!hat.found) {
                const left = hat.x;
                const right = hat.x + hat.w;
                const top = hat.y;
                const bottom = hat.y + hat.h;
                if(clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
                    hats[i].found = true;
                    const remaining = hats.filter(h => !h.found).length;
                    leftCountSpan.innerText = remaining;
                    updateItemsList();
                    
                    if(remaining === 0) {
                        messageDiv.innerHTML = "🎉 ПОЗДРАВЛЯЮ! Ты нашёл все 5 шляп! 🎉";
                    } else {
                        messageDiv.innerHTML = `✅ Найдена ${hat.name}! Осталось: ${remaining}`;
                    }
                    drawFullScene();
                    return true;
                }
            }
        }
        return false;
    }

    function onCanvasClick(e) {
        if(!gameReady) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX, clientY;
        if(e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const canvasX = (clientX - rect.left) * scaleX;
        const canvasY = (clientY - rect.top) * scaleY;
        
        if(canvasX >= 0 && canvasX <= W && canvasY >= 0 && canvasY <= H) {
            const found = checkHatClick(canvasX, canvasY);
            if(!found) {
                messageDiv.innerHTML = "❌ Мимо! Ищи шляпу на картинке ❌";
                setTimeout(() => {
                    if(hats.filter(h=>!h.found).length > 0)
                        messageDiv.innerHTML = "👀 Внимательнее! Нужно найти 5 разных шляп";
                }, 800);
            }
        }
    }

    function resetGame() {
        hats = [];
        for(let i = 0; i < hatData.length; i++) {
            hats.push({
                id: hatData[i].id,
                name: hatData[i].name,
                type: hatData[i].id,
                x: hatData[i].x,
                y: hatData[i].y,
                w: hatData[i].w,
                h: hatData[i].h,
                found: false
            });
        }
        leftCountSpan.innerText = hats.length;
        buildItemsList();
        messageDiv.innerHTML = "🎩 Найди все 5 разных шляп! Кликай на них 🎩";
        drawFullScene();
    }

    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchstart', onCanvasClick, {passive: false});
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    
    loadImages();
})();