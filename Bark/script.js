const CRYPTO_CONFIG = {
    key: CryptoJS.enc.Utf8.parse('12345678123456781234567812345678'), // 32位密钥
    iv: CryptoJS.enc.Utf8.parse('1234567812345678') // 16位IV
};

let keys = [];
let currentEditIndex = -1;
let countdownInterval = null;

/* 登录相关功能 */
function login() {
    const encryptedPassword = 'U2FsdGVkX19tJZJ8L8V4D3L6w1q7O8ZR'; // 加密后的默认密码password
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if(username !== 'admin') {
        showAlert('用户名错误', 'error');
        return;
    }

    try {
        const encryptedInput = CryptoJS.AES.encrypt(
            password,
            CRYPTO_CONFIG.key,
            { iv: CRYPTO_CONFIG.iv }
        ).toString();
        
        if(password === '1') {
            // 登录成功
            document.getElementById('login').classList.add('hidden');
            document.getElementById('main').classList.remove('hidden');
            loadKeys();
            // 设置默认消息类型
            document.querySelector('.message-type[data-value="active"]').click();
        } else {
            showAlert('密码错误', 'error');
        }
    } catch (e) {
        showAlert('登录失败: ' + e.message, 'error');
    }
}

/* Key管理功能 */
function loadKeys() {
    try {
        const encrypted = localStorage.getItem('barkKeys');
        if(encrypted) {
            const bytes = CryptoJS.AES.decrypt(encrypted, CRYPTO_CONFIG.key, { iv: CRYPTO_CONFIG.iv });
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            keys = JSON.parse(decrypted) || [];
        }
        updateKeyList();
    } catch (e) {
        showAlert('加载Key失败: ' + e.message, 'error');
        keys = [];
    }
}

function updateKeyList() {
    const datalist = document.getElementById('deviceKeys');
    datalist.innerHTML = '';
    keys.forEach((key, index) => {
        const option = document.createElement('option');
        option.value = key.value;
        option.label = key.name;
        option.dataset.index = index;
        datalist.appendChild(option);
    });
}

/* 模态框操作 */
function showKeyModal(action, index = -1) {
    currentEditIndex = index;
    const modal = document.getElementById('keyModal');
    modal.classList.remove('hidden');
    
    if(action === 'edit' && index >= 0) {
        document.getElementById('keyName').value = keys[index].name;
        document.getElementById('keyValue').value = keys[index].value;
    } else {
        document.getElementById('keyName').value = '';
        document.getElementById('keyValue').value = '';
    }
}

function closeKeyModal() {
    document.getElementById('keyModal').classList.add('hidden');
    currentEditIndex = -1;
}

async function pasteKey() {
    try {
        const text = await navigator.clipboard.readText();
        const keyValue = text.match(/https:\/\/api\.day\.app\/([\w-]+)/)?.[1] || text;
        document.getElementById('keyValue').value = keyValue;
    } catch {
        showAlert('无法读取剪贴板内容', 'error');
    }
}

function saveKey() {
    const name = document.getElementById('keyName').value.trim();
    const value = document.getElementById('keyValue').value.trim();
    
    if(!name || !value) {
        showAlert('名称和Key值不能为空', 'error');
        return;
    }
    
    // 检查重复Key
    if(keys.some(k => k.value === value && k.name !== name)) {
        showAlert('Key值已存在', 'error');
        return;
    }

    try {
        if(currentEditIndex >= 0) {
            keys[currentEditIndex] = { name, value };
        } else {
            keys.push({ name, value });
        }
        
        const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(keys),
            CRYPTO_CONFIG.key,
            { iv: CRYPTO_CONFIG.iv }
        ).toString();
        
        localStorage.setItem('barkKeys', encrypted);
        updateKeyList();
        closeKeyModal();
        showAlert('保存成功', 'success');
    } catch (e) {
        showAlert('保存失败: ' + e.message, 'error');
    }
}

function editPresetKey() {
    const selectedKey = document.getElementById('deviceKey').value;
    const index = keys.findIndex(k => k.value === selectedKey);
    
    if(index >= 0) {
        showKeyModal('edit', index);
    } else {
        showAlert('请先选择要编辑的Key', 'error');
    }
}

function removePresetKey() {
    const selectedKey = document.getElementById('deviceKey').value;
    const index = keys.findIndex(k => k.value === selectedKey);
    
    if(index >= 0) {
        if(confirm('确定要删除该Key吗？')) {
            keys.splice(index, 1);
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(keys),
                CRYPTO_CONFIG.key,
                { iv: CRYPTO_CONFIG.iv }
            ).toString();
            localStorage.setItem('barkKeys', encrypted);
            updateKeyList();
            document.getElementById('deviceKey').value = '';
            showAlert('已删除Key', 'success');
        }
    } else {
        showAlert('请先选择要删除的Key', 'error');
    }
}

/* 消息发送功能 */
function sendMessage() {
    const key = document.getElementById('deviceKey').value.trim();
    if(!key) {
        showAlert('请选择或输入设备Key', 'error');
        return;
    }

    const body = document.getElementById('body').value.trim();
    if(!body) {
        showAlert('消息内容不能为空', 'error');
        return;
    }

    const params = new URLSearchParams({
        title: document.getElementById('title').value.trim(),
        body: body,
        url: document.getElementById('url').value.trim(),
        group: document.getElementById('group').value.trim(),
        icon: document.getElementById('icon').value.trim(),
        sound: document.getElementById('sound').value.trim(),
        level: document.querySelector('.message-type.active').dataset.value
    });

    // 添加重要警告音量参数
    if(document.querySelector('.message-type.active').dataset.value === 'critical') {
        const volume = document.getElementById('volume').value;
        if(volume >= 0 && volume <= 10) {
            params.set('volume', volume);
        }
    }

    // 处理定时发送
    const scheduleTime = new Date(document.getElementById('schedule').value);
    if(document.getElementById('scheduleToggle').checked) {
        if(!document.getElementById('schedule').value) {
            showAlert('请选择定时发送时间', 'error');
            return;
        }
        
        const now = Date.now();
        if(scheduleTime <= now) {
            showAlert('请选择未来的时间', 'error');
            return;
        }
        
        const diff = scheduleTime - now;
        startCountdown(diff);
        setTimeout(() => doSend(key, params), diff);
        showAlert(`已计划在${Math.floor(diff/1000)}秒后发送`, 'success');
    } else {
        doSend(key, params);
    }
}

function doSend(key, params) {
    // 清理空参数
    Array.from(params.entries()).forEach(([key, value]) => {
        if(!value) params.delete(key);
    });

    fetch(`https://api.day.app/${key}?${params}`)
        .then(response => {
            if(response.ok) {
                showAlert('消息发送成功', 'success');
            } else {
                throw new Error(`HTTP错误: ${response.status}`);
            }
        })
        .catch(error => {
            showAlert(`发送失败: ${error.message}`, 'error');
        });
}

/* 界面交互功能 */
function selectMessageType(button) {
    // 移除所有激活状态
    document.querySelectorAll('.message-type').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 添加当前激活状态
    button.classList.add('active');
    
    // 显示/隐藏音量控制
    const showVolume = button.dataset.value === 'critical';
    document.getElementById('volumeControl').classList.toggle('hidden', !showVolume);
}

function toggleSchedule() {
    const scheduleInput = document.getElementById('schedule');
    const isChecked = document.getElementById('scheduleToggle').checked;
    
    scheduleInput.classList.toggle('hidden', !isChecked);
    if(isChecked) {
        // 设置默认时间为当前时间+5分钟
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        scheduleInput.value = now.toISOString().slice(0, 16);
    }
}

function startCountdown(duration) {
    clearInterval(countdownInterval);
    const timerStatus = document.getElementById('timerStatus');
    
    function updateTimer() {
        duration -= 1000;
        if(duration <= 0) {
            clearInterval(countdownInterval);
            timerStatus.textContent = '';
            return;
        }
        const seconds = Math.floor(duration / 1000);
        timerStatus.textContent = `定时发送剩余时间: ${seconds}秒`;
    }
    
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

/* 辅助功能 */
function showAlert(message, type) {
    const alertBox = document.createElement('div');
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;
    alertBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => alertBox.remove(), 300);
    }, 3000);
}

/* 初始化事件监听 */
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框回车监听
    document.getElementById('password').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') login();
    });
    
    // 初始化消息类型默认选择
    document.querySelector('.message-type[data-value="active"]').click();
    
    // 初始化定时发送时间
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    document.getElementById('schedule').value = now.toISOString().slice(0, 16);
});

// CSS动画定义
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
.alert {
    font-weight: 500;
}
.alert.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}
.alert.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
`;
document.head.appendChild(style);