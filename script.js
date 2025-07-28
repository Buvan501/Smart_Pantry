// Global authentication state
let isLoggedIn = false;
let currentUser = null;

// Dynamic data storage
let pantryItems = JSON.parse(localStorage.getItem('pantryItems')) || [
    {
        id: 1,
        name: 'Eggs',
        category: 'dairy',
        quantity: '2 remaining',
        expiry: '2025-08-05',
        status: 'low-stock'
    },
    {
        id: 2,
        name: 'Chicken Breast',
        category: 'meat',
        quantity: '2 lbs',
        expiry: '2025-08-03',
        status: 'normal'
    },
    {
        id: 3,
        name: 'Milk',
        category: 'dairy',
        quantity: '1 gallon',
        expiry: '2025-08-10',
        status: 'normal'
    },
    {
        id: 4,
        name: 'Bread',
        category: 'grains',
        quantity: '4 cups',
        expiry: '2025-07-25',
        status: 'expired'
    },
    {
        id: 5,
        name: 'Rice',
        category: 'grains',
        quantity: '5 lbs',
        expiry: '2025-12-15',
        status: 'normal'
    },
    {
        id: 6,
        name: 'Tomatoes',
        category: 'vegetables',
        quantity: '6 pieces',
        expiry: '2025-08-02',
        status: 'normal'
    },
    {
        id: 7,
        name: 'Pasta',
        category: 'grains',
        quantity: '1 box remaining',
        expiry: '2025-11-20',
        status: 'low-stock'
    }
];

let mealPlans = JSON.parse(localStorage.getItem('mealPlans')) || {
    'Monday': {
        breakfast: 'Oatmeal with Berries',
        lunch: 'Caesar Salad',
        dinner: null
    },
    'Tuesday': {
        breakfast: null,
        lunch: 'Chicken Sandwich',
        dinner: 'Spaghetti Carbonara'
    },
    'Wednesday': {
        breakfast: 'Greek Yogurt',
        lunch: null,
        dinner: null
    },
    'Thursday': {
        breakfast: null,
        lunch: null,
        dinner: 'Chicken Tacos'
    },
    'Friday': {
        breakfast: null,
        lunch: 'Tomato Soup',
        dinner: null
    },
    'Saturday': {
        breakfast: null,
        lunch: null,
        dinner: 'Lemon Salmon'
    },
    'Sunday': {
        breakfast: null,
        lunch: null,
        dinner: null
    }
};

let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [
    { id: 1, name: 'Milk', quantity: '1 gallon', category: 'Dairy', completed: false },
    { id: 2, name: 'Eggs', quantity: '1 dozen', category: 'Dairy', completed: true },
    { id: 3, name: 'Chicken Breast', quantity: '2 lbs', category: 'Meat', completed: false },
    { id: 4, name: 'Mixed Vegetables', quantity: '1 bag', category: 'Frozen', completed: false },
    { id: 5, name: 'Pasta', quantity: '1 box', category: 'Grains', completed: false },
    { id: 6, name: 'Salmon Fillet', quantity: '1 lb', category: 'Seafood', completed: false },
    { id: 7, name: 'Fresh Basil', quantity: '1 bunch', category: 'Herbs', completed: false },
    { id: 8, name: 'Arborio Rice', quantity: '1 bag', category: 'Grains', completed: false }
];

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    updateDashboardStats();
    renderPantryItems();
    renderMealPlan();
    renderGroceryList();
    updateAlerts();
});

// Dynamic Dashboard Functions
function updateDashboardStats() {
    const totalItems = pantryItems.length;
    const expiringItems = pantryItems.filter(item => {
        const expiry = new Date(item.expiry);
        const today = new Date();
        const daysDiff = (expiry - today) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3 && daysDiff >= 0;
    }).length;
    
    const plannedMeals = Object.values(mealPlans).reduce((count, day) => {
        return count + (day.breakfast ? 1 : 0) + (day.lunch ? 1 : 0) + (day.dinner ? 1 : 0);
    }, 0);
    
    const shoppingItems = groceryList.filter(item => !item.completed).length;
    
    // Update stat cards
    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = totalItems;
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = expiringItems;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = plannedMeals;
    document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = shoppingItems;
    
    // Update dashboard previews
    updatePlannedMealsPreview();
    updateRecipeSuggestions();
}

function updatePlannedMealsPreview() {
    const preview = document.getElementById('plannedMealsPreview');
    if (!preview) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday'];
    const upcomingMeals = [];
    
    days.forEach(day => {
        const dayPlan = mealPlans[day];
        if (dayPlan.dinner) upcomingMeals.push(`${day}: ${dayPlan.dinner}`);
        else if (dayPlan.lunch) upcomingMeals.push(`${day}: ${dayPlan.lunch}`);
        else if (dayPlan.breakfast) upcomingMeals.push(`${day}: ${dayPlan.breakfast}`);
    });
    
    if (upcomingMeals.length === 0) {
        preview.innerHTML = '<p style="color: #666; font-style: italic;">No meals planned yet. <a href="#" onclick="showPage(\'meal-planner\')" style="color: #667eea;">Plan some meals</a></p>';
    } else {
        preview.innerHTML = upcomingMeals.map(meal => 
            `<div style="margin-bottom: 0.5rem;"><strong>${meal.split(':')[0]}:</strong> ${meal.split(':')[1]}</div>`
        ).join('');
    }
}

function updateRecipeSuggestions() {
    const suggestions = document.getElementById('suggestedRecipes');
    if (!suggestions) return;
    
    const availableIngredients = pantryItems.map(item => item.name.toLowerCase());
    
    const recipes = [
        {
            name: 'Chicken Breast Stir Fry',
            ingredients: ['chicken', 'vegetables'],
            description: 'Quick and healthy dinner'
        },
        {
            name: 'Pasta with Tomatoes',
            ingredients: ['pasta', 'tomatoes'],
            description: 'Simple Italian classic'
        },
        {
            name: 'Egg Fried Rice',
            ingredients: ['rice', 'eggs'],
            description: 'Easy breakfast or dinner'
        },
        {
            name: 'Milk-based Smoothie',
            ingredients: ['milk'],
            description: 'Healthy breakfast drink'
        }
    ];
    
    const matchingRecipes = recipes.filter(recipe => 
        recipe.ingredients.some(ingredient => 
            availableIngredients.some(available => available.includes(ingredient))
        )
    ).slice(0, 3);
    
    if (matchingRecipes.length === 0) {
        suggestions.innerHTML = '<p style="color: #666; font-style: italic;">Add more items to your pantry to get recipe suggestions!</p>';
    } else {
        suggestions.innerHTML = matchingRecipes.map(recipe => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; cursor: pointer;" onclick="addRecipeToMealPlan('${recipe.name}')">
                <strong>${recipe.name}</strong>
                <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">
                    ${recipe.description}
                </div>
                <div style="font-size: 0.8rem; color: #667eea; margin-top: 0.5rem;">
                    Click to add to meal plan
                </div>
            </div>
        `).join('');
    }
}

function addRecipeToMealPlan(recipeName) {
    const day = prompt('Which day would you like to add this recipe? (Monday-Sunday)');
    const mealType = prompt('What meal type? (breakfast/lunch/dinner)');
    
    if (day && mealType && mealPlans[day] !== undefined) {
        mealPlans[day][mealType] = recipeName;
        saveData();
        updateDashboardStats();
        renderMealPlan();
        alert(`${recipeName} added to ${day} ${mealType}!`);
    }
}

function updateAlerts() {
    const alertsContainer = document.querySelector('.alert.alert-warning');
    const dangerContainer = document.querySelector('.alert.alert-danger');
    
    // Find expiring items
    const expiringItems = pantryItems.filter(item => {
        const expiry = new Date(item.expiry);
        const today = new Date();
        const daysDiff = (expiry - today) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3 && daysDiff >= 0;
    });
    
    // Find expired items
    const expiredItems = pantryItems.filter(item => item.status === 'expired');
    
    if (expiringItems.length > 0) {
        alertsContainer.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>${expiringItems.length} items expiring soon:</strong>
                ${expiringItems.map(item => item.name).join(', ')}
            </div>
        `;
    } else {
        alertsContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div><strong>All items are fresh!</strong> No items expiring in the next 3 days.</div>
        `;
    }
    
    if (expiredItems.length > 0) {
        dangerContainer.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <div>
                <strong>${expiredItems.length} expired items:</strong>
                ${expiredItems.map(item => item.name).join(', ')}
            </div>
        `;
    } else {
        dangerContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <div><strong>No expired items!</strong> Your pantry is clean.</div>
        `;
    }
}

function renderPantryItems(filter = 'all') {
    const inventoryGrid = document.querySelector('.inventory-grid');
    let filteredItems = pantryItems;
    
    if (filter !== 'all') {
        filteredItems = pantryItems.filter(item => item.category === filter);
    }
    
    inventoryGrid.innerHTML = filteredItems.map(item => `
        <div class="inventory-item ${item.status}" data-id="${item.id}">
            <div class="item-header">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                </div>
            </div>
            <div class="item-details">
                <div class="item-quantity">${item.quantity}</div>
                <div class="item-expiry">Expires: ${formatDate(item.expiry)}</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editInventoryItem('${item.id}')">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="deleteInventoryItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function renderMealPlan() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const calendarGrid = document.querySelector('.calendar-grid');
    
    calendarGrid.innerHTML = days.map(day => {
        const dayPlan = mealPlans[day];
        return `
            <div class="day-column">
                <div class="day-header">${day}</div>
                <div class="meal-slot ${dayPlan.breakfast ? 'filled' : ''}" onclick="addMeal('${day}', 'breakfast')">
                    ${dayPlan.breakfast ? `<div><strong>Breakfast</strong><br>${dayPlan.breakfast}</div>` : '<div><i class="fas fa-plus"></i><br>Add Breakfast</div>'}
                </div>
                <div class="meal-slot ${dayPlan.lunch ? 'filled' : ''}" onclick="addMeal('${day}', 'lunch')">
                    ${dayPlan.lunch ? `<div><strong>Lunch</strong><br>${dayPlan.lunch}</div>` : '<div><i class="fas fa-plus"></i><br>Add Lunch</div>'}
                </div>
                <div class="meal-slot ${dayPlan.dinner ? 'filled' : ''}" onclick="addMeal('${day}', 'dinner')">
                    ${dayPlan.dinner ? `<div><strong>Dinner</strong><br>${dayPlan.dinner}</div>` : '<div><i class="fas fa-plus"></i><br>Add Dinner</div>'}
                </div>
            </div>
        `;
    }).join('');
}

function renderGroceryList() {
    const groceryListContainer = document.querySelector('.grocery-list');
    
    groceryListContainer.innerHTML = groceryList.map(item => `
        <div class="grocery-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <input type="checkbox" class="grocery-checkbox" ${item.completed ? 'checked' : ''} onchange="toggleGroceryItem('${item.id}')">
            <div style="flex: 1;">
                <strong>${item.name}</strong>
                <div style="font-size: 0.9rem; color: #666;">${item.quantity} - ${item.category}</div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeGroceryItem('${item.id}')">Remove</button>
        </div>
    `).join('');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function saveData() {
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
}

// Dynamic inventory management functions
function addItem() {
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const quantity = document.getElementById('itemQuantity').value;
    const expiry = document.getElementById('itemExpiry').value;
    
    if (!name || !category || !quantity || !expiry) {
        alert('Please fill in all fields');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name,
        category,
        quantity,
        expiry,
        status: getItemStatus(expiry)
    };
    
    pantryItems.push(newItem);
    saveData();
    renderPantryItems();
    updateDashboardStats();
    updateAlerts();
    closeAddItemModal();
    
    // Reset form
    document.getElementById('addItemForm').reset();
    
    alert('Item added successfully!');
}

function editInventoryItem(itemId) {
    const item = pantryItems.find(i => i.id == itemId);
    if (!item) return;
    
    // Populate edit form
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemCategory').value = item.category;
    document.getElementById('editItemQuantity').value = item.quantity;
    document.getElementById('editItemExpiry').value = item.expiry;
    
    // Store item ID for saving
    document.getElementById('editItemForm').dataset.itemId = itemId;
    
    openEditItemModal();
}

function saveEditedItem() {
    const itemId = document.getElementById('editItemForm').dataset.itemId;
    const item = pantryItems.find(i => i.id == itemId);
    if (!item) return;
    
    item.name = document.getElementById('editItemName').value;
    item.category = document.getElementById('editItemCategory').value;
    item.quantity = document.getElementById('editItemQuantity').value;
    item.expiry = document.getElementById('editItemExpiry').value;
    item.status = getItemStatus(item.expiry);
    
    saveData();
    renderPantryItems();
    updateDashboardStats();
    updateAlerts();
    closeEditItemModal();
    
    alert('Item updated successfully!');
}

function deleteInventoryItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        pantryItems = pantryItems.filter(item => item.id != itemId);
        saveData();
        renderPantryItems();
        updateDashboardStats();
        updateAlerts();
        alert('Item deleted successfully!');
    }
}

function getItemStatus(expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = (expiry - today) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 3) return 'low-stock';
    return 'normal';
}

function filterInventory(category) {
    renderPantryItems(category);
}

// Meal planning functions
function addMeal(day, mealType) {
    const meal = prompt(`Enter ${mealType} for ${day}:`);
    if (meal) {
        mealPlans[day][mealType] = meal;
        saveData();
        renderMealPlan();
        updateDashboardStats();
        
        // Add ingredients to grocery list if not already there
        addIngredientsToGroceryList(meal);
    }
}

function addIngredientsToGroceryList(meal) {
    // Simple ingredient detection (in a real app, you'd have a proper recipe database)
    const commonIngredients = {
        'pasta': ['Pasta', 'Tomato Sauce'],
        'salad': ['Lettuce', 'Tomatoes', 'Cucumber'],
        'chicken': ['Chicken Breast'],
        'salmon': ['Salmon Fillet', 'Lemon'],
        'soup': ['Vegetables', 'Broth'],
        'sandwich': ['Bread', 'Cheese']
    };
    
    const mealLower = meal.toLowerCase();
    for (let ingredient in commonIngredients) {
        if (mealLower.includes(ingredient)) {
            commonIngredients[ingredient].forEach(item => {
                if (!groceryList.find(g => g.name === item)) {
                    groceryList.push({
                        id: Date.now() + Math.random(),
                        name: item,
                        quantity: '1',
                        category: 'Needed',
                        completed: false
                    });
                }
            });
        }
    }
    
    saveData();
    renderGroceryList();
    updateDashboardStats();
}

// Grocery list functions
function toggleGroceryItem(itemId) {
    const item = groceryList.find(i => i.id == itemId);
    if (item) {
        item.completed = !item.completed;
        saveData();
        renderGroceryList();
        updateDashboardStats();
    }
}

function removeGroceryItem(itemId) {
    groceryList = groceryList.filter(item => item.id != itemId);
    saveData();
    renderGroceryList();
    updateDashboardStats();
}

function addCustomItem() {
    const input = document.getElementById('customItemInput');
    const itemName = input.value.trim();
    
    if (itemName) {
        groceryList.push({
            id: Date.now(),
            name: itemName,
            quantity: '1',
            category: 'Custom',
            completed: false
        });
        
        input.value = '';
        saveData();
        renderGroceryList();
        updateDashboardStats();
    }
}

// Search and filter functions
function searchItems(query) {
    const filteredItems = pantryItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
    
    const inventoryGrid = document.querySelector('.inventory-grid');
    inventoryGrid.innerHTML = filteredItems.map(item => `
        <div class="inventory-item ${item.status}" data-id="${item.id}">
            <div class="item-header">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-category">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</div>
                </div>
            </div>
            <div class="item-details">
                <div class="item-quantity">${item.quantity}</div>
                <div class="item-expiry">Expires: ${formatDate(item.expiry)}</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-small btn-secondary" onclick="editInventoryItem('${item.id}')">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="deleteInventoryItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Authentication functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('smartPantryUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        showMainApp();
    } else {
        showAuthModal();
    }
}

function showMainApp() {
    // Hide auth modal
    document.getElementById('authModal').classList.remove('active');
    
    // Show user profile in sidebar
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    if (currentUser) {
        userProfile.style.display = 'block';
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    
    // Enable main app functionality
    document.querySelector('.app-container').style.pointerEvents = 'auto';
}

function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
    
    // Disable main app functionality
    document.querySelector('.app-container').style.pointerEvents = 'none';
    document.querySelector('#authModal').style.pointerEvents = 'auto';
    
    // Reset to login form
    switchToLogin();
}

function switchToLogin() {
    // Update toggle buttons
    document.getElementById('loginToggle').classList.add('active');
    document.getElementById('registerToggle').classList.remove('active');
    
    // Move slider
    document.getElementById('toggleSlider').classList.remove('register');
    
    // Update title and subtitle
    document.getElementById('authTitle').textContent = 'Welcome to Smart Pantry';
    document.getElementById('authSubtitle').textContent = 'Please sign in to access your pantry';
    
    // Show login form, hide register form
    document.getElementById('loginFormContainer').classList.add('active');
    document.getElementById('registerFormContainer').classList.remove('active');
}

function switchToRegister() {
    // Update toggle buttons
    document.getElementById('loginToggle').classList.remove('active');
    document.getElementById('registerToggle').classList.add('active');
    
    // Move slider
    document.getElementById('toggleSlider').classList.add('register');
    
    // Update title and subtitle
    document.getElementById('authTitle').textContent = 'Create Your Account';
    document.getElementById('authSubtitle').textContent = 'Join Smart Pantry to manage your kitchen';
    
    // Show register form, hide login form
    document.getElementById('loginFormContainer').classList.remove('active');
    document.getElementById('registerFormContainer').classList.add('active');
}

function logout() {
    localStorage.removeItem('smartPantryUser');
    currentUser = null;
    isLoggedIn = false;
    document.getElementById('userProfile').style.display = 'none';
    showAuthModal();
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Simulate authentication (replace with real authentication)
            if (email && password) {
                const userData = {
                    name: email.split('@')[0], // Simple name extraction
                    email: email,
                    loginTime: new Date().toISOString()
                };
                
                localStorage.setItem('smartPantryUser', JSON.stringify(userData));
                currentUser = userData;
                isLoggedIn = true;
                showMainApp();
                
                // Clear form
                loginForm.reset();
            }
        });
    }
});

// Register form handler
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!agreeTerms) {
                alert('Please agree to the terms and conditions.');
                return;
            }
            
            // Simulate registration (replace with real registration)
            const userData = {
                name: name,
                email: email,
                registerTime: new Date().toISOString()
            };
            
            localStorage.setItem('smartPantryUser', JSON.stringify(userData));
            currentUser = userData;
            isLoggedIn = true;
            showMainApp();
            
            // Clear form
            registerForm.reset();
        });
    }
});

// Navigation functionality
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation - remove active from all links first
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Find and activate the correct nav link
    navLinks.forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (onclick && onclick.includes(`'${pageId}'`)) {
            link.classList.add('active');
        }
    });
    
    // Close mobile sidebar
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

// Mobile sidebar functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar.classList.contains('mobile-visible')) {
        sidebar.classList.remove('mobile-visible');
    } else {
        sidebar.classList.add('mobile-visible');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('mobile-visible');
}

// Modal functionality
function openAddItemModal() {
    document.getElementById('addItemModal').classList.add('active');
}

function closeAddItemModal() {
    document.getElementById('addItemModal').classList.remove('active');
}

function openEditItemModal(button) {
    const item = button.closest('.inventory-item');
    const itemName = item.querySelector('.item-name').textContent;
    const itemCategory = item.querySelector('.item-category').textContent.toLowerCase();
    const itemQuantity = item.querySelector('.item-quantity').textContent;
    const itemExpiry = item.querySelector('.item-expiry').textContent.replace('Expires: ', '').replace('Expired: ', '');
    
    // Populate the edit form
    document.getElementById('editItemName').value = itemName;
    document.getElementById('editItemCategory').value = itemCategory;
    document.getElementById('editItemQuantity').value = itemQuantity;
    
    // Convert date format if needed
    const expiryDate = new Date(itemExpiry);
    if (!isNaN(expiryDate.getTime())) {
        document.getElementById('editItemExpiry').value = expiryDate.toISOString().split('T')[0];
    }
    
    // Store reference to the item being edited
    document.getElementById('editItemModal').setAttribute('data-editing-item', item.querySelector('.item-name').textContent);
    document.getElementById('editItemModal').classList.add('active');
}

function closeEditItemModal() {
    document.getElementById('editItemModal').classList.remove('active');
}

function openRecipeSelectionModal(dayColumn, mealType) {
    document.getElementById('mealSlotInfo').textContent = `Select a recipe for ${mealType} on ${dayColumn}`;
    document.getElementById('recipeSelectionModal').classList.add('active');
    
    // Store the meal slot info for later use
    window.currentMealSlot = { day: dayColumn, meal: mealType };
}

function closeRecipeSelectionModal() {
    document.getElementById('recipeSelectionModal').classList.remove('active');
}

function openExportMealPlanModal() {
    document.getElementById('exportMealPlanModal').classList.add('active');
}

function closeExportMealPlanModal() {
    document.getElementById('exportMealPlanModal').classList.remove('active');
}

// Settings toggle functionality
function toggleSetting(toggle) {
    toggle.classList.toggle('active');
}

// Inventory filtering
function filterInventory(category) {
    const items = document.querySelectorAll('.inventory-item');
    items.forEach(item => {
        if (category === 'all') {
            item.style.display = 'block';
        } else {
            const itemCategory = item.querySelector('.item-category').textContent.toLowerCase();
            item.style.display = itemCategory === category ? 'block' : 'none';
        }
    });
}

// Handle responsive behavior
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (window.innerWidth > 768) {
        sidebar.classList.remove('mobile-hidden', 'mobile-visible');
        mainContent.classList.remove('full-width');
    } else {
        if (!sidebar.classList.contains('mobile-visible')) {
            sidebar.classList.add('mobile-hidden');
            mainContent.classList.add('full-width');
        }
    }
}

// Quick action buttons functionality
function updateInventory() {
    openAddItemModal();
}

function scanPantry() {
    openScanPantryModal();
}

function findRecipes() {
    showPage('recipes');
}

// Add custom grocery item functionality
function addCustomItem() {
    const input = document.getElementById('customItemInput');
    const itemName = input.value.trim();
    
    if (itemName) {
        const groceryList = document.querySelector('.grocery-list');
        const newItem = document.createElement('div');
        newItem.className = 'grocery-item';
        newItem.innerHTML = `
            <input type="checkbox" class="grocery-checkbox">
            <div style="flex: 1;">
                <strong>${itemName}</strong>
                <div style="font-size: 0.9rem; color: #666;">Custom item</div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeGroceryItem(this)">Remove</button>
        `;
        
        // Add event listener to the new checkbox
        const checkbox = newItem.querySelector('.grocery-checkbox');
        checkbox.addEventListener('change', function() {
            const item = this.closest('.grocery-item');
            if (this.checked) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });
        
        groceryList.appendChild(newItem);
        input.value = '';
    }
}

// Remove grocery item functionality
function removeGroceryItem(button) {
    button.closest('.grocery-item').remove();
}

// Inventory item management
function editInventoryItem(button) {
    openEditItemModal(button);
}

function deleteInventoryItem(button) {
    const item = button.closest('.inventory-item');
    const itemName = item.querySelector('.item-name').textContent;
    if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
        item.remove();
    }
}

// Export functionality
function exportMealPlan() {
    openExportMealPlanModal();
}

function downloadMealPlan() {
    const selectedFormat = document.querySelector('input[name="exportFormat"]:checked').value;
    const includeGroceryList = document.querySelector('#exportMealPlanModal input[type="checkbox"]').checked;
    
    alert(`Exporting meal plan as ${selectedFormat.toUpperCase()}${includeGroceryList ? ' with grocery list' : ''}`);
    closeExportMealPlanModal();
}

function downloadGroceryList() {
    alert('Grocery list would be downloaded as PDF');
}

function printGroceryList() {
    window.print();
}

// Auto-save meal plan changes
let mealPlanTimeout;
function saveMealPlan() {
    clearTimeout(mealPlanTimeout);
    mealPlanTimeout = setTimeout(() => {
        console.log('Meal plan auto-saved');
    }, 2000);
}

// Search functionality (could be added to inventory/recipes)
function initializeSearch() {
    const searchInputs = document.querySelectorAll('[placeholder*="Search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // Implementation would filter visible items based on search term
            console.log('Searching for:', searchTerm);
        });
    });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Pantry App Initialized');
    initializeSearch();
    
    // Initialize mobile responsive behavior
    handleResize();
    
    // Grocery list functionality
    const checkboxes = document.querySelectorAll('.grocery-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const item = this.closest('.grocery-item');
            if (this.checked) {
                item.classList.add('completed');
            } else {
                item.classList.remove('completed');
            }
        });
    });

    // Meal slot functionality
    const mealSlots = document.querySelectorAll('.meal-slot');
    mealSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (!this.classList.contains('filled')) {
                const dayColumn = this.closest('.day-column');
                const dayName = dayColumn.querySelector('.day-header').textContent;
                const mealSlots = dayColumn.querySelectorAll('.meal-slot');
                const slotIndex = Array.from(mealSlots).indexOf(this);
                const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
                const mealType = mealTypes[slotIndex] || 'Meal';
                
                openRecipeSelectionModal(dayName, mealType);
            }
        });
    });

    // Initialize mobile view
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('mobile-hidden');
        document.getElementById('main-content').classList.add('full-width');
    }

    // Recipe card interactions
    const addToPlanButtons = document.querySelectorAll('.recipe-card .btn-primary');
    const saveButtons = document.querySelectorAll('.recipe-card .btn-secondary');
    
    addToPlanButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeTitle = this.closest('.recipe-content').querySelector('.recipe-title').textContent;
            alert(`"${recipeTitle}" would be added to your meal plan`);
        });
    });
    
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const recipeTitle = this.closest('.recipe-content').querySelector('.recipe-title').textContent;
            alert(`"${recipeTitle}" saved to your favorites`);
        });
    });

    // Smooth animations for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    const cards = document.querySelectorAll('.card, .inventory-item, .recipe-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Form submission handling
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const itemName = document.getElementById('itemName').value.trim();
            const itemCategory = document.getElementById('itemCategory').value;
            const itemQuantity = document.getElementById('itemQuantity').value.trim();
            const itemExpiry = document.getElementById('itemExpiry').value;
            
            if (itemName && itemCategory && itemQuantity && itemExpiry) {
                // Create new inventory item
                const inventoryGrid = document.querySelector('.inventory-grid');
                const newItem = document.createElement('div');
                newItem.className = 'inventory-item';
                
                const expiryDate = new Date(itemExpiry);
                const today = new Date();
                const timeDiff = expiryDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                // Add warning classes based on expiry
                if (daysDiff < 0) {
                    newItem.classList.add('expired');
                } else if (daysDiff <= 3) {
                    newItem.classList.add('low-stock');
                }
                
                newItem.innerHTML = `
                    <div class="item-header">
                        <div>
                            <div class="item-name">${itemName}</div>
                            <div class="item-category">${itemCategory.charAt(0).toUpperCase() + itemCategory.slice(1)}</div>
                        </div>
                    </div>
                    <div class="item-details">
                        <div class="item-quantity">${itemQuantity}</div>
                        <div class="item-expiry">Expires: ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small btn-secondary" onclick="editInventoryItem(this)">Edit</button>
                        <button class="btn btn-small btn-secondary" onclick="deleteInventoryItem(this)">Delete</button>
                    </div>
                `;
                
                inventoryGrid.appendChild(newItem);
                
                alert(`Item "${itemName}" added to inventory!`);
                closeAddItemModal();
                this.reset();
            } else {
                alert('Please fill in all fields');
            }
        });
    }

    // Add Enter key support for custom grocery items
    const customItemInput = document.getElementById('customItemInput');
    if (customItemInput) {
        customItemInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCustomItem();
            }
        });
    }

    // Edit item form submission
    const editItemForm = document.getElementById('editItemForm');
    if (editItemForm) {
        editItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const editingItemName = document.getElementById('editItemModal').getAttribute('data-editing-item');
            const newName = document.getElementById('editItemName').value.trim();
            const newCategory = document.getElementById('editItemCategory').value;
            const newQuantity = document.getElementById('editItemQuantity').value.trim();
            const newExpiry = document.getElementById('editItemExpiry').value;
            
            if (newName && newCategory && newQuantity && newExpiry) {
                // Find the item being edited
                const inventoryItems = document.querySelectorAll('.inventory-item');
                inventoryItems.forEach(item => {
                    const itemName = item.querySelector('.item-name').textContent;
                    if (itemName === editingItemName) {
                        // Update the item
                        item.querySelector('.item-name').textContent = newName;
                        item.querySelector('.item-category').textContent = newCategory.charAt(0).toUpperCase() + newCategory.slice(1);
                        item.querySelector('.item-quantity').textContent = newQuantity;
                        
                        const expiryDate = new Date(newExpiry);
                        item.querySelector('.item-expiry').textContent = `Expires: ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
                        
                        // Update warning classes based on expiry
                        const today = new Date();
                        const timeDiff = expiryDate.getTime() - today.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        
                        item.classList.remove('expired', 'low-stock');
                        if (daysDiff < 0) {
                            item.classList.add('expired');
                        } else if (daysDiff <= 3) {
                            item.classList.add('low-stock');
                        }
                    }
                });
                
                alert(`Item "${newName}" updated successfully!`);
                closeEditItemModal();
            } else {
                alert('Please fill in all fields');
            }
        });
    }
});

// Recipe selection for meal planning
function selectRecipeForMeal(recipeName) {
    if (window.currentMealSlot) {
        // Find the corresponding meal slot and update it
        const dayColumns = document.querySelectorAll('.day-column');
        dayColumns.forEach(column => {
            const dayName = column.querySelector('.day-header').textContent;
            if (dayName === window.currentMealSlot.day) {
                const mealSlots = column.querySelectorAll('.meal-slot');
                const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
                const slotIndex = mealTypes.indexOf(window.currentMealSlot.meal);
                
                if (slotIndex !== -1 && mealSlots[slotIndex]) {
                    const slot = mealSlots[slotIndex];
                    slot.classList.add('filled');
                    slot.innerHTML = `
                        <div>
                            <strong>${window.currentMealSlot.meal}</strong><br>
                            ${recipeName}
                        </div>
                    `;
                }
            }
        });
        
        closeRecipeSelectionModal();
        window.currentMealSlot = null;
    }
}

// Edit Profile Modal Functions
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const editProfileName = document.getElementById('editProfileName');
    const editProfileEmail = document.getElementById('editProfileEmail');
    const editProfileAvatar = document.getElementById('editProfileAvatar');
    
    // Populate current user data
    if (currentUser) {
        editProfileName.value = currentUser.name;
        editProfileEmail.value = currentUser.email;
        editProfileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
    
    // Clear password fields
    document.getElementById('editCurrentPassword').value = '';
    document.getElementById('editNewPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';
    
    modal.classList.add('active');
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function changeProfilePicture() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // For now, just show the first letter (in a real app, you'd upload and store the image)
                console.log('Profile picture selected:', file.name);
                alert('Profile picture functionality would be implemented here in a real application.');
            };
            reader.readAsDataURL(file);
        }
    };
    
    fileInput.click();
}

// Handle edit profile form submission
document.addEventListener('DOMContentLoaded', function() {
    // Add item form
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addItem();
        });
    }
    
    // Edit item form
    const editItemForm = document.getElementById('editItemForm');
    if (editItemForm) {
        editItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEditedItem();
        });
    }
    
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('editProfileName').value;
            const email = document.getElementById('editProfileEmail').value;
            const currentPassword = document.getElementById('editCurrentPassword').value;
            const newPassword = document.getElementById('editNewPassword').value;
            const confirmPassword = document.getElementById('editConfirmPassword').value;
            
            // Validate inputs
            if (!name || !email) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // If changing password, validate password fields
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) {
                    alert('Please enter your current password to change it.');
                    return;
                }
                
                if (!newPassword) {
                    alert('Please enter a new password.');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('New passwords do not match.');
                    return;
                }
                
                if (newPassword.length < 6) {
                    alert('New password must be at least 6 characters long.');
                    return;
                }
                
                // In a real app, you'd verify the current password with the server
                if (currentUser && currentUser.password && currentUser.password !== currentPassword) {
                    alert('Current password is incorrect.');
                    return;
                }
            }
            
            // Update user data
            if (currentUser) {
                currentUser.name = name;
                currentUser.email = email;
                
                if (newPassword) {
                    currentUser.password = newPassword;
                }
                
                // Save to localStorage
                localStorage.setItem('smartPantryUser', JSON.stringify(currentUser));
                
                // Update UI
                document.getElementById('userName').textContent = currentUser.name;
                document.getElementById('userEmail').textContent = currentUser.email;
                document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
                
                alert('Profile updated successfully!');
                closeEditProfileModal();
            }
        });
    }
});

// Event listeners
window.addEventListener('resize', handleResize);

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modals = ['addItemModal', 'editItemModal', 'recipeSelectionModal', 'exportMealPlanModal', 'editProfileModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
});
