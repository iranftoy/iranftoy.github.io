let numbers = [];
let players = 2;
let scores = [];
let timeLeft = 20;
let timerId;
let selectedPlayers = [];
let isPaused = false;
let gameStats = {
    total: 0,
    solved: 0,
    totalTime: 0,
    bestTime: Infinity
};

// 初始化统计
loadStats();

function confirmScore() {
    if(selectedPlayers.length === 0) {
        updateScores(false,20)
        showSolution();
        startRound()
    }
    
    const points = selectedPlayers.length === 3 ? [2,1,1] : 
        selectedPlayers.length === 2 ? [2,2] : [4];
    
    selectedPlayers.forEach((p,i) => {
        scores[p] += points[i] || 2;
    });
    
    updateScores();
    startRound();
}

function updateScores() {
    scores.forEach((s,i) => {
        document.getElementById(`score${i}`).textContent = s;
    });
}

function calculateSolutions(nums) {
    const ops = ['+', '-', '*', '/'];
    
    function dfs(arr) {
        if(arr.length === 1) return Math.abs(arr[0] - 24) < 0.0001;
        
        for(let i=0; i<arr.length; i++) {
            for(let j=0; j<arr.length; j++) {
                if(i === j) continue;
                const remaining = arr.filter((_,k) => k !== i && k !== j);
                for(let op of ops) {
                    let result;
                    try {
                        switch(op) {
                            case '+': result = arr[i] + arr[j]; break;
                            case '-': result = arr[i] - arr[j]; break;
                            case '*': result = arr[i] * arr[j]; break;
                            case '/': result = arr[j] !== 0 ? arr[i] / arr[j] : null; break;
                        }
                    } catch { continue; }
                    if(result === null) continue;
                    if(dfs([...remaining, result])) return true;
                }
            }
        }
        return false;
    }
    
    return dfs([...nums]);
}

function generateNumbers() {
    const hasHigh = document.getElementById('highNumbers').checked;
    do {
        numbers = Array.from({length:4}, () => 
            Math.floor(Math.random()*(hasHigh ? 13 : 10) + 1))
    } while(!calculateSolutions([...numbers]));
    displayNumbers();
}

function updateStats(solved, timeUsed) {
    gameStats.total++;
    if(solved) gameStats.solved++;
    gameStats.totalTime += timeUsed;
    if(solved && timeUsed < gameStats.bestTime) gameStats.bestTime = timeUsed;
    
    localStorage.setItem('24game_stats', JSON.stringify(gameStats));
    showStats();
}

function showStats() {
    document.getElementById('avgTime').textContent = 
        (gameStats.total ? (gameStats.totalTime / gameStats.total).toFixed(2) : 0);
    document.getElementById('bestTime').textContent = 
        (gameStats.bestTime === Infinity ? 0 : gameStats.bestTime.toFixed(2));
    document.getElementById('solveRate').textContent = 
        (gameStats.total ? ((gameStats.solved / gameStats.total)*100).toFixed(1) : 0) + '%';
}

function loadStats() {
    const saved = localStorage.getItem('24game_stats');
    if(saved) gameStats = JSON.parse(saved);
    showStats();
}

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        if(!isPaused) {
            clearInterval(timerId);
            isPaused = true;
            const timeUsed = 20 - timeLeft;
            updateStats(true, timeUsed);
        } else {
            isPaused = false;
            confirmScore();
        }
    }

    const playerIndex = ['1','2','3','4'].indexOf(e.key);
    if(playerIndex !== -1 && playerIndex < players && isPaused) {
        if(!selectedPlayers.includes(playerIndex)) {
            selectedPlayers.push(playerIndex);
            updateScorePreview();
        }
    }
    if(e.key === 'z') {
        selectedPlayers.pop();
        updateScorePreview();
    }
});

function startGame(numPlayers) {
    players = numPlayers;
    document.getElementById('player-select').style.display = 'none';
    scores = new Array(players).fill(0);
    setupScoreBoard();
    startRound();
}

function startRound() {
    generateNumbers();
    timeLeft = 20;
    selectedPlayers = [];
    isPaused = false;
    document.getElementById('solution').textContent = '';
    updateTimer();
    updateScorePreview();
    
    if(timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        if(!isPaused) {
            timeLeft -= 0.01;
            if(timeLeft <= 0) {
                clearInterval(timerId);
                updateStats(false, 20);
                showSolution();
                setTimeout(startRound, 3000);
            }
            updateTimer();
        }
    }, 10);
}

function displayNumbers() {
    const container = document.getElementById('number-container');
    container.innerHTML = numbers.map(n => 
        `<div class="number-box">
            <span class="player-label">${n}</span>
            ${n}
         </div>`
    ).join('');
}

function updateTimer() {
    const timer = document.getElementById('timer');
    timer.textContent = timeLeft.toFixed(2);
    timer.className = timeLeft <= 5 ? 'red' : '';
}

function setupScoreBoard() {
    const board = document.getElementById('score-board');
    board.innerHTML = Array.from({length: players}, (_,i) => 
        `<div class="player-score">
            玩家${i+1}<br>
            <span id="score${i}">0</span>
            <div class="preview" id="preview${i}"></div>
         </div>`
    ).join('');
}

function updateScorePreview() {
    for(let i=0; i<players; i++) {
        document.getElementById(`preview${i}`).textContent = 
            selectedPlayers.includes(i) ? '✅' : '';
    }
}

function showSolution() {
    
    document.getElementById('solution').textContent = '';
}

// 初始化游戏
setupScoreBoard();