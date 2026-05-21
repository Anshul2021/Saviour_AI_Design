// Recipes Pool for the Tonight screen
const recipes = [
  {
    title: "Warm tomato & white bean stew",
    description: "A cozy, rich bowl of beans cooked in garlic, sweet tomatoes, and olive oil. Ready in under 15 minutes, using mostly pantry staples.",
    image: "comforting_stew.png",
    cookTime: "12 mins",
    effort: "Low effort",
    ingredientsCount: "5 ingredients",
    ingredients: [
      "1 tin Cannellini beans (drained)",
      "1 tin Cherry tomatoes in juice",
      "2 cloves Garlic (sliced)",
      "2 tbsp Olive oil",
      "Crusty bread for serving"
    ]
  },
  {
    title: "Garlic butter mushroom pasta",
    description: "Tender pasta tossed in a rich, buttery mushroom sauce with garlic and a touch of parmesan. Pure comforting carb therapy.",
    image: "mushroom_pasta.png",
    cookTime: "18 mins",
    effort: "Cozy cook",
    ingredientsCount: "5 ingredients",
    ingredients: [
      "200g Pasta (any shape)",
      "150g Mushrooms (sliced)",
      "2 tbsp Butter",
      "2 cloves Garlic (minced)",
      "Grated Parmesan cheese"
    ]
  }
];

let currentRecipeIndex = 0;
const checkedIngredients = new Set(["rice", "onions"]); // Default checked elements per mockup

// DOM Elements
const kitchenView = document.getElementById('kitchen-view');
const recipeView = document.getElementById('recipe-view');
const successView = document.getElementById('success-view');

const ingredientSearch = document.getElementById('ingredient-search');
const ingredientsListContainer = document.getElementById('ingredients-list-container');
const kitchenSelectionCount = document.getElementById('kitchen-selection-count');
const kitchenNextBtn = document.getElementById('kitchen-next-btn');

const dateLabel = document.getElementById('date-label');
const effortBadge = document.getElementById('effort-badge');
const mealTitle = document.getElementById('meal-title');
const mealDescription = document.getElementById('meal-description');
const mealImage = document.getElementById('meal-image');
const cookTime = document.getElementById('cook-time');
const ingredientCount = document.getElementById('ingredient-count');
const ingredientList = document.getElementById('ingredient-list');

const cookBtn = document.getElementById('cook-btn');
const swapBtn = document.getElementById('swap-btn');
const resetBtn = document.getElementById('reset-btn');

// Initialize Icons
function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Update the bottom selection label text
function updateSelectionCount() {
  const count = checkedIngredients.size;
  kitchenSelectionCount.textContent = `${count} ${count === 1 ? 'item' : 'items'} checked`;
}

// Filter the list of ingredients based on search query and category tab
function filterIngredients() {
  const query = ingredientSearch.value.trim().toLowerCase();
  const activeTabBtn = document.querySelector('.tab-btn.active');
  const activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-filter') : 'all';
  
  document.querySelectorAll('.ingredient-row').forEach(row => {
    const name = row.querySelector('.ingredient-name').textContent.toLowerCase();
    const category = row.getAttribute('data-category');
    
    const matchesSearch = name.includes(query);
    const matchesTab = activeTab === 'all' || category === activeTab;
    
    if (matchesSearch && matchesTab) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
}

// Bind interactive event handlers to a specific row
function bindRowEvents(row) {
  const checkboxContainer = row.querySelector('.custom-checkbox-container');
  const id = checkboxContainer.getAttribute('data-id');
  
  // 1. Checkbox Toggle
  checkboxContainer.addEventListener('click', () => {
    checkboxContainer.classList.toggle('checked');
    const isChecked = checkboxContainer.classList.contains('checked');
    
    // Toggle state set
    if (isChecked) {
      checkedIngredients.add(id);
    } else {
      checkedIngredients.delete(id);
    }
    
    // Toggle inputs, select elements
    const controls = row.querySelector('.ingredient-controls');
    if (controls) {
      const dropdowns = controls.querySelectorAll('.dropdown-control-kitchen');
      dropdowns.forEach(drop => {
        drop.disabled = !isChecked;
      });
      
      const stepper = controls.querySelector('.stepper-wrapper');
      if (stepper) {
        if (isChecked) {
          stepper.classList.remove('disabled');
          stepper.querySelectorAll('button').forEach(btn => btn.disabled = false);
        } else {
          stepper.classList.add('disabled');
          stepper.querySelectorAll('button').forEach(btn => btn.disabled = true);
        }
      }
    }
    
    updateSelectionCount();
  });

  // 2. Stepper functionality (if present)
  const stepper = row.querySelector('.stepper-wrapper');
  if (stepper) {
    const minusBtn = stepper.querySelector('.minus-btn');
    const plusBtn = stepper.querySelector('.plus-btn');
    const valueSpan = stepper.querySelector('.stepper-value-text');
    
    minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let val = parseInt(valueSpan.textContent, 10);
      if (val > 1) {
        valueSpan.textContent = val - 1;
      }
    });
    
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let val = parseInt(valueSpan.textContent, 10);
      valueSpan.textContent = val + 1;
    });
  }
}

// Add a new custom ingredient dynamically from search bar
function addCustomIngredient(name) {
  const cleaned = name.trim();
  if (cleaned.length === 0) return;
  
  const id = cleaned.toLowerCase().replace(/\s+/g, '-');
  
  // Prevent duplicate additions
  if (document.getElementById(`row-${id}`)) {
    const existingCheckbox = document.querySelector(`#row-${id} .custom-checkbox-container`);
    if (!existingCheckbox.classList.contains('checked')) {
      existingCheckbox.click();
    }
    return;
  }
  
  const activeTabBtn = document.querySelector('.tab-btn.active');
  const activeTab = activeTabBtn ? activeTabBtn.getAttribute('data-filter') : 'pantry';
  const category = activeTab === 'all' ? 'pantry' : activeTab;
  
  const row = document.createElement('div');
  row.className = 'ingredient-row fade-in';
  row.id = `row-${id}`;
  row.setAttribute('data-category', category);
  
  row.innerHTML = `
    <div class="custom-checkbox-container checked" data-id="${id}">
      <div class="custom-checkbox-large">
        <i data-lucide="check" class="icon"></i>
      </div>
      <span class="ingredient-name text-body" style="font-size: 15px; color: var(--color-text-primary);">${cleaned}</span>
    </div>
    <div class="ingredient-controls">
      <select class="dropdown-control-kitchen" id="drop-${id}">
        <option value="Full" selected>Full</option>
        <option value="Half">Half</option>
        <option value="More than half">More than half</option>
        <option value="Less than half">Less than half</option>
      </select>
    </div>
  `;
  
  ingredientsListContainer.appendChild(row);
  checkedIngredients.add(id);
  
  bindRowEvents(row);
  filterIngredients(); // Apply filtering immediately
  updateSelectionCount();
  initIcons();
}

// Setup date display
function setupDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  const dateText = today.toLocaleDateString('en-US', options);
  dateLabel.textContent = dateText.toLowerCase();
}

// Render the Tonight recipe view suggestion
function displayRecipe(index) {
  const recipe = recipes[index];
  
  mealTitle.textContent = recipe.title;
  mealDescription.textContent = recipe.description;
  mealImage.src = recipe.image;
  mealImage.alt = recipe.title;
  cookTime.textContent = recipe.cookTime;
  ingredientCount.textContent = recipe.ingredientsCount;
  
  const effortSpan = effortBadge.querySelector('span');
  const effortIcon = effortBadge.querySelector('.icon');
  effortSpan.textContent = recipe.effort;
  
  if (recipe.effort === "Low effort") {
    effortBadge.className = "badge";
    if (effortIcon) effortIcon.setAttribute('data-lucide', 'zap');
  } else {
    effortBadge.className = "badge badge-secondary";
    if (effortIcon) effortIcon.setAttribute('data-lucide', 'flame');
  }
  
  // Build recipe checklist
  ingredientList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.className = 'ingredient-item interactive-ingredient';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text-body';
    textSpan.textContent = ingredient;
    
    // Check if user has this ingredient in their checked list
    let hasIt = false;
    const lowerIng = ingredient.toLowerCase();
    
    checkedIngredients.forEach(item => {
      // Basic match logic
      if (lowerIng.includes(item) || item.includes(lowerIng)) {
        hasIt = true;
      }
    });
    
    const icon = document.createElement('i');
    icon.className = 'icon';
    icon.style.width = '16px';
    icon.style.height = '16px';
    
    if (hasIt) {
      li.classList.add('checked');
      icon.setAttribute('data-lucide', 'check-circle-2');
      icon.style.color = 'var(--color-success)';
    } else {
      icon.setAttribute('data-lucide', 'circle');
      icon.style.color = 'var(--color-text-ghost)';
    }
    
    li.appendChild(textSpan);
    li.appendChild(icon);
    
    li.addEventListener('click', () => {
      li.classList.toggle('checked');
      if (li.classList.contains('checked')) {
        icon.setAttribute('data-lucide', 'check-circle-2');
        icon.style.color = 'var(--color-success)';
      } else {
        icon.setAttribute('data-lucide', 'circle');
        icon.style.color = 'var(--color-text-ghost)';
      }
      initIcons();
    });
    
    ingredientList.appendChild(li);
  });
  
  initIcons();
}

// Swap recipe suggestions
function swapRecipe() {
  recipeView.classList.remove('fade-in');
  setTimeout(() => {
    currentRecipeIndex = (currentRecipeIndex + 1) % recipes.length;
    displayRecipe(currentRecipeIndex);
    recipeView.classList.add('fade-in');
  }, 100);
}

// Bind Events for existing rows on load
document.querySelectorAll('.ingredient-row').forEach(bindRowEvents);

// Event Listeners for category tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterIngredients();
  });
});

// Search input keypress & input filtering
ingredientSearch.addEventListener('input', filterIngredients);
ingredientSearch.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addCustomIngredient(ingredientSearch.value);
    ingredientSearch.value = '';
  }
});

// Navigate to Leave Time Screen
kitchenNextBtn.addEventListener('click', () => {
  window.location.href = 'leave-time.html';
});

// Swap recipe suggestions
swapBtn.addEventListener('click', swapRecipe);

// Cook tonight btn
cookBtn.addEventListener('click', () => {
  recipeView.classList.add('hidden');
  successView.classList.remove('hidden');
  successView.classList.add('fade-in');
});

// Reset return back to Screen 1 (index.html)
resetBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Initial Setup
window.addEventListener('DOMContentLoaded', () => {
  setupDate();
  updateSelectionCount();
});
