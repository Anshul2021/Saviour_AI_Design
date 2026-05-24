document.addEventListener('DOMContentLoaded', async () => {
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  // Fallback: request fullscreen mode on the first click gesture
  document.addEventListener('click', () => {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, { once: true });

  // 1. Fetch and inject modular components (status-bar, home-indicator)
  await loadComponents();

  // 2. Detect page context type
  let pageType = 'meals';
  if (appContainer.getAttribute('data-page')) {
    pageType = appContainer.getAttribute('data-page');
  } else if (document.getElementById('pantry-list')) {
    pageType = 'pantry';
  } else if (document.getElementById('picker-hours')) {
    pageType = 'leave-office';
  }

  // 3. Conditional skeleton loading (only for meals screen)
  if (pageType === 'meals') {
    // Hide actual content container initially for 2 seconds
    appContainer.style.display = 'none';

    // Create and append the manual skeleton loader overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'app-loading-overlay';
    document.body.appendChild(loadingOverlay);

    // Inject the page-specific skeleton structure (using local fallback for 100% reliability on file://)
    injectSkeletonLayout(loadingOverlay, pageType);

    // Transition skeleton to actual content after exactly 2 seconds
    setTimeout(() => {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.remove();
        appContainer.style.display = 'flex';
      }, 300); // fade out duration matching global.css transition
    }, 2000);
  } else {
    // Show content instantly without skeleton loader
    appContainer.style.display = 'flex';
  }

  // 4. Initialize interactive event bindings
  if (pageType === 'meals') {
    initVegFilter();
    initMealSelection();
    updateSelectedCount();

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        window.location.href = 'pantry.html';
      });
    }
  } else if (pageType === 'pantry') {
    initPantryInteractivity();

    // Redirect to leave-office page on Next button click
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        window.location.href = 'leave-office.html';
      });
    }
  } else if (pageType === 'leave-office') {
    initTimePicker();
  }
});

/**
 * Injects the manually created skeleton HTML structure with CSS shimmer effects
 */
function injectSkeletonLayout(container, pageType) {
  const statusBarHTML = `
    <!-- 1. Skeleton Status Bar -->
    <div class="c-status-bar" style="width: 100%; height: 54px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-sizing: border-box; flex-shrink: 0;">
      <div class="status-bar__time" style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; font-size: 17px; color: var(--color-text-primary); user-select: none;">9:41</div>
      <div class="status-bar__icons" style="display: flex; align-items: center; gap: 6px;">
        <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.35;">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M19.2 1.14623C19.2 0.513183 18.7224 0 18.1333 0H17.0667C16.4776 0 16 0.513183 16 1.14623V11.0802C16 11.7132 16.4776 12.2264 17.0667 12.2264H18.1333C18.7224 12.2264 19.2 11.7132 19.2 11.0802V1.14623ZM11.7659 2.44528H12.8326C13.4217 2.44528 13.8992 2.97078 13.8992 3.61902V11.0527C13.8992 11.7009 13.4217 12.2264 12.8326 12.2264H11.7659C11.1768 12.2264 10.6992 11.7009 10.6992 11.0527V3.61902C10.6992 2.97078 11.1768 2.44528 11.7659 2.44528ZM7.43411 5.09433H6.36745C5.77834 5.09433 5.30078 5.62652 5.30078 6.28301V11.0377C5.30078 11.6942 5.77834 12.2264 6.36745 12.2264H7.43411C8.02322 12.2264 8.50078 11.6942 8.50078 11.0377V6.28301C8.50078 5.62652 8.02322 5.09433 7.43411 5.09433ZM2.13333 7.53962H1.06667C0.477563 7.53962 0 8.06421 0 8.71132V11.0547C0 11.7018 0.477563 12.2264 1.06667 12.2264H2.13333C2.72244 12.2264 3.2 11.7018 3.2 11.0547V8.71132C3.2 8.06421 2.72244 7.53962 2.13333 7.53962Z" fill="var(--color-text-primary)"/>
        </svg>
        <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.35;">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5713 2.46628C11.0584 2.46639 13.4504 3.38847 15.2529 5.04195C15.3887 5.1696 15.6056 5.16799 15.7393 5.03834L17.0368 3.77487C17.1045 3.70911 17.1422 3.62004 17.1417 3.52735C17.1411 3.43467 17.1023 3.34603 17.0338 3.28104C12.3028 -1.09368 4.83907 -1.09368 0.108056 3.28104C0.039524 3.34598 0.000639766 3.4346 7.82398e-06 3.52728C-0.000624118 3.61996 0.0370483 3.70906 0.104689 3.77487L1.40255 5.03834C1.53615 5.16819 1.75327 5.1698 1.88893 5.04195C3.69167 3.38836 6.08395 2.46628 8.5713 2.46628ZM8.56795 6.68656C9.92527 6.68647 11.2341 7.19821 12.2403 8.12234C12.3763 8.2535 12.5907 8.25065 12.7234 8.11593L14.0106 6.79663C14.0784 6.72742 14.1161 6.63355 14.1151 6.536C14.1141 6.43844 14.0746 6.34536 14.0054 6.27757C10.9416 3.38672 6.19688 3.38672 3.13305 6.27757C3.06384 6.34536 3.02435 6.43849 3.02345 6.53607C3.02254 6.63366 3.06028 6.72752 3.12822 6.79663L4.41513 8.11593C4.54778 8.25065 4.76215 8.2535 4.89823 8.12234C5.90368 7.19882 7.21152 6.68713 8.56795 6.68656ZM11.0924 9.48011C11.0943 9.58546 11.0572 9.68703 10.9899 9.76084L8.81327 12.2156C8.74946 12.2877 8.66247 12.3283 8.5717 12.3283C8.48093 12.3283 8.39394 12.2877 8.33013 12.2156L6.1531 9.76084C6.08585 9.68697 6.04886 9.58537 6.05085 9.48002C6.05284 9.37467 6.09365 9.27491 6.16364 9.20429C7.55374 7.8904 9.58966 7.8904 10.9798 9.20429C11.0497 9.27497 11.0904 9.37476 11.0924 9.48011Z" fill="var(--color-text-primary)"/>
        </svg>
        <div style="position: relative; width: 25px; height: 13px; display: flex; align-items: center; opacity: 0.35;">
          <svg width="25" height="13" viewBox="0 0 25 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; left: 0; top: 0;">
            <rect x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="var(--color-text-primary)"/>
          </svg>
        </div>
      </div>
    </div>
  `;

  const footerHTML = `
    <!-- 3. Skeleton Bottom Controls Area -->
    <div class="controls-area" style="border-top: 1px solid var(--color-divider); box-sizing: border-box; flex-shrink: 0;">
      <div class="c-shimmer skeleton-counter-text"></div>
      <div class="c-shimmer skeleton-btn"></div>
      
      <!-- Home Indicator -->
      <div class="c-home-indicator" style="width: 100%; display: flex; justify-content: center; align-items: center; padding: 8px 0 0 0; box-sizing: border-box; flex-shrink: 0;">
        <div class="home-indicator-bar" style="width: 134px; height: 5px; background-color: var(--color-text-primary); border-radius: 100px; opacity: 0.8;"></div>
      </div>
    </div>
  `;

  if (pageType === 'pantry') {
    container.innerHTML = `
      ${statusBarHTML}
      <!-- 2. Skeleton Scrollable Content (Pantry layout) -->
      <div class="app-content" style="display: flex; flex-direction: column; gap: 24px; overflow: hidden; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 12px; padding-top: 8px;">
          <!-- Back button shimmer -->
          <div class="c-shimmer" style="height: 16px; width: 60px; border-radius: var(--radius-sm);"></div>
          <!-- Title shimmer -->
          <div class="c-shimmer skeleton-title" style="width: 75%; height: 32px;"></div>
          <!-- Description shimmer -->
          <div class="c-shimmer skeleton-desc-line" style="width: 90%; height: 14px;"></div>
          <div class="c-shimmer skeleton-desc-line-sub" style="width: 60%; height: 14px;"></div>
        </div>

        <!-- Search bar shimmer -->
        <div class="c-shimmer" style="height: 48px; border-radius: var(--radius-lg); width: 100%; flex-shrink: 0;"></div>

        <!-- Filter chips bar shimmer -->
        <div style="display: flex; gap: 8px; overflow: hidden; flex-shrink: 0;">
          <div class="c-shimmer" style="height: 30px; width: 50px; border-radius: 999px;"></div>
          <div class="c-shimmer" style="height: 30px; width: 70px; border-radius: 999px;"></div>
          <div class="c-shimmer" style="height: 30px; width: 85px; border-radius: 999px;"></div>
          <div class="c-shimmer" style="height: 30px; width: 90px; border-radius: 999px;"></div>
          <div class="c-shimmer" style="height: 30px; width: 80px; border-radius: 999px;"></div>
        </div>

        <!-- Scrollable rows list shimmer -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; overflow: hidden;">
          ${Array(8).fill(0).map((_, i) => `
            <div class="skeleton-row" style="flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="c-shimmer skeleton-checkbox"></div>
                <div class="c-shimmer skeleton-emoji"></div>
                <div class="c-shimmer skeleton-text" style="width: ${i % 2 === 0 ? 90 : 120}px;"></div>
              </div>
              <div class="c-shimmer skeleton-right" style="width: ${i % 3 === 0 ? 110 : (i % 3 === 1 ? 80 : 0)}px; opacity: ${i % 3 === 2 ? 0 : 1};"></div>
            </div>
          `).join('')}
        </div>
      </div>
      ${footerHTML}
    `;
  } else {
    // Default/Meals page skeleton layout
    container.innerHTML = `
      ${statusBarHTML}
      <div class="app-content" style="display: flex; flex-direction: column; gap: 32px; overflow: hidden; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div class="c-shimmer skeleton-title"></div>
            <div class="c-shimmer skeleton-title-sub"></div>
          </div>
          <div>
            <div class="c-shimmer skeleton-desc-line"></div>
            <div class="c-shimmer skeleton-desc-line-sub"></div>
          </div>
        </div>
        <div class="meals-grid" style="padding-bottom: 24px;">
          ${Array(12).fill(0).map(() => `
            <div class="c-meal-option">
              <div class="c-meal-option__avatar-wrapper">
                <div class="c-shimmer skeleton-avatar"></div>
              </div>
              <div class="c-shimmer skeleton-label"></div>
            </div>
          `).join('')}
        </div>
      </div>
      ${footerHTML}
    `;
  }
}

/**
 * Dynamically loads and injects global components marked with data-component
 */
async function loadComponents() {
  const placeholders = document.querySelectorAll('[data-component]');
  const loadPromises = Array.from(placeholders).map(async (el) => {
    const componentName = el.getAttribute('data-component');
    try {
      // Local file protocol CORS fetch bypass fallback
      if (window.location.protocol === 'file:') {
        throw new Error('Local file protocol detected. Fetching is blocked by CORS. Using fallback.');
      }
      const response = await fetch(`components/ui/${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }
      const html = await response.text();
      el.innerHTML = html;
    } catch (err) {
      console.warn(err);
      // Inject standard iOS component templates as local fallbacks
      if (componentName === 'status-bar') {
        el.innerHTML = `
          <!-- Fallback Status Bar -->
          <div class="c-status-bar" style="width: 100%; height: 54px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-sizing: border-box;">
            <div class="status-bar__time" style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; font-size: 17px; color: var(--color-text-primary); user-select: none;">9:41</div>
            <div class="status-bar__icons" style="display: flex; align-items: center; gap: 6px;">
              <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M19.2 1.14623C19.2 0.513183 18.7224 0 18.1333 0H17.0667C16.4776 0 16 0.513183 16 1.14623V11.0802C16 11.7132 16.4776 12.2264 17.0667 12.2264H18.1333C18.7224 12.2264 19.2 11.7132 19.2 11.0802V1.14623ZM11.7659 2.44528H12.8326C13.4217 2.44528 13.8992 2.97078 13.8992 3.61902V11.0527C13.8992 11.7009 13.4217 12.2264 12.8326 12.2264H11.7659C11.1768 12.2264 10.6992 11.7009 10.6992 11.0527V3.61902C10.6992 2.97078 11.1768 2.44528 11.7659 2.44528ZM7.43411 5.09433H6.36745C5.77834 5.09433 5.30078 5.62652 5.30078 6.28301V11.0377C5.30078 11.6942 5.77834 12.2264 6.36745 12.2264H7.43411C8.02322 12.2264 8.50078 11.6942 8.50078 11.0377V6.28301C8.50078 5.62652 8.02322 5.09433 7.43411 5.09433ZM2.13333 7.53962H1.06667C0.477563 7.53962 0 8.06421 0 8.71132V11.0547C0 11.7018 0.477563 12.2264 1.06667 12.2264H2.13333C2.72244 12.2264 3.2 11.7018 3.2 11.0547V8.71132C3.2 8.06421 2.72244 7.53962 2.13333 7.53962Z" fill="var(--color-text-primary)"/>
              </svg>
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5713 2.46628C11.0584 2.46639 13.4504 3.38847 15.2529 5.04195C15.3887 5.1696 15.6056 5.16799 15.7393 5.03834L17.0368 3.77487C17.1045 3.70911 17.1422 3.62004 17.1417 3.52735C17.1411 3.43467 17.1023 3.34603 17.0338 3.28104C12.3028 -1.09368 4.83907 -1.09368 0.108056 3.28104C0.039524 3.34598 0.000639766 3.4346 7.82398e-06 3.52728C-0.000624118 3.61996 0.0370483 3.70906 0.104689 3.77487L1.40255 5.03834C1.53615 5.16819 1.75327 5.1698 1.88893 5.04195C3.69167 3.38836 6.08395 2.46628 8.5713 2.46628ZM8.56795 6.68656C9.92527 6.68647 11.2341 7.19821 12.2403 8.12234C12.3763 8.2535 12.5907 8.25065 12.7234 8.11593L14.0106 6.79663C14.0784 6.72742 14.1161 6.63355 14.1151 6.536C14.1141 6.43844 14.0746 6.34536 14.0054 6.27757C10.9416 3.38672 6.19688 3.38672 3.13305 6.27757C3.06384 6.34536 3.02435 6.43849 3.02345 6.53607C3.02254 6.63366 3.06028 6.72752 3.12822 6.79663L4.41513 8.11593C4.54778 8.25065 4.76215 8.2535 4.89823 8.12234C5.90368 7.19882 7.21152 6.68713 8.56795 6.68656ZM11.0924 9.48011C11.0943 9.58546 11.0572 9.68703 10.9899 9.76084L8.81327 12.2156C8.74946 12.2877 8.66247 12.3283 8.5717 12.3283C8.48093 12.3283 8.39394 12.2877 8.33013 12.2156L6.1531 9.76084C6.08585 9.68697 6.04886 9.58537 6.05085 9.48002C6.05284 9.37467 6.09365 9.27491 6.16364 9.20429C7.55374 7.8904 9.58966 7.8904 10.9798 9.20429C11.0497 9.27497 11.0904 9.37476 11.0924 9.48011Z" fill="var(--color-text-primary)"/>
              </svg>
              <div style="position: relative; width: 25px; height: 13px; display: flex; align-items: center;">
                <svg width="25" height="13" viewBox="0 0 25 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; left: 0; top: 0;">
                  <rect opacity="0.35" x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="var(--color-text-primary)"/>
                </svg>
                <svg width="2" height="5" viewBox="0 0 2 5" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; left: 25px; top: 4px;">
                  <path opacity="0.4" d="M0 0V4.07547C0.804731 3.7303 1.32804 2.92734 1.32804 2.03774C1.32804 1.14813 0.804731 0.345169 0 0Z" fill="var(--color-text-primary)"/>
                </svg>
                <svg width="21" height="9" viewBox="0 0 21 9" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; left: 2px; top: 2px;">
                  <rect width="21" height="9" rx="2.5" fill="var(--color-text-primary)"/>
                </svg>
              </div>
            </div>
          </div>
        `;
      } else if (componentName === 'home-indicator') {
        el.innerHTML = `
          <!-- Fallback Home Indicator -->
          <div class="c-home-indicator" style="width: 100%; display: flex; justify-content: center; align-items: center; padding: 8px 0 0 0; box-sizing: border-box; flex-shrink: 0;">
            <div class="home-indicator-bar" style="width: 134px; height: 5px; background-color: var(--color-text-primary); border-radius: 100px; opacity: 0.8;"></div>
          </div>
        `;
      }
    }
  });
  await Promise.all(loadPromises);
}

/**
 * Initializes the Vegetarian Filter Toggle
 */
function initVegFilter() {
  const toggle = document.getElementById('veg-toggle');
  const grid = document.querySelector('.js-meals-grid');
  
  if (!toggle || !grid) return;
  
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      grid.classList.add('show-veg-only');
    } else {
      grid.classList.remove('show-veg-only');
    }
    // Update selected counts in case any hidden items are selected
    updateSelectedCount();
  });
}

/**
 * Initializes the Meal Selector Option clicks
 */
function initMealSelection() {
  const grid = document.querySelector('.js-meals-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const option = e.target.closest('.js-meal-option');
    if (!option) return;

    // Handle Custom Meal Addition
    if (option.classList.contains('c-meal-option--custom')) {
      handleAddCustomMeal(grid);
      return;
    }

    // Toggle selected state
    option.classList.toggle('is-selected');
    updateSelectedCount();
  });
}

/**
 * Updates the counter display at the bottom of the screen
 */
function updateSelectedCount() {
  const selectedItems = document.querySelectorAll('.js-meal-option.is-selected:not(.c-meal-option--custom)');
  const counterText = document.getElementById('selected-counter');
  const nextBtn = document.getElementById('next-btn');
  
  if (counterText) {
    // Dynamic update matching reference "X of 6 selected"
    counterText.textContent = `${selectedItems.length} of 6 selected`;
  }

  if (nextBtn) {
    if (selectedItems.length > 0) {
      nextBtn.removeAttribute('disabled');
      nextBtn.classList.remove('is-disabled');
    } else {
      nextBtn.setAttribute('disabled', 'true');
      nextBtn.classList.add('is-disabled');
    }
  }
}

/**
 * Prompts user to add a custom meal option to the grid
 */
function handleAddCustomMeal(grid) {
  const mealName = prompt('Enter the name of your custom meal:');
  if (!mealName || mealName.trim() === '') return;

  // Create new meal option container
  const newOption = document.createElement('div');
  newOption.className = 'c-meal-option js-meal-option is-selected';
  newOption.setAttribute('data-veg', 'true'); // Default custom meals as veg/general

  newOption.innerHTML = `
    <div class="c-meal-option__avatar-wrapper">
      <div class="c-meal-option__avatar">
        <!-- Image Placeholder (fallback when not selected) -->
        <div class="c-meal-option__img-placeholder">
          <span>${mealName.trim().charAt(0).toUpperCase()}</span>
        </div>
        <!-- Checkmark Overlay (shown when selected) -->
        <div class="c-meal-option__check">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <span class="c-meal-option__label">${mealName.trim()}</span>
  `;

  // Insert before the Custom Add button
  const customBtn = grid.querySelector('.c-meal-option--custom');
  grid.insertBefore(newOption, customBtn);

  // Recalculate selected counts
  updateSelectedCount();
}

/**
 * Initializes interactive events for the Pantry Page
 */
function initPantryInteractivity() {
  const pantryList = document.getElementById('pantry-list');
  const searchInput = document.getElementById('pantry-search');
  const filterBar = document.getElementById('pantry-filter-bar');
  const counterText = document.getElementById('checked-counter');
  const nextBtn = document.getElementById('next-btn');

  if (!pantryList) return;

  const rows = Array.from(pantryList.querySelectorAll('.c-pantry-row'));

  function updatePantryState() {
    const checkedRows = rows.filter(row => row.classList.contains('is-selected'));
    const count = checkedRows.length;

    if (counterText) {
      counterText.textContent = `${count} ${count === 1 ? 'item' : 'items'} checked`;
    }

    if (nextBtn) {
      if (count > 0) {
        nextBtn.removeAttribute('disabled');
        nextBtn.classList.remove('is-disabled');
      } else {
        nextBtn.setAttribute('disabled', 'true');
        nextBtn.classList.add('is-disabled');
      }
    }
  }

  // Row selection toggle
  pantryList.addEventListener('click', (e) => {
    // Avoid toggling selection when clicking inside controls (dropdowns, steppers)
    if (e.target.closest('.c-pantry-row__right')) return;

    const row = e.target.closest('.c-pantry-row');
    if (!row) return;

    const checkbox = row.querySelector('.c-checkbox');
    const isSelected = row.classList.contains('is-selected');

    if (isSelected) {
      row.classList.remove('is-selected');
      if (checkbox) checkbox.classList.remove('is-selected');
    } else {
      row.classList.add('is-selected');
      if (checkbox) checkbox.classList.add('is-selected');
    }

    updatePantryState();
  });

  // Dropdown select change handler
  pantryList.addEventListener('change', (e) => {
    const select = e.target.closest('.c-pantry-dropdown__select');
    if (!select) return;

    const dropdown = select.closest('.c-pantry-dropdown');
    if (!dropdown) return;

    const label = dropdown.querySelector('.c-pantry-dropdown__label');
    if (label) {
      label.textContent = select.value;
    }
  });

  // Stepper increment/decrement handler
  pantryList.addEventListener('click', (e) => {
    const btn = e.target.closest('.c-stepper__btn');
    if (!btn) return;

    const stepper = btn.closest('.c-stepper');
    if (!stepper) return;

    const valEl = stepper.querySelector('.c-stepper__val');
    if (!valEl) return;

    let val = parseInt(valEl.textContent, 10) || 0;
    if (btn.textContent.trim() === '−' || btn.textContent.trim() === '-') {
      if (val > 1) val--;
    } else if (btn.textContent.trim() === '+') {
      val++;
    }
    valEl.textContent = val;
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterPantryList();
    });
  }

  // Category filter chip click handler
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const chip = e.target.closest('.c-filter-chip');
      if (!chip) return;

      filterBar.querySelectorAll('.c-filter-chip').forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');

      filterPantryList();
    });
  }

  // Filters rows by search match and category tag
  function filterPantryList() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeChip = filterBar ? filterBar.querySelector('.c-filter-chip.is-selected') : null;
    const category = activeChip ? activeChip.getAttribute('data-category') : 'all';

    rows.forEach(row => {
      const name = row.querySelector('.c-pantry-row__label').textContent.toLowerCase();
      const categoriesStr = row.getAttribute('data-categories') || '';
      const categories = categoriesStr.split(' ');

      const matchesSearch = name.includes(query);
      const matchesCategory = (category === 'all' || categories.includes(category));

      if (matchesSearch && matchesCategory) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Set initial unchecked state count
  updatePantryState();
}

/**
 * Initializes the iOS-style Time Picker component
 */
function initTimePicker() {
  const hourCol = document.getElementById('picker-hours');
  const minuteCol = document.getElementById('picker-minutes');
  const periodCol = document.getElementById('picker-period');
  const nextBtn = document.getElementById('next-btn');

  if (!hourCol || !minuteCol || !periodCol) return;

  // 1. Populate Hours (1 - 12)
  for (let h = 1; h <= 12; h++) {
    const item = document.createElement('div');
    item.className = 'c-time-picker__item';
    item.textContent = h;
    hourCol.appendChild(item);
  }

  // 2. Populate Minutes (00 - 59)
  for (let m = 0; m < 60; m++) {
    const item = document.createElement('div');
    item.className = 'c-time-picker__item';
    item.textContent = m.toString().padStart(2, '0');
    minuteCol.appendChild(item);
  }

  // 3. Populate Period (AM, PM)
  ['AM', 'PM'].forEach(p => {
    const item = document.createElement('div');
    item.className = 'c-time-picker__item';
    item.textContent = p;
    periodCol.appendChild(item);
  });

  // Helper: update item scaling and opacities dynamically based on scroll offset
  function updateWheelOpacity(col) {
    const scrollTop = col.scrollTop;
    const items = col.querySelectorAll('.c-time-picker__item');
    items.forEach((item, index) => {
      // Each item is 40px tall. Distance ratio from centered position:
      const ratio = index - (scrollTop / 40);
      const absRatio = Math.abs(ratio);
      
      item.classList.remove('is-active', 'is-level-2', 'is-level-3');
      
      if (absRatio < 0.5) {
        item.classList.add('is-active');
      } else if (absRatio < 1.5) {
        item.classList.add('is-level-2');
      } else if (absRatio < 2.5) {
        item.classList.add('is-level-3');
      }
    });
  }

  // Attach scroll listeners with requestAnimationFrame for hardware-accelerated smoothness
  [hourCol, minuteCol, periodCol].forEach(col => {
    let ticking = false;
    col.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateWheelOpacity(col);
          ticking = false;
        });
        ticking = true;
      }
    });
  });

  // Set default initial value of 8:00 PM
  // Index of 8 is 7. Index of 00 is 0. Index of PM is 1.
  setTimeout(() => {
    hourCol.scrollTop = 7 * 40;
    minuteCol.scrollTop = 0 * 40;
    periodCol.scrollTop = 1 * 40;
    
    // Force immediate visual update
    updateWheelOpacity(hourCol);
    updateWheelOpacity(minuteCol);
    updateWheelOpacity(periodCol);
  }, 50);

  // Handle CTA Next Action click
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const activeHour = hourCol.querySelector('.is-active')?.textContent || '8';
      const activeMinute = minuteCol.querySelector('.is-active')?.textContent || '00';
      const activePeriod = periodCol.querySelector('.is-active')?.textContent || 'PM';
      
      const selectedTime = `${activeHour}:${activeMinute} ${activePeriod}`;
      
      // Trigger premium success modal with countdown redirect
      showSuccessModal(selectedTime);
    });
  }
}

/**
 * Creates and animatedly reveals the onboarding completion success overlay
 */
function showSuccessModal(selectedTime) {
  // Prevent duplicate modals
  if (document.querySelector('.c-success-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'c-success-overlay';
  overlay.innerHTML = `
    <div class="c-success-card">
      <div class="c-success-checkmark">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="c-success-title">All Set!</h2>
      <p class="c-success-subtitle">Saviour will send your energy check at <strong>${selectedTime}</strong>.</p>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Trigger entry animation next frame
  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
  });

  // Auto-redirect to home meals selection page after 2.5s
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2500);
}


