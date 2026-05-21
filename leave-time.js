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

// Default Leave Time values
let currentHour = 7;
let currentMin = 30;
let isPM = true;

// DOM Elements
const leaveTimeView = document.getElementById('leave-time-view');
const recipeView = document.getElementById('recipe-view');
const successView = document.getElementById('success-view');

const displayHour = document.getElementById('display-hour');
const displayMin = document.getElementById('display-min');

const btnHourUp = document.getElementById('btn-hour-up');
const btnHourDown = document.getElementById('btn-hour-down');
const btnMinUp = document.getElementById('btn-min-up');
const btnMinDown = document.getElementById('btn-min-down');

const btnAM = document.getElementById('btn-am');
const btnPM = document.getElementById('btn-pm');

const leaveTimeNextBtn = document.getElementById('leave-time-next-btn');

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

// Format number with leading zero if needed
function formatPadded(num) {
  return num.toString().padStart(2, '0');
}

// Update the visual displays
function updateTimeDisplay() {
  displayHour.textContent = formatPadded(currentHour);
  displayMin.textContent = formatPadded(currentMin);
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
    li.className = 'ingredient-item interactive-ingredient checked'; // Default checked since they completed onboarding
    
    const textSpan = document.createElement('span');
    textSpan.className = 'text-body';
    textSpan.textContent = ingredient;
    
    const icon = document.createElement('i');
    icon.className = 'icon';
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.setAttribute('data-lucide', 'check-circle-2');
    icon.style.color = 'var(--color-success)';
    
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

// Hour Increments/Decrements
btnHourUp.addEventListener('click', () => {
  currentHour++;
  if (currentHour > 12) {
    currentHour = 1;
  }
  updateTimeDisplay();
});

btnHourDown.addEventListener('click', () => {
  currentHour--;
  if (currentHour < 1) {
    currentHour = 12;
  }
  updateTimeDisplay();
});

// Minute Increments/Decrements (5 minute intervals)
btnMinUp.addEventListener('click', () => {
  currentMin += 5;
  if (currentMin >= 60) {
    currentMin = 0;
  }
  updateTimeDisplay();
});

btnMinDown.addEventListener('click', () => {
  currentMin -= 5;
  if (currentMin < 0) {
    currentMin = 55;
  }
  updateTimeDisplay();
});

// AM/PM Toggle Interactions
btnAM.addEventListener('click', () => {
  isPM = false;
  btnAM.classList.add('active');
  btnPM.classList.remove('active');
});

btnPM.addEventListener('click', () => {
  isPM = true;
  btnPM.classList.add('active');
  btnAM.classList.remove('active');
});

// Navigation Transitions
leaveTimeNextBtn.addEventListener('click', () => {
  const timeStr = `${currentHour}:${formatPadded(currentMin)} ${isPM ? 'PM' : 'AM'}`;
  localStorage.setItem('userLeaveTime', timeStr);
  window.location.href = 'lock-screen.html';
});

swapBtn.addEventListener('click', swapRecipe);

cookBtn.addEventListener('click', () => {
  recipeView.classList.add('hidden');
  successView.classList.remove('hidden');
  successView.classList.add('fade-in');
});

resetBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Initialize Display
window.addEventListener('DOMContentLoaded', () => {
  setupDate();
  updateTimeDisplay();
  initIcons();
});
