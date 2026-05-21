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

const selectedMeals = new Set();

// DOM Elements
const onboardingView = document.getElementById('onboarding-view');
const vegToggle = document.getElementById('veg-toggle');
const mealsGrid = document.getElementById('meals-grid');
const onboardingNextBtn = document.getElementById('onboarding-next-btn');
const selectionCount = document.getElementById('selection-count');

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
    return !isVegOnly || meal.isVeg;
  });
  
  filtered.forEach(meal => {
    const isSelected = selectedMeals.has(meal.name);
    
    const item = document.createElement('div');
    item.className = `grid-meal-item ${isSelected ? 'selected' : ''}`;
    
    const circle = document.createElement('div');
    circle.className = 'meal-circle';
    
    if (isSelected) {
      const checkIcon = document.createElement('i');
      checkIcon.setAttribute('data-lucide', 'check');
      checkIcon.className = 'icon';
      checkIcon.style.color = '#FFFFFF';
      checkIcon.style.width = '24px';
      checkIcon.style.height = '24px';
      circle.appendChild(checkIcon);
    } else {
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
    
    item.addEventListener('click', () => {
      if (selectedMeals.has(meal.name)) {
        selectedMeals.delete(meal.name);
      } else {
        selectedMeals.add(meal.name);
      }
      
      renderOnboardingMeals();
      onboardingNextBtn.disabled = selectedMeals.size < 6;
    });
    
    mealsGrid.appendChild(item);
  });
  
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
          icon: "https://img.icons8.com/office/80/pan.png",
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

// Event Listeners
if (vegToggle) {
  vegToggle.addEventListener('change', () => {
    renderOnboardingMeals();
  });
}

onboardingNextBtn.addEventListener('click', () => {
  window.location.href = 'kitchen.html';
});

// Initial Run
window.addEventListener('DOMContentLoaded', () => {
  renderOnboardingMeals();
});
