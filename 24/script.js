let numbers = [];
let difficulties = [];
let players = 2;
let currentResult;
let level = '?';
let isSolutionShown = false;
let scores = [];
let timeLeft = 20;
let timerId;
let selectedPlayers = [];
let isPaused = false;
let gameStats = {
    total: 0,
    solved: 0,
    totalTime: 0,
    bestTime: 999,
    option: 0
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

function compute(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') {
        if (b === 0) return null;
        return a / b;
    }
    return null;
}

function evaluateStructure1(nums, ops) {
    const [a, b, c, d] = nums;
    const [op1, op2, op3] = ops;
    const step1 = compute(a, b, op1);
    if (step1 === null) return null;
    const step2 = compute(step1, c, op2);
    if (step2 === null) return null;
    const step3 = compute(step2, d, op3);
    if (step3 === null) return null;
    return { value: step3, expr: `((${a} ${op1} ${b}) ${op2} ${c}) ${op3} ${d}` };
}

function evaluateStructure2(nums, ops) {
    const [a, b, c, d] = nums;
    const [op1, op2, op3] = ops;
    const left = compute(a, b, op1);
    if (left === null) return null;
    const right = compute(c, d, op2);
    if (right === null) return null;
    const result = compute(left, right, op3);
    if (result === null) return null;
    return { value: result, expr: `(${a} ${op1} ${b}) ${op3} (${c} ${op2} ${d})` };
}

function evaluateStructure3(nums, ops) {
    const [a, b, c, d] = nums;
    const [op1, op2, op3] = ops;
    const inner = compute(c, d, op1);
    if (inner === null) return null;
    const middle = compute(b, inner, op2);
    if (middle === null) return null;
    const result = compute(a, middle, op3);
    if (result === null) return null;
    return { value: result, expr: `${a} ${op3} (${b} ${op2} (${c} ${op1} ${d}))` };
}

function evaluateStructure4(nums, ops) {
    const [a, b, c, d] = nums;
    const [op1, op2, op3] = ops;
    const inner = compute(b, c, op1);
    if (inner === null) return null;
    const middle = compute(inner, d, op2);
    if (middle === null) return null;
    const result = compute(a, middle, op3);
    if (result === null) return null;
    return { value: result, expr: `${a} ${op3} ((${b} ${op1} ${c}) ${op2} ${d})` };
}

function evaluateStructure5(nums, ops) {
    const [a, b, c, d] = nums;
    const [op1, op2, op3] = ops;
    const inner = compute(b, c, op1);
    if (inner === null) return null;
    const middle = compute(a, inner, op2);
    if (middle === null) return null;
    const result = compute(middle, d, op3);
    if (result === null) return null;
    return { value: result, expr: `(${a} ${op2} (${b} ${op1} ${c})) ${op3} ${d}` };
}

function getUniquePermutations(nums) {
    const result = [];
    nums.sort((a, b) => a - b);
    const used = new Array(nums.length).fill(false);
    const backtrack = (path) => {
        if (path.length === nums.length) {
            result.push([...path]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
            used[i] = true;
            backtrack(path.concat(nums[i]));
            used[i] = false;
        }
    };
    backtrack([]);
    return result;
}

function solve24(numbers) {
    const permutations = getUniquePermutations(numbers);
    const operatorCombinations = [];
    const ops = ['+', '-', '*', '/'];
    for (const op1 of ops) {
        for (const op2 of ops) {
            for (const op3 of ops) {
                operatorCombinations.push([op1, op2, op3]);
            }
        }
    }
    const solutions = new Set();
    const isApprox24 = (value) => Math.abs(value - 24) < 1e-6;

    for (const perm of permutations) {
        for (const ops of operatorCombinations) {
            const evaluators = [evaluateStructure1, evaluateStructure2, evaluateStructure3, evaluateStructure4, evaluateStructure5];
            for (const evaluator of evaluators) {
                const result = evaluator(perm, ops);
                if (result && isApprox24(result.value)) {
                    solutions.add(result.expr.replace(/(\D)\.0/g, '$1')); // 移除整数后的.0
                }
            }
        }
    }

    const answer = solutions.size > 0 ? Array.from(solutions)[0] : '';
    return {
        success: solutions.size > 0,
        answer: answer,
        count: solutions.size
    };
}

// 示例用法：
console.log(solve24([3, 3, 8, 8]));

function levelPadding() {
    if(currentResult.count > 100) return 'supereasy';
    if(currentResult.count > 50) return 'easy';
    if(currentResult.count > 20) return 'medium';
    if(currentResult.count > 2) return 'hard';
    return 'insane';
}

function generateNumbers() {
    const hasHigh = document.getElementById('highNumbers').checked;
    difficulties[0] = (document.getElementById('difficulty_supereasy').checked ? 'supereasy' : null);
    difficulties[1] = (document.getElementById('difficulty_easy').checked ? 'easy' : null);
    difficulties[2] = (document.getElementById('difficulty_medium').checked ? 'medium' : null);
    difficulties[3] = (document.getElementById('difficulty_hard').checked ? 'hard' : null);
    difficulties[4] = (document.getElementById('difficulty_insane').checked ? 'insane' : null);
    
    do {
        numbers = Array.from({length:4}, () => 
            Math.floor(Math.random()*(hasHigh ? 13 : 10) + 1))
        currentResult = solve24([...numbers]);
        level = levelPadding();
    } while (currentResult.success ? !(difficulties.every(item => item === null) || difficulties.includes(level)) : true) 
    displayNumbers();
    document.getElementById('curCount').textContent = (currentResult.count);
    document.getElementById('level').textContent    = level;
}

function updateStats(solved, timeUsed) {
    gameStats.total++;
    if(solved) gameStats.solved++;
    gameStats.totalTime += timeUsed;
    if(solved && timeUsed < gameStats.bestTime) gameStats.bestTime = timeUsed;
    gameStats.option = hasHigh;
    localStorage.setItem('24game_stats', JSON.stringify(gameStats));
    showStats();
}

function showStats() {
    document.getElementById('avgTime').textContent   = (gameStats.total ? (gameStats.totalTime / gameStats.total).toFixed(2) : 0);
    document.getElementById('bestTime').textContent  = (gameStats.bestTime === 999 ? 0 : gameStats.bestTime.toFixed(2));
    document.getElementById('solveRate').textContent = (gameStats.total ? ((gameStats.solved / gameStats.total)*100).toFixed(1) : 0) + '%';
}

function loadStats() {
    const saved = localStorage.getItem('24game_stats');
    if(saved) gameStats = JSON.parse(saved);
    else gameStats = {
        total: 0,
        solved: 0,
        totalTime: 0,
        bestTime: 999,
        option: 0
    };
    hasHigh = gameStats.option;
    showStats();
}

function clearStats() {
    localStorage.clear();
    loadStats();
}

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        if(!isPaused) {
            clearInterval(timerId);
            isPaused = true;
            const timeUsed = 20 - timeLeft;
            updateStats(true, timeUsed);
        }
        else if (isSolutionShown) {
            isSolutionShown = false;
            startRound();
        }
        else {
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
                timeLeft = 0;
                showSolution();
            }
            updateTimer();
        }
    }, 10);
}

function displayNumbers() {
    const container = document.getElementById('number-container');
    container.innerHTML = numbers.map(n => 
        `<div class="number-box">
            ${n}
         </div>`
    ).join('');
}
        //    <span class="player-label">${n}</span>

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
    
    document.getElementById('solution').textContent = currentResult.answer;
}

// 初始化游戏
setupScoreBoard();