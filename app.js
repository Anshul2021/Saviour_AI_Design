// Onboarding Meals Pool (ordered EXACTLY as requested in the mockup list)
const onboardingMeals = [
  { name: "Dal chawal", icon: "https://img.icons8.com/office/80/rice-bowl.png", isVeg: true, time: 20 },
  { name: "Egg toast", icon: "https://img.icons8.com/office/80/sunny-side-up-eggs.png", isVeg: false, time: 10 },
  { name: "Maggi", icon: "https://img.icons8.com/office/80/noodles.png", isVeg: true, time: 10 },
  { name: "Paratha", icon: "https://img.icons8.com/office/80/pancake.png", isVeg: true, time: 15 },
  { name: "Khichdi", icon: "https://img.icons8.com/office/80/soup-plate.png", isVeg: true, time: 25 },
  { name: "Curd rice", icon: "https://img.icons8.com/office/80/bento.png", isVeg: true, time: 10 },
  { name: "Rajma rice", icon: "https://img.icons8.com/office/80/soy.png", isVeg: true, time: 40 },
  { name: "Bread omelette", icon: "https://img.icons8.com/office/80/bread.png", isVeg: false, time: 12 },
  { name: "Upma", icon: "https://img.icons8.com/office/80/porridge.png", isVeg: true, time: 15 },
  { name: "Poha", icon: "https://img.icons8.com/office/80/wheat.png", isVeg: true, time: 15 },
  { name: "Aloo fry", icon: "https://img.icons8.com/office/80/potato.png", isVeg: true, time: 18 },
  { name: "Sandwich", icon: "https://img.icons8.com/office/80/sandwich.png", isVeg: true, time: 10 }
];

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
const selectedMeals = new Set();

// DOM Elements
const onboardingView = document.getElementById('onboarding-view');
const recipeView = document.getElementById('recipe-view');
const successView = document.getElementById('success-view');

const vegToggle = document.getElementById('veg-toggle');
const mealsGrid = document.getElementById('meals-grid');
const onboardingNextBtn = document.getElementById('onboarding-next-btn');
const selectionCount = document.getElementById('selection-count');

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

// Render Onboarding Grid Items
function renderOnboardingMeals() {
  mealsGrid.innerHTML = '';
  
  const isVegOnly = vegToggle ? vegToggle.checked : false;
  
  const filtered = onboardingMeals.filter(meal => {
    // Veg only filter
    return !isVegOnly || meal.isVeg;
  });
  
  // Render normal meals
  filtered.forEach(meal => {
    const isSelected = selectedMeals.has(meal.name);
    
    const item = document.createElement('div');
    item.className = `grid-meal-item ${isSelected ? 'selected' : ''}`;
    
    const circle = document.createElement('div');
    circle.className = 'meal-circle';
    
    if (isSelected) {
      // Display a white checkmark inside the terracotta filled circle
      const checkIcon = document.createElement('i');
      checkIcon.setAttribute('data-lucide', 'check');
      checkIcon.className = 'icon';
      checkIcon.style.color = '#FFFFFF';
      checkIcon.style.width = '24px';
      checkIcon.style.height = '24px';
      circle.appendChild(checkIcon);
    } else {
      // Unclipped food illustration image inside the circle
      const img = document.createElement('img');
      img.className = 'meal-image';
      img.src = meal.icon;
      img.alt = meal.name;
      circle.appendChild(img);
    }
    
    const label = document.createElement('span');
    label.className = 'meal-name';
    label.textContent = meal.name;
    
    item.appendChild(circle);
    item.appendChild(label);
    
    // Circle click toggle logic
    item.addEventListener('click', () => {
      if (selectedMeals.has(meal.name)) {
        selectedMeals.delete(meal.name);
      } else {
        selectedMeals.add(meal.name);
      }
      
      // Re-render grid to reflect check state
      renderOnboardingMeals();
      
      // Enable Next button only if at least 6 items are checked
      onboardingNextBtn.disabled = selectedMeals.size < 6;
    });
    
    mealsGrid.appendChild(item);
  });
  
  // Append "Add custom" dotted circle item at the very end
  const addCustomItem = document.createElement('div');
  addCustomItem.className = 'grid-meal-item';
  
  const customCircle = document.createElement('div');
  customCircle.className = 'meal-circle custom-add';
  
  const plusIcon = document.createElement('i');
  plusIcon.setAttribute('data-lucide', 'plus');
  plusIcon.className = 'icon';
  customCircle.appendChild(plusIcon);
  
  const customLabel = document.createElement('span');
  customLabel.className = 'meal-name';
  customLabel.textContent = 'Custom';
  
  addCustomItem.appendChild(customCircle);
  addCustomItem.appendChild(customLabel);
  
  addCustomItem.addEventListener('click', () => {
    const customName = prompt("What meal would you like to add?");
    if (customName && customName.trim().length > 0) {
      const cleanedName = customName.trim();
      const exists = onboardingMeals.some(m => m.name.toLowerCase() === cleanedName.toLowerCase());
      if (!exists) {
        onboardingMeals.push({
          name: cleanedName,
          icon: "https://img.icons8.com/office/80/pan.png", // verified generic pan icon
          isVeg: true,
          time: 15
        });
      }
      selectedMeals.add(cleanedName);
      renderOnboardingMeals();
      onboardingNextBtn.disabled = selectedMeals.size < 6;
    }
  });
  
  mealsGrid.appendChild(addCustomItem);
  
  // Update Selection Count helper label (displays progress towards 6-meal minimum)
  if (selectionCount) {
    if (selectedMeals.size > 0) {
      if (selectedMeals.size < 6) {
        selectionCount.textContent = `${selectedMeals.size} of 6 selected`;
      } else {
        selectionCount.textContent = `${selectedMeals.size} meals selected`;
      }
      selectionCount.style.visibility = 'visible';
    } else {
      selectionCount.style.visibility = 'hidden';
    }
  }
  
  initIcons();
}

// Update UI with the current recipe details
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
  
  // Re-build recipe list checkboxes
  ingredientList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.className = 'ingredient-item interactive-ingredient';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text-body';
    textSpan.textContent = ingredient;
    
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'circle');
    icon.className = 'icon';
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.color = 'var(--color-text-ghost)';
    
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

// Swap transition / rotate recipe
function swapRecipe() {
  recipeView.classList.remove('fade-in');
  setTimeout(() => {
    currentRecipeIndex = (currentRecipeIndex + 1) % recipes.length;
    displayRecipe(currentRecipeIndex);
    recipeView.classList.add('fade-in');
  }, 100);
}

// Setup date display
function setupDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  const dateText = today.toLocaleDateString('en-US', options);
  dateLabel.textContent = dateText.toLowerCase();
}

// Event Listeners

// Veg toggle change
if (vegToggle) {
  vegToggle.addEventListener('change', () => {
    renderOnboardingMeals();
  });
}

// Navigate from onboarding (Screen 1) to kitchen screen (Screen 2)
onboardingNextBtn.addEventListener('click', () => {
  window.location.href = 'kitchen.html';
});

// Swap recipe button
swapBtn.addEventListener('click', swapRecipe);

// Cook recipe button
cookBtn.addEventListener('click', () => {
  recipeView.classList.add('hidden');
  successView.classList.remove('hidden');
  successView.classList.add('fade-in');
});

// Return / reset button
resetBtn.addEventListener('click', () => {
  successView.classList.add('hidden');
  onboardingView.classList.remove('hidden');
  onboardingView.classList.add('fade-in');
  
  // Clear choices and filters
  selectedMeals.clear();
  if (vegToggle) vegToggle.checked = false;
  onboardingNextBtn.disabled = true;
  
  renderOnboardingMeals();
});

// Initial Run
window.addEventListener('DOMContentLoaded', () => {
  setupDate();
  renderOnboardingMeals();
  displayRecipe(currentRecipeIndex);
});
