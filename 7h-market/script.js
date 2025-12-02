// 商品数据
const products = [
    {
        id: 1,
        name: "透光浮雕",
        price: 30.00,
        images: [
            "sources/lithophane/images/1.jpg"
        ],
        description: "立体浮雕，展示校园风光，点亮时展现独特色彩",
        specs: ["材质：PLA", "尺寸：150mm * 100mm * 20mm", "电源：5V USB供电"]
    }
];

// 购物车数据
let cart = [];

// 当前展示的商品详情
let currentProduct = null;
let currentImageIndex = 0;

// 修改initializeApp函数
function initializeApp() {
  // 隐藏加载提示
  document.getElementById('loadingMessage').style.display = 'none';
  
  // 显示商品和表单
  document.getElementById('productsGrid').style.display = 'grid';
  document.getElementById('orderSummary').style.display = 'block';
  document.getElementById('orderFormContainer').style.display = 'block';
  
  // 渲染商品
  renderProducts();
  updateOrderSummary();
  
  // 添加取消订单按钮
  addCancelOrderButton();
  
  // 模态框关闭事件
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  
  // 表单提交事件
  document.getElementById('orderForm').addEventListener('submit', submitOrder);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateOrderSummary();
    
    // 模态框关闭事件
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // 表单提交事件
    document.getElementById('orderForm').addEventListener('submit', submitOrder);
    
    // 轮播控制事件
    document.getElementById('prevBtn').addEventListener('click', showPreviousImage);
    document.getElementById('nextBtn').addEventListener('click', showNextImage);
});

// 渲染商品列表
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">¥${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" onclick="decreaseQuantity(${product.id})">-</button>
                        <span class="quantity" id="quantity-${product.id}">0</span>
                        <button class="quantity-btn plus" onclick="increaseQuantity(${product.id})">+</button>
                    </div>
                    <button class="add-btn" onclick="showProductDetail(${product.id})">
                        <i class="fas fa-info-circle"></i> 详情
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// 增加商品数量
function increaseQuantity(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateQuantityDisplay(productId);
    updateOrderSummary();
}

// 减少商品数量
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity--;
        
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        
        updateQuantityDisplay(productId);
        updateOrderSummary();
    }
}

// 更新商品数量显示
function updateQuantityDisplay(productId) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const cartItem = cart.find(item => item.id === productId);
    
    if (quantityElement) {
        quantityElement.textContent = cartItem ? cartItem.quantity : '0';
    }
}

// 更新订单摘要
function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const totalAmount = document.getElementById('totalAmount');
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<div class="empty-cart">您还没有添加任何商品</div>';
        totalAmount.textContent = '¥0.00';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="order-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>¥${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    orderItems.innerHTML = itemsHTML;
    totalAmount.textContent = `¥${total.toFixed(2)}`;
}

// 显示商品详情
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    currentImageIndex = 0;
    
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductDescription').textContent = product.description;
    
    // 更新图片轮播
    updateImageCarousel();
    
    // 更新商品规格
    const specList = document.getElementById('modalProductSpecList');
    specList.innerHTML = '';
    
    product.specs.forEach(spec => {
        const li = document.createElement('li');
        li.textContent = spec;
        specList.appendChild(li);
    });
    
    document.getElementById('productModal').style.display = 'flex';
}

// 更新图片轮播
function updateImageCarousel() {
    const carouselContainer = document.querySelector('.carousel-container');
    const indicatorsContainer = document.getElementById('carouselIndicators');
    
    // 清空现有内容
    carouselContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    // 添加图片
    currentProduct.images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image;
        img.alt = `${currentProduct.name} - 图片${index + 1}`;
        img.className = 'carousel-image';
        if (index === 0) img.classList.add('active');
        carouselContainer.appendChild(img);
    });
    
    // 添加指示器
    currentProduct.images.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'carousel-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => showImage(index));
        indicatorsContainer.appendChild(indicator);
    });
}

// 显示指定图片
function showImage(index) {
    const images = document.querySelectorAll('.carousel-image');
    const indicators = document.querySelectorAll('.carousel-indicator');
    
    // 移除所有active类
    images.forEach(img => img.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // 添加active类到当前图片和指示器
    images[index].classList.add('active');
    indicators[index].classList.add('active');
    
    currentImageIndex = index;
}

// 显示上一张图片
function showPreviousImage() {
    let newIndex = currentImageIndex - 1;
    if (newIndex < 0) {
        newIndex = currentProduct.images.length - 1;
    }
    showImage(newIndex);
}

// 显示下一张图片
function showNextImage() {
    let newIndex = currentImageIndex + 1;
    if (newIndex >= currentProduct.images.length) {
        newIndex = 0;
    }
    showImage(newIndex);
}

// 关闭模态框
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 提交订单
// 在订单表单部分，替换原有的班级和座号输入框
function renderOrderForm() {
  const orderFormContainer = document.getElementById('orderFormContainer');
  
  // 生成班级选项 (1-16)
  let classOptions = '';
  for (let i = 1; i <= 16; i++) {
    classOptions += `<option value="${i}班">${i}班</option>`;
  }
  
  // 生成座号选项 (1-52)
  let seatOptions = '';
  for (let i = 1; i <= 52; i++) {
    seatOptions += `<option value="${i}">${i}</option>`;
  }
  
  orderFormContainer.innerHTML = `
    <h2>预订信息</h2>
    <form id="orderForm">
      <div class="form-group">
        <label for="className">班级</label>
        <select id="className" class="form-control" required>
          <option value="">请选择班级</option>
          ${classOptions}
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label for="seatNumber">座号</label>
          <select id="seatNumber" class="form-control" required>
            <option value="">请选择座号</option>
            ${seatOptions}
          </select>
        </div>
        
        <div class="form-group" style="flex: 2;">
          <label for="studentName">姓名</label>
          <input type="text" id="studentName" class="form-control" placeholder="请输入您的姓名" required>
        </div>
      </div>
      
      <div class="form-group">
        <label for="contact">联系方式</label>
        <input type="text" id="contact" class="form-control" placeholder="手机号或微信号" required>
      </div>
      
      <div class="form-group">
        <label>配送方式</label>
        <div class="radio-group">
          <div class="radio-option">
            <input type="radio" id="deliveryClass" name="delivery" value="送到班级" checked>
            <label for="deliveryClass">送到班级</label>
          </div>
          <div class="radio-option">
            <input type="radio" id="selfPickup" name="delivery" value="现场自提">
            <label for="selfPickup">现场自提</label>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label>订单类型</label>
        <div class="radio-group">
          <div class="radio-option">
            <input type="radio" id="newOrder" name="orderType" value="新订单" checked>
            <label for="newOrder">新订单</label>
          </div>
          <div class="radio-option">
            <input type="radio" id="replaceOrder" name="orderType" value="替换原来的订单">
            <label for="replaceOrder">替换原来的订单</label>
          </div>
        </div>
      </div>
      
      <div class="payment-notice">
        <i class="fas fa-info-circle"></i> 我们将在交货时收款
      </div>
      
      <button type="submit" class="submit-btn">提交预订</button>
    </form>
  `;
}

// 在页面底部添加取消订单按钮
function addCancelOrderButton() {
  const container = document.querySelector('.container');
  
  const cancelOrderSection = document.createElement('div');
  cancelOrderSection.className = 'cancel-order-section';
  cancelOrderSection.innerHTML = `
    <div class="cancel-order">
      <button class="cancel-btn" id="cancelOrderBtn">
        <i class="fas fa-times-circle"></i> 取消原先的所有订单
      </button>
    </div>
  `;
  
  container.appendChild(cancelOrderSection);
  
  // 添加取消订单模态框
  const cancelOrderModal = document.createElement('div');
  cancelOrderModal.className = 'modal';
  cancelOrderModal.id = 'cancelOrderModal';
  cancelOrderModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">取消订单</h2>
        <button class="close-btn" id="closeCancelModal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="cancelOrderForm">
          <div class="form-group">
            <label for="cancelClassName">班级</label>
            <select id="cancelClassName" class="form-control" required>
              <option value="">请选择班级</option>
              ${generateClassOptions()}
            </select>
          </div>
          
          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label for="cancelSeatNumber">座号</label>
              <select id="cancelSeatNumber" class="form-control" required>
                <option value="">请选择座号</option>
                ${generateSeatOptions()}
              </select>
            </div>
            
            <div class="form-group" style="flex: 2;">
              <label for="cancelStudentName">姓名</label>
              <input type="text" id="cancelStudentName" class="form-control" placeholder="请输入您的姓名" required>
            </div>
          </div>
          
          <div class="payment-notice">
            <i class="fas fa-exclamation-triangle"></i> 确定要取消所有订单吗？此操作不可撤销。
          </div>
          
          <button type="submit" class="submit-btn cancel-confirm-btn">确认取消所有订单</button>
        </form>
      </div>
    </div>
  `;
  
  document.body.appendChild(cancelOrderModal);
  
  // 添加事件监听
  document.getElementById('cancelOrderBtn').addEventListener('click', function() {
    document.getElementById('cancelOrderModal').style.display = 'flex';
  });
  
  document.getElementById('closeCancelModal').addEventListener('click', function() {
    document.getElementById('cancelOrderModal').style.display = 'none';
  });
  
  document.getElementById('cancelOrderModal').addEventListener('click', function(e) {
    if (e.target === this) {
      document.getElementById('cancelOrderModal').style.display = 'none';
    }
  });
  
  document.getElementById('cancelOrderForm').addEventListener('submit', submitCancelOrder);
}

// 生成班级选项的函数
function generateClassOptions() {
  let options = '';
  for (let i = 1; i <= 16; i++) {
    options += `<option value="${i}班">${i}班</option>`;
  }
  return options;
}

// 生成座号选项的函数
function generateSeatOptions() {
  let options = '';
  for (let i = 1; i <= 52; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

// 提交取消订单请求
function submitCancelOrder(e) {
  e.preventDefault();
  
  const className = document.getElementById('cancelClassName').value;
  const seatNumber = document.getElementById('cancelSeatNumber').value;
  const studentName = document.getElementById('cancelStudentName').value;
  
  // 构建取消订单信息
  let cancelMessage = `取消所有订单\n`;
  cancelMessage += `----------------\n`;
  cancelMessage += `姓名：${studentName}\n`;
  cancelMessage += `班级：${className}\n`;
  cancelMessage += `座号：${seatNumber}\n`;
  cancelMessage += `----------------\n`;
  cancelMessage += `取消时间：${new Date().toLocaleString()}`;
  
  // 发送到ntfy
  sendToNtfy(cancelMessage);
  
  // 显示成功通知
  showNotification('订单取消成功！');
  
  // 关闭模态框并重置表单
  document.getElementById('cancelOrderModal').style.display = 'none';
  document.getElementById('cancelOrderForm').reset();
}

// 修改submitOrder函数
function submitOrder(e) {
  e.preventDefault();
  
  if (cart.length === 0) {
    showNotification('请先添加商品到购物车');
    return;
  }
  
  const className = document.getElementById('className').value;
  const seatNumber = document.getElementById('seatNumber').value;
  const studentName = document.getElementById('studentName').value;
  const contact = document.getElementById('contact').value;
  const delivery = document.querySelector('input[name="delivery"]:checked').value;
  const orderType = document.querySelector('input[name="orderType"]:checked').value;
  
  // 构建订单信息
  let orderMessage = `${orderType}\n`;
  orderMessage += `----------------\n`;
  orderMessage += `姓名：${studentName}\n`;
  orderMessage += `班级：${className}\n`;
  orderMessage += `座号：${seatNumber}\n`;
  orderMessage += `联系方式：${contact}\n`;
  orderMessage += `配送方式：${delivery}\n`;
  orderMessage += `----------------\n`;
  orderMessage += `订单详情：\n`;
  
  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    orderMessage += `- ${item.name} × ${item.quantity} = ¥${itemTotal.toFixed(2)}\n`;
  });
  
  orderMessage += `----------------\n`;
  orderMessage += `总计：¥${total.toFixed(2)}\n`;
  orderMessage += `注意：我们将在交货时收款\n`;
  orderMessage += `下单时间：${new Date().toLocaleString()}`;
  
  // 发送到ntfy
  sendToNtfy(orderMessage);
  
  // 显示成功通知
  showNotification('预订成功！订单已发送');
  
  // 重置表单和购物车
  document.getElementById('orderForm').reset();
  cart = [];
  updateOrderSummary();
  products.forEach(product => updateQuantityDisplay(product.id));
}

// 发送到ntfy
function sendToNtfy(message) {
    // 请替换为您的ntfy主题
    const ntfyTopic = 'school_fair_order';
    
    fetch(`https://ntfy.sh/7h-market`, {
        method: 'POST',
        body: message,
        headers: {
            'Title': 'New Order Received',
            'Priority': 'high',
            'Tags': 'shopping_cart'
        }
    }).catch(error => {
        console.error('发送到ntfy失败:', error);
    });
}

// 显示通知
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}