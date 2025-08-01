// ========== SMART PANTRY - OPTIMIZED VERSION ==========

// Data Storage
let pantryItems = JSON.parse(localStorage.getItem('pantryItems') || '[]');
let mealPlans = JSON.parse(localStorage.getItem('mealPlans') || '{}');
let currentUser = JSON.parse(localStorage.getItem('smartPantryUser') || 'null');

// ========== CORE FUNCTIONALITY ==========

// Notification System
function showNotification(message, type = 'success', duration = 3000) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `position:fixed;top:20px;right:20px;padding:1rem 1.5rem;border-radius:8px;color:white;z-index:3000;max-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideInRight 0.3s ease;font-weight:500;background:${
        {success:'#28a745',error:'#dc3545',warning:'#ffc107',info:'#17a2b8'}[type] || '#28a745'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Generic Modal Management
const modalActions = {
    open: (modalId, resetForm = true) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('active');
        if (resetForm) {
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
        const firstInput = modal.querySelector('input');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    },
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }
};

// Data Management
function saveData() {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
}

function getItemStatus(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring';
    return 'fresh';
}

// ========== DASHBOARD FUNCTIONS ==========

function updateDashboardStats() {
    const totalItems = pantryItems.length;
    const expiringItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expiring').length;
    const expiredItems = pantryItems.filter(item => getItemStatus(item.expiry) === 'expired').length;
    const lowStockItems = pantryItems.filter(item => parseInt(item.quantity) <= 2).length;
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('expiringItems').textContent = expiringItems;
    document.getElementById('expiredItems').textContent = expiredItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsContainer');
    const alerts = [];
    
    pantryItems.forEach(item => {
        const status = getItemStatus(item.expiry);
        if (status === 'expired') alerts.push(`${item.name} has expired!`);
        else if (status === 'expiring') alerts.push(`${item.name} expires soon`);
        if (parseInt(item.quantity) <= 2) alerts.push(`${item.name} is running low`);
    });
    
    alertsContainer.innerHTML = alerts.length > 0 ? 
        alerts.slice(0, 3).map(alert => `<div class="alert">${alert}</div>`).join('') :
        '<div class="no-alerts">No alerts - everything looks good!</div>';
}

function updatePlannedMealsPreview() {
    const container = document.getElementById('plannedMealsPreview');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayMeals = mealPlans[today] || {};
    
    container.innerHTML = `
        <div class="meal-preview">
            <strong>Today's Meals:</strong>
            <div>Breakfast: ${todayMeals.breakfast || 'Not planned'}</div>
            <div>Lunch: ${todayMeals.lunch || 'Not planned'}</div>
            <div>Dinner: ${todayMeals.dinner || 'Not planned'}</div>
        </div>
    `;
}

function updateRecipeSuggestions() {
    const container = document.getElementById('recipeSuggestions');
    const suggestions = ['Chicken Stir Fry', 'Pasta Primavera', 'Grilled Salmon', 'Vegetable Curry'];
    container.innerHTML = suggestions.map(recipe => 
        `<div class="recipe-suggestion" onclick="addRecipeToMealPlan('${recipe}')">${recipe}</div>`
    ).join('');
}

function addRecipeToMealPlan(recipeName) {
    showNotification(`${recipeName} would be added to your meal plan`, 'info');
}

// ========== INVENTORY FUNCTIONS ==========

function renderPantryItems(filter = 'all') {
    const container = document.querySelector('.inventory-grid');
    if (!container) return;
    
    const filteredItems = filter === 'all' ? pantryItems : pantryItems.filter(item => item.category === filter);
    
    if (filteredItems.length === 0) {
        container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#666;">No items found</div>';
        return;
    }
    
    container.innerHTML = filteredItems.map(item => {
        const status = getItemStatus(item.expiry);
        return `
            <div class="inventory-item ${status}">
                <div class="item-header">
                    <h3 class="item-name">${item.name}</h3>
                    <span class="item-status ${status}">${status}</span>
                </div>
                <div class="item-details">
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Expiry:</strong> ${new Date(item.expiry).toLocaleDateString()}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-small btn-primary" onclick="editInventoryItem(${item.id})">Edit</button>
                    <button class="btn-small btn-danger" onclick="deleteInventoryItem(${item.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function addItem() {
    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value;
    const quantity = document.getElementById('itemQuantity').value.trim();
    const expiry = document.getElementById('itemExpiry').value;
    
    if (!name || !category || !quantity || !expiry) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const existingItem = pantryItems.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingItem) {
        if (confirm(`${name} already exists. Update quantity instead?`)) {
            existingItem.quantity = quantity;
            existingItem.expiry = expiry;
            existingItem.status = getItemStatus(expiry);
            saveData();
            renderPantryItems();
            closeAddItemModal();
            showNotification(`${name} updated successfully!`, 'success');
        }
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name, category, quantity, expiry,
        status: getItemStatus(expiry)
    };
    
    pantryItems.push(newItem);
    saveData();
    renderPantryItems();
    updateDashboardStats();
    closeAddItemModal();
    showNotification(`${name} added to pantry!`, 'success');
}

function editInventoryItem(itemId) {
    const item = pantryItems.find(i => i.id === itemId);
    if (!item) return;
    
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemCategory').value = item.category;
    document.getElementById('editItemQuantity').value = item.quantity;
    document.getElementById('editItemExpiry').value = item.expiry;
    document.getElementById('editItemModal').setAttribute('data-editing-item', itemId);
    openEditItemModal();
}

function saveEditedItem() {
    const itemId = parseInt(document.getElementById('editItemModal').getAttribute('data-editing-item'));
    const item = pantryItems.find(i => i.id === itemId);
    if (!item) return;
    
    item.name = document.getElementById('editItemName').value.trim();
    item.category = document.getElementById('editItemCategory').value;
    item.quantity = document.getElementById('editItemQuantity').value.trim();
    item.expiry = document.getElementById('editItemExpiry').value;
    item.status = getItemStatus(item.expiry);
    
    saveData();
    renderPantryItems();
    updateDashboardStats();
    closeEditItemModal();
    showNotification(`${item.name} updated successfully!`, 'success');
}

function deleteInventoryItem(itemId) {
    const item = pantryItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        pantryItems = pantryItems.filter(i => i.id !== itemId);
        saveData();
        renderPantryItems();
        updateDashboardStats();
        showNotification(`${item.name} deleted successfully!`, 'success');
    }
}

function filterInventory(category) {
    const items = document.querySelectorAll('.inventory-item');
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ========== MEAL PLANNING ==========

function renderMealPlan() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const container = document.querySelector('.meal-plan-grid');
    if (!container) return;
    
    container.innerHTML = days.map(day => `
        <div class="day-column">
            <div class="day-header">${day}</div>
            ${['breakfast', 'lunch', 'dinner'].map(meal => `
                <div class="meal-slot" onclick="openRecipeSelectionModal('${day}', '${meal}')">
                    <div class="meal-type">${meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                    <div class="meal-content">${mealPlans[day]?.[meal] || 'Click to add'}</div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function addMeal(day, mealType) {
    openRecipeSelectionModal(day, mealType);
}

function selectRecipeForMeal(recipeName) {
    if (window.currentMealSlot) {
        const { day, meal } = window.currentMealSlot;
        if (!mealPlans[day]) mealPlans[day] = {};
        mealPlans[day][meal] = recipeName;
        saveData();
        renderMealPlan();
        closeRecipeSelectionModal();
        showNotification(`${recipeName} added to ${day} ${meal}!`, 'success');
        window.currentMealSlot = null;
    }
}

function addIngredientsToGroceryList(meal) {
    const ingredients = {
        'Chicken Stir Fry': ['Chicken breast', 'Bell peppers', 'Onions', 'Soy sauce'],
        'Pasta Primavera': ['Pasta', 'Mixed vegetables', 'Olive oil', 'Parmesan cheese'],
        'Grilled Salmon': ['Salmon fillet', 'Lemon', 'Herbs', 'Olive oil'],
        'Vegetable Curry': ['Mixed vegetables', 'Coconut milk', 'Curry powder', 'Rice']
    };
    
    const mealIngredients = ingredients[meal] || [];
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    
    mealIngredients.forEach(ingredient => {
        if (!groceryList.find(item => item.name.toLowerCase() === ingredient.toLowerCase())) {
            groceryList.push({
                id: Date.now() + Math.random(),
                name: ingredient,
                quantity: '1',
                category: 'ingredient',
                priority: 'normal',
                notes: `For ${meal}`,
                completed: false,
                addedDate: new Date().toISOString()
            });
        }
    });
    
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    showNotification(`Ingredients for ${meal} added to grocery list!`, 'success');
}

// ========== GROCERY LIST ==========

function renderGroceryList() {
    const groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    const container = document.querySelector('.grocery-list');
    if (!container) return;
    
    if (groceryList.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:2rem;color:#666;"><i class="fas fa-shopping-cart" style="font-size:3rem;margin-bottom:1rem;opacity:0.3;"></i><p>Your grocery list is empty</p></div>`;
        return;
    }
    
    container.innerHTML = groceryList.map(item => `
        <div class="grocery-item ${item.completed ? 'completed' : ''}" data-priority="${item.priority}">
            <input type="checkbox" class="grocery-checkbox" ${item.completed ? 'checked' : ''} onchange="toggleGroceryItem('${item.id}')">
            <div style="flex:1;">
                <strong>${item.name}</strong>
                <div style="font-size:0.9rem;color:#666;">${item.quantity} - ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                ${item.notes ? `<div style="font-size:0.8rem;color:#999;font-style:italic;">${item.notes}</div>` : ''}
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeGroceryItem('${item.id}')">Remove</button>
        </div>
    `).join('');
}

function toggleGroceryItem(itemId) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    const item = groceryList.find(item => item.id == itemId);
    if (item) {
        item.completed = !item.completed;
        localStorage.setItem('groceryList', JSON.stringify(groceryList));
        renderGroceryList();
        showNotification(`${item.name} marked as ${item.completed ? 'completed' : 'pending'}`, item.completed ? 'success' : 'info', 2000);
    }
}

function removeGroceryItem(itemId) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    const item = groceryList.find(item => item.id == itemId);
    if (item && confirm(`Remove "${item.name}" from grocery list?`)) {
        groceryList = groceryList.filter(item => item.id != itemId);
        localStorage.setItem('groceryList', JSON.stringify(groceryList));
        renderGroceryList();
        showNotification(`${item.name} removed from grocery list`, 'info');
    }
}

function addCustomItem() {
    const input = document.getElementById('customItemInput');
    const itemName = input.value.trim();
    if (!itemName) {
        showNotification('Please enter an item name', 'warning');
        return;
    }
    
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    if (groceryList.find(item => item.name.toLowerCase() === itemName.toLowerCase())) {
        showNotification(`${itemName} is already in your list`, 'warning');
        return;
    }
    
    groceryList.push({
        id: Date.now(),
        name: itemName,
        quantity: '1',
        category: 'other',
        priority: 'normal',
        notes: '',
        completed: false,
        addedDate: new Date().toISOString()
    });
    
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    renderGroceryList();
    input.value = '';
    showNotification(`${itemName} added to grocery list!`, 'success');
}

// ========== AUTHENTICATION ==========

function checkAuthStatus() {
    if (currentUser) {
        showMainApp();
    } else {
        showAuthModal();
    }
}

function showMainApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('userProfile').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
}

function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
}

function switchToLogin() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginToggle').classList.add('active');
    document.getElementById('registerToggle').classList.remove('active');
    document.querySelector('.toggle-slider').classList.remove('register');
}

function switchToRegister() {
    document.getElementById('registerForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerToggle').classList.add('active');
    document.getElementById('loginToggle').classList.remove('active');
    document.querySelector('.toggle-slider').classList.add('register');
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    currentUser = { name: 'John Doe', email: email };
    localStorage.setItem('smartPantryUser', JSON.stringify(currentUser));
    showMainApp();
    showNotification('Login successful!', 'success');
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    currentUser = { name: name, email: email };
    localStorage.setItem('smartPantryUser', JSON.stringify(currentUser));
    showMainApp();
    showNotification('Registration successful!', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('smartPantryUser');
    showAuthModal();
    showNotification('Logged out successfully', 'info');
}

// ========== MODAL FUNCTIONS ==========

function openAddItemModal() { modalActions.open('addItemModal'); }
function closeAddItemModal() { modalActions.close('addItemModal'); }
function openEditItemModal() { modalActions.open('editItemModal', false); }
function closeEditItemModal() { modalActions.close('editItemModal'); }
function openRecipeSelectionModal(dayColumn, mealType) { 
    document.getElementById('mealSlotInfo').textContent = `Select a recipe for ${mealType} on ${dayColumn}`;
    modalActions.open('recipeSelectionModal');
    window.currentMealSlot = { day: dayColumn, meal: mealType };
}
function closeRecipeSelectionModal() { modalActions.close('recipeSelectionModal'); }
function openExportMealPlanModal() { modalActions.open('exportMealPlanModal'); }
function closeExportMealPlanModal() { modalActions.close('exportMealPlanModal'); }
function openAddGroceryItemModal() { modalActions.open('addGroceryItemModal'); }
function closeAddGroceryItemModal() { modalActions.close('addGroceryItemModal'); }

function openEditProfileModal() {
    modalActions.open('editProfileModal', false);
    if (currentUser) {
        document.getElementById('editProfileName').value = currentUser.name || '';
        document.getElementById('editProfileEmail').value = currentUser.email || '';
        document.getElementById('editProfileAvatar').textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
        ['editCurrentPassword', 'editNewPassword', 'editConfirmPassword'].forEach(id => 
            document.getElementById(id).value = ''
        );
    }
}
function closeEditProfileModal() { modalActions.close('editProfileModal'); }

// ========== FORM HANDLERS ==========

function handleAddItem() {
    addItem();
}

function handleEditProfile() {
    const name = document.getElementById('editProfileName').value;
    const email = document.getElementById('editProfileEmail').value;
    
    if (!name || !email) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (currentUser) {
        currentUser.name = name;
        currentUser.email = email;
        localStorage.setItem('smartPantryUser', JSON.stringify(currentUser));
        
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
        
        showNotification('Profile updated successfully!', 'success');
        closeEditProfileModal();
    }
}

function handleAddGroceryItem() {
    const name = document.getElementById('groceryItemName').value.trim();
    const quantity = document.getElementById('groceryItemQuantity').value.trim();
    const category = document.getElementById('groceryItemCategory').value;
    const priority = document.getElementById('groceryItemPriority').value;
    const notes = document.getElementById('groceryItemNotes').value.trim();
    
    if (!name || !quantity || !category) {
        showNotification('Please fill in required fields', 'error');
        return;
    }
    
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '[]');
    
    const existingItem = groceryList.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingItem) {
        if (confirm(`${name} is already in your grocery list. Update it?`)) {
            existingItem.quantity = quantity;
            existingItem.category = category;
            existingItem.priority = priority;
            existingItem.notes = notes;
            localStorage.setItem('groceryList', JSON.stringify(groceryList));
            renderGroceryList();
            closeAddGroceryItemModal();
            showNotification(`${name} updated in grocery list!`, 'success');
        }
        return;
    }
    
    groceryList.push({
        id: Date.now(),
        name, quantity, category, priority, notes,
        completed: false,
        addedDate: new Date().toISOString()
    });
    
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    renderGroceryList();
    closeAddGroceryItemModal();
    showNotification(`${name} added to grocery list!`, 'success');
}

// ========== NAVIGATION & UI ==========

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeLink) activeLink.classList.add('active');
    
    switch(pageId) {
        case 'dashboard':
            updateDashboardStats();
            updateAlerts();
            updatePlannedMealsPreview();
            updateRecipeSuggestions();
            break;
        case 'inventory':
            renderPantryItems();
            break;
        case 'meal-planner':
            renderMealPlan();
            break;
        case 'grocery-list':
            renderGroceryList();
            break;
    }
    
    if (window.innerWidth <= 768) toggleSidebar();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-visible');
    }
}

// ========== EXPORT/DOWNLOAD FUNCTIONS ==========

function downloadMealPlan() {
    const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'pdf';
    const includeGrocery = document.querySelector('#exportMealPlanModal input[type="checkbox"]')?.checked || false;
    
    showNotification(`Exporting meal plan as ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
        let content = `SMART PANTRY - MEAL PLAN\n${new Date().toLocaleDateString()}\n${'='.repeat(35)}\n\n`;
        
        Object.entries(mealPlans).forEach(([day, meals]) => {
            content += `${day.toUpperCase()}:\n`;
            ['breakfast', 'lunch', 'dinner'].forEach(meal => 
                content += `  ${meal.charAt(0).toUpperCase() + meal.slice(1)}: ${meals[meal] || 'Not planned'}\n`
            );
            content += '\n';
        });
        
        if (includeGrocery) {
            content += '\nGROCERY LIST:\n=============\n';
            const groceryItems = JSON.parse(localStorage.getItem('groceryList') || '[]');
            groceryItems.forEach(item => content += `- ${item.name} (${item.category})\n`);
        }
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meal-plan-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Meal plan exported successfully!', 'success');
        closeExportMealPlanModal();
    }, 1000);
}

function downloadGroceryList() {
    const content = `SMART PANTRY - GROCERY LIST\n${new Date().toLocaleDateString()}\n${'='.repeat(32)}\n\n□ Sample items would be listed here`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Grocery list downloaded!', 'success');
}

function printGroceryList() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Grocery List</title><style>body{font-family:Arial,sans-serif;padding:20px;}h1{color:#667eea;}</style></head><body><h1>Smart Pantry - Grocery List</h1><p>${new Date().toLocaleDateString()}</p><div>□ Sample grocery items would be listed here</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// ========== SETTINGS & DATA MANAGEMENT ==========

function toggleSetting(toggleElement) {
    toggleElement.classList.toggle('active');
    const isActive = toggleElement.classList.contains('active');
    const settingName = toggleElement.closest('.setting-item').querySelector('strong').textContent;
    showNotification(`${settingName} ${isActive ? 'enabled' : 'disabled'}`, isActive ? 'success' : 'info', 2000);
    
    const settings = JSON.parse(localStorage.getItem('smartPantrySettings') || '{}');
    settings[settingName] = isActive;
    localStorage.setItem('smartPantrySettings', JSON.stringify(settings));
}

function exportData() {
    const data = { pantryItems, mealPlans, groceryItems: JSON.parse(localStorage.getItem('groceryList') || '[]'), userProfile: currentUser, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart-pantry-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.pantryItems) pantryItems = data.pantryItems;
                    if (data.mealPlans) mealPlans = data.mealPlans;
                    showNotification('Data imported successfully!', 'success');
                } catch (error) {
                    showNotification('Error importing data', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetApp() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This will remove all your data and cannot be undone.')) {
        localStorage.clear();
        showNotification('Account deleted. You will be redirected to the login page.', 'info');
        setTimeout(() => location.reload(), 2000);
    }
}

function changeProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification('Profile picture updated!', 'success');
        }
    };
    input.click();
}

// ========== GLOBAL WINDOW FUNCTIONS ==========

// Make all functions globally accessible
Object.getOwnPropertyNames(window).filter(name => typeof window[name] === 'function' && name.startsWith('open') || name.startsWith('close') || name.startsWith('handle') || name.startsWith('toggle') || name.startsWith('add') || name.startsWith('edit') || name.startsWith('delete') || name.startsWith('remove') || name.startsWith('download') || name.startsWith('print') || name.startsWith('export') || name.startsWith('import') || name.startsWith('reset') || name.startsWith('change') || name.startsWith('select') || name.startsWith('show') || name.startsWith('switch') || name.startsWith('logout') || name.startsWith('filter')).forEach(fnName => {
    window[fnName] = eval(fnName);
});

// Explicitly make key functions global
window.openAddItemModal = openAddItemModal;
window.closeAddItemModal = closeAddItemModal;
window.openEditItemModal = openEditItemModal;
window.closeEditItemModal = closeEditItemModal;
window.openEditProfileModal = openEditProfileModal;
window.closeEditProfileModal = closeEditProfileModal;
window.openRecipeSelectionModal = openRecipeSelectionModal;
window.closeRecipeSelectionModal = closeRecipeSelectionModal;
window.openExportMealPlanModal = openExportMealPlanModal;
window.closeExportMealPlanModal = closeExportMealPlanModal;
window.openAddGroceryItemModal = openAddGroceryItemModal;
window.closeAddGroceryItemModal = closeAddGroceryItemModal;
window.selectRecipeForMeal = selectRecipeForMeal;
window.downloadMealPlan = downloadMealPlan;
window.downloadGroceryList = downloadGroceryList;
window.printGroceryList = printGroceryList;
window.changeProfilePicture = changeProfilePicture;
window.toggleSetting = toggleSetting;
window.filterInventory = filterInventory;
window.logout = logout;
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;
window.removeGroceryItem = removeGroceryItem;
window.addCustomItem = addCustomItem;
window.toggleGroceryItem = toggleGroceryItem;
window.exportData = exportData;
window.importData = importData;
window.resetApp = resetApp;
window.deleteAccount = deleteAccount;
window.editInventoryItem = editInventoryItem;
window.deleteInventoryItem = deleteInventoryItem;
window.handleAddItem = handleAddItem;
window.handleEditProfile = handleEditProfile;
window.handleAddGroceryItem = handleAddGroceryItem;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.addRecipeToMealPlan = addRecipeToMealPlan;

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Initialize event listeners
    const forms = [
        { id: 'addItemForm', handler: (e) => { e.preventDefault(); handleAddItem(); } },
        { id: 'editItemForm', handler: (e) => { e.preventDefault(); saveEditedItem(); } },
        { id: 'loginForm', handler: (e) => { e.preventDefault(); handleLogin(); } },
        { id: 'registerForm', handler: (e) => { e.preventDefault(); handleRegister(); } },
        { id: 'editProfileForm', handler: (e) => { e.preventDefault(); handleEditProfile(); } },
        { id: 'addGroceryItemForm', handler: (e) => { e.preventDefault(); handleAddGroceryItem(); } }
    ];
    
    forms.forEach(({ id, handler }) => {
        const form = document.getElementById(id);
        if (form) form.addEventListener('submit', handler);
    });
    
    // Initialize data
    [updateDashboardStats, updateAlerts, updatePlannedMealsPreview, updateRecipeSuggestions, renderPantryItems, renderMealPlan, renderGroceryList].forEach(fn => fn());
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        ['addItemModal', 'editItemModal', 'recipeSelectionModal', 'exportMealPlanModal', 'editProfileModal', 'addGroceryItemModal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target === modal) modal.classList.remove('active');
        });
    });
    
    // Add optimized styles
    if (!document.querySelector('#optimizedStyles')) {
        const style = document.createElement('style');
        style.id = 'optimizedStyles';
        style.textContent = `
            @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
            @keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
            .notification{transition:all 0.3s ease}
            .grocery-item[data-priority="urgent"]{border-left:4px solid #dc3545;background:rgba(220,53,69,0.05)}
            .grocery-item[data-priority="low"]{opacity:0.7}
            .inventory-grid:empty::after{content:"No items in your pantry. Click 'Add Item' to get started!";display:block;text-align:center;padding:3rem;color:#666;font-style:italic;grid-column:1/-1}
        `;
        document.head.appendChild(style);
    }
});
