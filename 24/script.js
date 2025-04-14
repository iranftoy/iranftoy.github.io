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

function valid() {
    var s = arr;
    if (s.length != 4) {
        alert("必须输入4个整数！");
        F.a.focus();
        return false
    }
    //格式化输入
    if (s.join(" ") != F.a.value) F.a.value = s.join(" ")
    var b = [] //四个数字保存在b[1] b[2] b[4] b[8]中
    for (var i in s) b[1 << i] = parseInt(s[i])
    var n = F.count1.options[F.count1.selectedIndex].value; //需要计算的答案数
    var k = 0 //已经算出的答案数
    var result = {} //保存已经算出的答案,去掉重复
    F.text.value = "";
    //输出结果,找满答案返回true
    var writeResult = function(s) {
        //按顺序替换符号与数字
        s = s.replace("%", O[f1].name).replace("%", O[f2].name).replace("%", O[f3].name)
        s = s.replace("N", b[i1]).replace("N", b[i2]).replace("N", b[i3]).replace("N", b[i4])
        if (result[s]) return //已经重复了
        result[s] = 1 //记录
        F.text.value += s + "\n";
        return ++k >= n
    }
    for (var i1 = 1; i1 <= 8; i1 <<= 1)
        for (var i2 = 1; i2 <= 8; i2 <<= 1)
            for (var i3 = 1; i3 <= 8; i3 <<= 1)
                for (var i4 = 1; i4 <= 8; i4 <<= 1) {
                    //所有数字排列组合，简单去掉重复数字
                    if ((i1 | i2 | i3 | i4) != 0xf) continue;
                    for (var f1 = 0; f1 <= 3; f1++)
                        for (var f2 = 0; f2 <= 3; f2++)
                            for (var f3 = 0; f3 <= 3; f3++) {
                                var of1 = O[f1],
                                    of2 = O[f2],
                                    of3 = O[f3];
                                // ((1,2)3)4
                                var m = of3.f(of2.f(of1.f(b[i1], b[i2]), b[i3]), b[i4]);
                                if (Math.abs(m - 24) < 1e-5)
                                    if (writeResult("((N%N)%N)%N")) return false
                                // 1((2,3)4)
                                m = of1.f(b[i1], of3.f(of2.f(b[i2], b[i3]), b[i4]));
                                if (Math.abs(m - 24) < 1e-5)
                                    if (writeResult("N%((N%N)%N)")) return false
                                //  (1(2,3))4
                                m = of3.f(of1.f(b[i1], of2.f(b[i2], b[i3])), b[i4]);
                                if (Math.abs(m - 24) < 1e-5)
                                    if (writeResult("(N%(N%N))%N")) return false
                                //1(2(3,4))
                                m = of1.f(b[i1], of2.f(b[i2], of3.f(b[i3], b[i4])));
                                if (Math.abs(m - 24) < 1e-5)
                                    if (writeResult("N%(N%(N%N))")) return false
                                //(1,2)(3,4)
                                m = of2.f(of1.f(b[i1], b[i2]), of3.f(b[i3], b[i4]));
                                if (Math.abs(m - 24) < 1e-5)
                                    if (writeResult("(N%N)%(N%N)")) return false
                            }
                }
    F.text.value += "----END----\n"
    return false
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
    document.getElementById('solution').textContent = 
        `Failed`;
}

// 初始化游戏
setupScoreBoard();