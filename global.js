document.addEventListener('DOMContentLoaded', async () => {
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  // Seed default notifications in localStorage if they don't exist
  if (!localStorage.getItem('saviour_notifications')) {
    const defaultNotifications = [
      {
        id: 1,
        type: 'energy',
        title: 'Energy Check Needed',
        message: 'How tired are you after work? Set your energy level to decide tonight\'s meal.',
        time: 'Just now',
        link: 'energy-level.html',
        unread: true
      },
      {
        id: 2,
        type: 'prep',
        title: 'Prep Reminder',
        message: 'Remember to soak rajma beans tonight to cut tomorrow\'s cooking time from 45 to 20 minutes.',
        time: '2 hours ago',
        link: 'prep-tomorrow.html',
        unread: true
      },
      {
        id: 3,
        type: 'grocery',
        title: 'Grocery Alert',
        message: 'You are almost out of Rajma (Red kidney beans) and Basmati rice. Tap to review your refill list.',
        time: 'Yesterday',
        link: 'grocery.html',
        unread: false
      }
    ];
    localStorage.setItem('saviour_notifications', JSON.stringify(defaultNotifications));
  }

  // 1. Fetch and inject modular components (status-bar, home-indicator)
  await loadComponents();
  // 1.5 Update status bar time dynamically
  const activePageType = appContainer.getAttribute('data-page') || 'meals';
  const statusBarTimes = document.querySelectorAll('.status-bar__time');
  statusBarTimes.forEach(el => {
    if (activePageType === 'notification-screen' || activePageType === 'cook-item' || activePageType === 'cooking-time' || activePageType === 'prep-tomorrow') {
      const notifType = localStorage.getItem('saviour_notification_type');
      el.textContent = notifType === 'rajma_rice' ? '6:30' : '5:30';
    } else if (activePageType === 'energy-level') {
      el.textContent = '5:30';
    } else {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      el.textContent = `${hours}:${minutes}`;
    }
  });

  // 2. Detect page context type
  let pageType = 'meals';
  if (appContainer.getAttribute('data-page')) {
    pageType = appContainer.getAttribute('data-page');
  } else if (document.getElementById('pantry-list')) {
    pageType = 'pantry';
  } else if (document.getElementById('picker-hours')) {
    pageType = 'leave-office';
  }

  // 3. Conditional skeleton loading
  const skeletonPages = ['meals'];
  if (skeletonPages.includes(pageType)) {
    // Hide actual content container initially
    appContainer.style.display = 'none';

    // Create and append the manual skeleton loader overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'app-loading-overlay';
    document.body.appendChild(loadingOverlay);

    // Inject the page-specific skeleton structure
    injectSkeletonLayout(loadingOverlay, pageType);

    const loadTime = pageType === 'meals' ? 2000 : 1000;

    // Transition skeleton to actual content
    setTimeout(() => {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.remove();
        appContainer.style.display = 'flex';
        setTimeout(() => appContainer.classList.add('is-loaded'), 50);
      }, 300);
    }, loadTime);
  } else {
    // Show content instantly without skeleton loader
    appContainer.style.display = 'flex';
    appContainer.classList.add('is-loaded');
  }

  // Intercept back links for direct navigation
  document.addEventListener('click', (e) => {
    const backLink = e.target.closest('.c-back-link');
    if (backLink) {
      e.preventDefault();
      navigateTo(backLink.getAttribute('href'));
    }
  });

  // 4. Initialize interactive event bindings
  if (pageType === 'meals') {
    initVegFilter();
    initMealSelection();
    updateSelectedCount();

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedMeals = Array.from(document.querySelectorAll('.js-meal-option.is-selected:not(.c-meal-option--custom)'))
          .map(el => {
            const labelEl = el.querySelector('.c-meal-option__label');
            return labelEl ? labelEl.textContent.trim() : '';
          }).filter(name => name !== '');
        localStorage.setItem('saviour_cooked_meals', JSON.stringify(selectedMeals));
        navigateTo('pantry.html');
      });
    }
  } else if (pageType === 'pantry') {
    initPantryInteractivity();

    // Redirect to leave-office page on Next button click
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('leave-office.html');
      });
    }
  } else if (pageType === 'leave-office') {
    initTimePicker();
  } else if (pageType === 'notification-screen') {
    initNotificationScreen();
  } else if (pageType === 'energy-level') {
    initEnergyLevel();
  } else if (pageType === 'cook-item') {
    initCookItem();
  } else if (pageType === 'cooking-time') {
    initCookingTime();
  } else if (pageType === 'prep-tomorrow') {
    initPrepTomorrow();
  } else if (pageType === 'home') {
    initHome();
  } else if (pageType === 'grocery') {
    initGrocery();
  } else if (pageType === 'profile') {
    initProfile();
  } else if (pageType === 'notifications') {
    initNotifications();
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

  const tabbarHTML = `
    <!-- 2.5 Skeleton Bottom Tab Bar -->
    <nav data-component="app-tabbar" class="skeleton-tabbar-shell" aria-hidden="true">
      <div class="c-tabbar">
        ${Array(3).fill(0).map(() => `
          <div class="c-tabbar__item">
            <div class="c-shimmer" style="width: 24px; height: 24px; border-radius: 50%;"></div>
            <div class="c-shimmer" style="width: 52px; height: 11px; border-radius: var(--radius-sm);"></div>
          </div>
        `).join('')}
      </div>
    </nav>
  `;

  const footerHTML = `
    <!-- 3. Skeleton Bottom Controls Area -->
    <div class="controls-area" style="border-top: 1px solid var(--color-divider); box-sizing: border-box; flex-shrink: 0;">
      <div class="c-shimmer skeleton-counter-text"></div>
      <div class="controls-area__actions">
        <div class="c-shimmer skeleton-btn-circle"></div>
        <div class="c-shimmer skeleton-btn" style="flex: 1;"></div>
      </div>
      
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
  } else if (pageType === 'home') {
    container.innerHTML = `
      ${statusBarHTML}
      <div class="app-content" style="display: flex; flex-direction: column; gap: 24px; overflow: hidden; box-sizing: border-box; background-color: #FFFFFF;">
        <!-- Greeting shimmer -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="c-shimmer" style="height: 12px; width: 100px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="height: 28px; width: 180px; border-radius: var(--radius-sm);"></div>
        </div>
        <!-- Hero Card shimmer -->
        <div class="c-shimmer" style="height: 160px; border-radius: var(--radius-xl); width: 100%; flex-shrink: 0;"></div>
        <!-- Week Section shimmer -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="c-shimmer" style="height: 18px; width: 80px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="height: 120px; border-radius: var(--radius-xl); width: 100%;"></div>
        </div>
        <!-- Grocery shimmer -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="c-shimmer" style="height: 18px; width: 100px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="height: 100px; border-radius: var(--radius-xl); width: 100%;"></div>
        </div>
      </div>

      ${tabbarHTML}
    `;
  } else if (pageType === 'grocery') {
    container.innerHTML = `
      ${statusBarHTML}
      <div class="app-content" style="display: flex; flex-direction: column; gap: 20px; overflow: hidden; box-sizing: border-box; background-color: #FFFFFF;">
        <!-- Header shimmer -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div class="c-shimmer" style="height: 24px; width: 140px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="height: 14px; width: 180px; border-radius: var(--radius-sm);"></div>
        </div>
        <!-- Filter chips shimmer -->
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          <div class="c-shimmer" style="height: 32px; width: 100px; border-radius: 999px;"></div>
          <div class="c-shimmer" style="height: 32px; width: 80px; border-radius: 999px;"></div>
        </div>
        <!-- Items rows list shimmer -->
        <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
          <div class="c-shimmer" style="height: 48px; border-radius: var(--radius-lg); width: 100%;"></div>
          <div class="c-shimmer" style="height: 48px; border-radius: var(--radius-lg); width: 100%;"></div>
          <div class="c-shimmer" style="height: 48px; border-radius: var(--radius-lg); width: 100%;"></div>
        </div>
      </div>

      ${tabbarHTML}
    `;
  } else if (pageType === 'profile') {
    container.innerHTML = `
      <div style="background-color: var(--color-surface); z-index: 10; position: relative;">
        <!-- 1. Skeleton Status Bar -->
        <div class="c-status-bar" style="width: 100%; height: 54px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-sizing: border-box; flex-shrink: 0;">
          <div class="status-bar__time" style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 500; font-size: 17px; color: var(--color-text-primary); user-select: none;">9:41</div>
          <div class="status-bar__icons" style="display: flex; align-items: center; gap: 6px;">
            <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.35;">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M19.2 1.14623C19.2 0.513183 18.7224 0 18.1333 0H17.0667C16.4776 0 16 0.513183 16 1.14623V11.0802C16 11.7132 16.4776 12.2264 17.0667 12.2264H18.1333C18.7224 12.2264 19.2 11.7132 19.2 11.0802V1.14623ZM11.7659 2.44528H12.8326C13.4217 2.44528 13.8992 2.97078 13.8992 3.61902V11.0527C13.8992 11.7009 13.4217 12.2264 12.8326 12.2264H11.7659C11.1768 12.2264 10.6992 11.0527V3.61902C10.6992 2.97078 11.1768 2.44528 11.7659 2.44528ZM7.43411 5.09433H6.36745C5.77834 5.09433 5.30078 5.62652 5.30078 6.28301V11.0377C5.30078 11.6942 5.77834 12.2264 6.36745 12.2264H7.43411C8.02322 12.2264 8.50078 11.6942 8.50078 11.0377V6.28301C8.50078 5.62652 8.02322 5.09433 7.43411 5.09433ZM2.13333 7.53962H1.06667C0.477563 7.53962 0 8.06421 0 8.71132V11.0547C0 11.7018 0.477563 12.2264 1.06667 12.2264H2.13333C2.72244 12.2264 3.2 11.7018 3.2 11.0547V8.71132C3.2 8.06421 2.72244 7.53962 2.13333 7.53962Z" fill="var(--color-text-primary)"/>
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
        <!-- Profile title shimmer header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 20px 12px;">
          <div class="c-shimmer" style="height: 24px; width: 80px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="width: 40px; height: 40px; border-radius: 50%;"></div>
        </div>
      </div>
      <div class="app-content" style="display: flex; flex-direction: column; gap: 24px; overflow: hidden; box-sizing: border-box; background-color: #FFFFFF; padding: 24px 20px 24px; flex: 1;">
        <!-- Profile info shimmer -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="c-shimmer" style="height: 52px; width: 52px; border-radius: 50%;"></div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div class="c-shimmer" style="height: 20px; width: 100px; border-radius: var(--radius-sm);"></div>
              <div class="c-shimmer" style="height: 14px; width: 150px; border-radius: var(--radius-sm);"></div>
            </div>
          </div>
          <div class="c-shimmer" style="height: 48px; width: 48px; border-radius: 50%;"></div>
        </div>
        <!-- Stats card shimmer -->
        <div class="c-shimmer" style="height: 140px; border-radius: var(--radius-xl); width: 100%;"></div>
        <!-- Preferences list shimmer -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="c-shimmer" style="height: 18px; width: 100px; border-radius: var(--radius-sm);"></div>
          <div class="c-shimmer" style="height: 200px; border-radius: var(--radius-xl); width: 100%;"></div>
        </div>
      </div>

      ${tabbarHTML}
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
      const response = await fetch(`components/ui/${componentName}.html?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }
      let html = await response.text();
      // Clean live-server injected script tags to prevent DOM corruption
      html = html.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi, '');
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
      } else if (componentName === 'app-tabbar') {
        el.innerHTML = `
          <!-- Fallback Bottom Tab Bar Component -->
          <div class="c-tabbar" role="navigation" aria-label="Primary">
            <a href="home.html" class="c-tabbar__item" data-tab="home" aria-label="Home">
              <div class="c-tabbar__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 17H16M11.0177 2.764L4.23539 8.03912C3.78202 8.39174 3.55534 8.56805 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56805 20.218 8.39174 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <span class="c-tabbar__label">Home</span>
            </a>
            <a href="grocery.html" class="c-tabbar__item" data-tab="grocery" aria-label="Grocery">
              <div class="c-tabbar__icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V8M4.99988 8H19.0001C19.5524 8 20.0001 8.44772 20.0001 9V18.8C20.0001 19.9201 20.0001 20.4802 19.7821 20.908C19.5903 21.2843 19.2844 21.5903 18.9081 21.782C18.4802 22 17.9202 22 16.8001 22H7.19988C6.07978 22 5.51972 22 5.0919 21.782C4.71557 21.5903 4.40961 21.2843 4.21787 20.908C3.99988 20.4802 3.99988 19.9201 3.99988 18.8V9C3.99988 8.44772 4.44759 8 4.99988 8Z" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <span class="c-tabbar__label">Grocery</span>
            </a>
            <a href="profile.html" class="c-tabbar__item" data-tab="profile" aria-label="Profile">
              <div class="c-tabbar__avatar" aria-hidden="true">
                <span class="c-tabbar__avatar-initials">H</span>
              </div>
              <span class="c-tabbar__label">Profile</span>
            </a>
          </div>
        `;
      }
    }
  });
  await Promise.all(loadPromises);

  // Auto-highlight active tab based on active data-page attribute
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    const page = appContainer.getAttribute('data-page');
    if (page) {
      const activeTabs = document.querySelectorAll(`.c-tabbar__item[data-tab="${page}"]`);
      activeTabs.forEach(tab => tab.classList.add('is-active'));
    }
  }
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

  initCustomMealSheet(grid);

  grid.addEventListener('click', (e) => {
    const showMore = e.target.closest('.js-show-more-meals');
    if (showMore) {
      revealExtraMeals(grid, showMore);
      return;
    }

    const option = e.target.closest('.js-meal-option');
    if (!option) return;

    // Handle Custom Meal Addition (Onboarding only)
    if (option.classList.contains('c-meal-option--custom')) {
      openCustomMealSheet();
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
 * Reveals the additional meal options after the compact first list.
 */
function revealExtraMeals(grid, trigger) {
  trigger.setAttribute('aria-expanded', 'true');
  trigger.hidden = true;
  grid.classList.add('is-expanded');

  const extraMeals = grid.querySelectorAll('.c-meal-option--extra');
  extraMeals.forEach((meal, index) => {
    meal.hidden = false;
    window.requestAnimationFrame(() => {
      meal.style.transitionDelay = `${Math.min(index * 35, 260)}ms`;
      meal.classList.add('is-revealed');
    });
  });
}

/**
 * Initializes the custom meal bottom sheet form.
 */
function initCustomMealSheet(grid) {
  const form = document.getElementById('custom-meal-form');
  const overlay = document.getElementById('custom-meal-overlay');
  if (!form || form.dataset.bound === 'true') return;

  form.dataset.bound = 'true';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('custom-meal-name');
    const vegInput = document.getElementById('custom-meal-veg');
    const mealName = input ? input.value.trim() : '';

    if (!mealName) {
      if (input) input.focus();
      return;
    }

    handleAddCustomMeal(grid, mealName, Boolean(vegInput && vegInput.checked));
    form.reset();
    if (vegInput) vegInput.checked = true;
    closeCustomMealSheet();
  });

  if (overlay) {
    overlay.addEventListener('click', closeCustomMealSheet);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCustomMealSheet();
    }
  });
}

/**
 * Opens the custom meal bottom sheet.
 */
function openCustomMealSheet() {
  const sheet = document.getElementById('custom-meal-sheet');
  const overlay = document.getElementById('custom-meal-overlay');
  const input = document.getElementById('custom-meal-name');

  if (!sheet || !overlay) return;

  overlay.classList.add('is-visible');
  sheet.classList.add('is-visible');
  sheet.setAttribute('aria-hidden', 'false');

  window.setTimeout(() => {
    if (input) input.focus();
  }, 180);
}

/**
 * Closes the custom meal bottom sheet.
 */
function closeCustomMealSheet() {
  const sheet = document.getElementById('custom-meal-sheet');
  const overlay = document.getElementById('custom-meal-overlay');

  if (overlay) overlay.classList.remove('is-visible');
  if (sheet) {
    sheet.classList.remove('is-visible');
    sheet.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Adds a custom meal option to the grid with the default food image.
 */
function handleAddCustomMeal(grid, mealName, isVeg) {
  // Create new meal option container
  const newOption = document.createElement('div');
  newOption.className = 'c-meal-option js-meal-option c-meal-option--extra is-revealed';
  newOption.setAttribute('data-veg', isVeg ? 'true' : 'false');

  newOption.innerHTML = `
    <div class="c-meal-option__avatar-wrapper">
      <div class="c-meal-option__avatar">
        <img src="Assets/Dishes/Khichidi.png" alt="${escapeHTML(mealName)}" class="c-meal-option__img">
        <div class="c-meal-option__check">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <span class="c-meal-option__label">${escapeHTML(mealName)}</span>
  `;

  // Insert before the Custom Add button
  const customBtn = grid.querySelector('.c-meal-option--custom');
  grid.insertBefore(newOption, customBtn);

  // Recalculate selected counts
  updateSelectedCount();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
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

  rows.forEach(row => {
    row.querySelectorAll('.c-static-badge').forEach(badge => {
      if (badge.querySelector('.c-static-badge__input')) return;

      const value = badge.textContent.trim();
      const match = value.match(/^([\d.]+)\s*(.*)$/);
      const amount = match ? match[1] : value;
      const unit = match ? match[2] : '';

      badge.innerHTML = `
        <input class="c-static-badge__input" type="text" inputmode="decimal" value="${amount}" aria-label="Quantity amount">
        <span class="c-static-badge__unit">${unit}</span>
      `;
    });
  });

  function syncRowControls(row) {
    const isSelected = row.classList.contains('is-selected');
    row.querySelectorAll('.c-pantry-row__right select, .c-pantry-row__right button, .c-pantry-row__right input').forEach(control => {
      control.disabled = !isSelected;
      control.tabIndex = isSelected ? 0 : -1;
    });
  }

  function updatePantryState() {
    const checkedRows = rows.filter(row => row.classList.contains('is-selected'));
    const count = checkedRows.length;

    rows.forEach(syncRowControls);

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

  pantryList.addEventListener('input', (e) => {
    const input = e.target.closest('.c-static-badge__input');
    if (!input) return;

    input.value = input.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
    input.style.width = `${Math.max(2, Math.min(5, input.value.length || 1))}ch`;
  });

  pantryList.addEventListener('blur', (e) => {
    const input = e.target.closest('.c-static-badge__input');
    if (!input) return;

    if (!input.value.trim()) input.value = '1';
    input.style.width = `${Math.max(2, Math.min(5, input.value.length))}ch`;
  }, true);

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

    pantryList.querySelectorAll('.c-pantry-category-title').forEach(title => {
      let hasVisibleRow = false;
      let next = title.nextElementSibling;

      while (next && !next.classList.contains('c-pantry-category-title')) {
        if (next.classList.contains('c-pantry-row') && next.style.display !== 'none') {
          hasVisibleRow = true;
          break;
        }
        next = next.nextElementSibling;
      }

      title.style.display = hasVisibleRow ? 'block' : 'none';
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

  // Attach scroll listeners with requestAnimationFrame and dynamic Web Audio ticking sounds
  [hourCol, minuteCol, periodCol].forEach(col => {
    let ticking = false;
    let lastScrollTop = col.scrollTop;
    let lastScrollTime = performance.now();
    let accumulatedDistance = 0;

    col.addEventListener('scroll', () => {
      const currentScrollTop = col.scrollTop;
      const currentTime = performance.now();
      
      const deltaScroll = Math.abs(currentScrollTop - lastScrollTop);
      const deltaTime = Math.max(currentTime - lastScrollTime, 1); // Avoid division by zero
      
      // Speed in pixels per millisecond
      const scrollSpeed = deltaScroll / deltaTime;
      
      // Smooth velocity curve matching clock-tick-test.html
      const vel = Math.min(1, 0.15 + Math.pow(scrollSpeed, 0.6) * 1.5);
      accumulatedDistance += deltaScroll;

      // Item height is 40px in our layout
      const itemHeight = 40;
      let n = Math.floor(accumulatedDistance / itemHeight);
      accumulatedDistance = accumulatedDistance % itemHeight;
      n = Math.min(n, 3); // cap ticks per event

      if (n > 0 && window.timePickerAudio) {
        for (let i = 0; i < n; i++) {
          window.timePickerAudio.playTick(vel);
        }
      }

      lastScrollTop = currentScrollTop;
      lastScrollTime = currentTime;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateWheelOpacity(col);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Enable/resume AudioContext on first interaction
    const unlockAudio = () => {
      if (window.timePickerAudio) {
        window.timePickerAudio.init();
        window.timePickerAudio.resume();
      }
    };
    col.addEventListener('touchstart', unlockAudio, { passive: true });
    col.addEventListener('mousedown', unlockAudio);
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

  // Save completion status
  localStorage.setItem('saviour_onboarding_complete', 'true');
  localStorage.setItem('saviour_notification_type', 'how_tired');
  localStorage.setItem('saviour_leave_time', selectedTime);

  // Auto-redirect to lock screen page after 2.5s
  setTimeout(() => {
    navigateTo('notification-screen.html');
  }, 2500);
}

/**
 * Initializes the Lock Screen notification click interaction
 */
function initNotificationScreen() {
  const card = document.querySelector('.js-notification-card');
  const clockEl = document.querySelector('.c-lock-screen__time');
  const titleEl = document.querySelector('.c-notification-card__title');
  const descEl = document.querySelector('.c-notification-card__desc');
  const notifTimeEl = document.querySelector('.c-notification-card__time');

  if (!card) return;

  const notifType = localStorage.getItem('saviour_notification_type');

  if (notifType === 'rajma_rice') {
    // Update lock screen clock to 6:30
    if (clockEl) clockEl.textContent = '6:30';

    // Update notification card details
    if (titleEl) titleEl.textContent = 'Tonight: Rajma Rice';
    if (descEl) descEl.textContent = 'Ready in 35min. Everything is at home.';
    if (notifTimeEl) notifTimeEl.textContent = '6:30 PM';

    // Redirect to cook-item detail page
    card.setAttribute('href', 'cook-item.html');
    card.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cook-item.html';
    });
  } else {
    // Default flow
    if (clockEl) clockEl.textContent = '5:30';
    if (titleEl) titleEl.textContent = 'How tired are you ?';
    if (descEl) descEl.textContent = 'Tell us your energy level';
    if (notifTimeEl) notifTimeEl.textContent = '5:30 PM';

    // Redirect to energy level selection
    card.setAttribute('href', 'energy-level.html');
    card.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'energy-level.html';
    });
  }
}

/**
 * Initializes the Energy Level selection bubbles
 */
function initEnergyLevel() {
  const container = document.getElementById('app-container');
  const bubbles = document.querySelectorAll('.js-energy-bubble');

  // Update current time & date in the header
  const timeEl = document.getElementById('live-time');
  if (timeEl) {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[now.getDay()];
      
      timeEl.innerHTML = `${hours}:${minutes} ${ampm} &middot; ${dayName}`;
    };
    updateTime();
    setInterval(updateTime, 60000);
  }

  bubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      e.preventDefault();
      const selection = bubble.getAttribute('id');
      localStorage.setItem('saviour_selected_energy', selection);

      // Determine details based on selected card
      let energyClass = '';
      let avatarSrc = '';
      let phraseSubtitle = '';

      if (selection === 'energy-exhausted') {
        energyClass = 'exhausted';
        avatarSrc = 'Assets/Energy-Avatar/exhausted.png';
        phraseSubtitle = "Relax, we'll take care of tonight.";
      } else if (selection === 'energy-tired') {
        energyClass = 'tired';
        avatarSrc = 'Assets/Energy-Avatar/Normal.png';
        phraseSubtitle = "Let's keep things steady and easy.";
      } else if (selection === 'energy-energetic') {
        energyClass = 'energetic';
        avatarSrc = 'Assets/Energy-Avatar/energetic.png';
        phraseSubtitle = "Charged up and ready to roll!";
      }

      if (container) {
        const rect = container.getBoundingClientRect();
        
        // Find center coordinates of the clicked button
        const btnRect = bubble.getBoundingClientRect();
        const clickX = (btnRect.left + btnRect.width / 2) - rect.left;
        const clickY = (btnRect.top + btnRect.height / 2) - rect.top;

        // Toggle state classes for card and container transitions
        const listEl = bubble.closest('.c-energy-button-list');
        if (listEl) {
          listEl.classList.add('has-clicked-child');
        }
        bubble.classList.add('is-clicked');

        // Tactile button ripple
        const ripple = document.createElement('div');
        ripple.className = 'c-ripple-bubble';
        
        if (selection === 'energy-exhausted') {
          ripple.classList.add('c-ripple-bubble--exhausted');
        } else if (selection === 'energy-tired') {
          ripple.classList.add('c-ripple-bubble--tired');
        } else if (selection === 'energy-energetic') {
          ripple.classList.add('c-ripple-bubble--energetic');
        }

        // Set initial card dimensions and position on the ripple
        ripple.style.left = `${clickX}px`;
        ripple.style.top = `${clickY}px`;
        ripple.style.width = `${btnRect.width}px`;
        ripple.style.height = `${btnRect.height}px`;
        ripple.style.borderRadius = '24px';
        
        container.appendChild(ripple);

        // Morph button ripple to cover screen
        requestAnimationFrame(() => {
          ripple.style.width = '1200px';
          ripple.style.height = '1200px';
          ripple.style.borderRadius = '50%';
        });
      }

      // Show gorgeous fullscreen overlay after a small delay for tactile feedback
      setTimeout(() => {
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = `c-energy-transition-overlay c-energy-transition-overlay--${energyClass}`;
        transitionOverlay.innerHTML = `
          <div class="c-energy-transition-ripple"></div>
          <div class="c-energy-transition-content">
            <div class="c-energy-transition-avatar-wrapper">
              <img src="${avatarSrc}" alt="${energyClass} avatar" class="c-energy-transition-avatar">
            </div>
            <div class="c-energy-transition-text">
              <div class="c-energy-transition-title">Yo! We got you.</div>
              <div class="c-energy-transition-subtitle">${phraseSubtitle}</div>
            </div>
          </div>
        `;
        if (container) {
          container.appendChild(transitionOverlay);
        } else {
          document.body.appendChild(transitionOverlay);
        }

        // Animate overlay visible
        requestAnimationFrame(() => {
          transitionOverlay.classList.add('is-visible');
        });
      }, 150);

      // Redirect after showing the beautiful bubble & avatar anim
      setTimeout(() => {
        if (selection === 'energy-tired' || selection === 'energy-energetic' || selection === 'energy-exhausted') {
          localStorage.setItem('saviour_notification_type', 'rajma_rice');
          localStorage.setItem('saviour_selected_meal', 'Rajma Rice');
          localStorage.removeItem('saviour_selected_meal_emoji');
          window.location.href = 'notification-screen.html';
        } else {
          localStorage.setItem('saviour_notification_type', 'how_tired');
          window.location.href = 'index.html';
        }
      }, 3000);
    });
  });
}

/**
 * Triggers a page redirect instantly
 */
function navigateTo(url) {
  window.location.href = url;
}

/**
 * Initializes the Cook Item Detail page
 */
function initCookItem() {
  const mealTitleEl = document.getElementById('cook-meal-title');
  const mealEmojiEl = document.getElementById('cook-meal-emoji');
  const mealTimeEl = document.getElementById('cook-meal-time');
  const startBtn = document.getElementById('start-cooking-btn');
  const cancelBtn = document.getElementById('not-tonight-btn');
  const backBtn = document.getElementById('cook-back-btn');

  const drawerBtn = document.getElementById('ingredients-drawer-btn');
  const drawerCard = document.getElementById('ingredients-drawer-card');
  const drawerArrow = document.getElementById('ingredients-drawer-arrow');
  const drawerText = document.getElementById('ingredients-drawer-text');

  // Load selected meal from localStorage (fallback to Rajma Rice)
  const selectedMeal = localStorage.getItem('saviour_selected_meal') || 'Rajma Rice';
  const selectedMealEmoji = localStorage.getItem('saviour_selected_meal_emoji') || '';

  // Load selected cooked meals list
  const cookedMealsRaw = localStorage.getItem('saviour_cooked_meals');
  const cookedMealsList = cookedMealsRaw ? JSON.parse(cookedMealsRaw) : [];
  const cookedMealsKeys = cookedMealsList.map(m => m.toLowerCase().trim());

  // Recipes Database
  const recipes = {
    'rajma rice': {
      time: '35 min',
      ingredients: [
        { name: 'Red kidney beans (rajma)', qty: 1, unit: 'cup' },
        { name: 'Basmati rice', qty: 1, unit: 'cup' },
        { name: 'Onion & tomato', qty: 1, unit: 'large' },
        { name: 'Ginger-garlic paste', qty: 1, unit: 'tbsp' },
        { name: 'Spices (garam masala)', qty: 1, unit: 'tsp' }
      ]
    },
    'maggi': {
      time: '10 min',
      ingredients: [
        { name: 'Maggi noodles', qty: 1, unit: 'pack' },
        { name: 'Maggi tastemaker', qty: 1, unit: 'pack' },
        { name: 'Onion & carrot', qty: 0.5, unit: 'cup' },
        { name: 'Water', qty: 1.5, unit: 'cup' }
      ]
    },
    'egg toast': {
      time: '10 min',
      ingredients: [
        { name: 'Bread slices', qty: 2, unit: 'slice' },
        { name: 'Eggs', qty: 2, unit: 'pc' },
        { name: 'Onion & green chili', qty: 0.25, unit: 'cup' },
        { name: 'Butter', qty: 1, unit: 'tbsp' }
      ]
    },
    'dal chawal': {
      time: '25 min',
      ingredients: [
        { name: 'Yellow lentil (dal)', qty: 0.5, unit: 'cup' },
        { name: 'Basmati rice', qty: 1, unit: 'cup' },
        { name: 'Onion & tomato', qty: 0.5, unit: 'cup' },
        { name: 'Ghee', qty: 1, unit: 'tbsp' }
      ]
    },
    'poha': {
      time: '15 min',
      ingredients: [
        { name: 'Flattened rice (poha)', qty: 1, unit: 'cup' },
        { name: 'Onion & potato', qty: 0.5, unit: 'cup' },
        { name: 'Peanuts', qty: 2, unit: 'tbsp' },
        { name: 'Green chili & curry leaves', qty: 1, unit: 'tbsp' }
      ]
    },
    'curd rice': {
      time: '10 min',
      ingredients: [
        { name: 'Cooked rice', qty: 1.5, unit: 'cup' },
        { name: 'Curd (yogurt)', qty: 0.5, unit: 'cup' },
        { name: 'Milk', qty: 2, unit: 'tbsp' },
        { name: 'Mustard seeds & ginger', qty: 1, unit: 'tsp' }
      ]
    },
    'bread omelette': {
      time: '10 min',
      ingredients: [
        { name: 'Bread slices', qty: 2, unit: 'slice' },
        { name: 'Eggs', qty: 2, unit: 'pc' },
        { name: 'Onion & green chili', qty: 0.25, unit: 'cup' },
        { name: 'Butter', qty: 1, unit: 'tbsp' }
      ]
    },
    'upma': {
      time: '15 min',
      ingredients: [
        { name: 'Semolina (suji)', qty: 0.5, unit: 'cup' },
        { name: 'Onion & carrot', qty: 0.5, unit: 'cup' },
        { name: 'Water', qty: 1.5, unit: 'cup' },
        { name: 'Ghee & mustard seeds', qty: 1, unit: 'tbsp' }
      ]
    },
    'khichdi': {
      time: '20 min',
      ingredients: [
        { name: 'Rice & lentils', qty: 1, unit: 'cup' },
        { name: 'Onion & tomato', qty: 0.5, unit: 'cup' },
        { name: 'Water', qty: 3, unit: 'cup' },
        { name: 'Ghee & cumin seeds', qty: 1, unit: 'tbsp' }
      ]
    },
    'sandwich': {
      time: '5 min',
      ingredients: [
        { name: 'Bread slices', qty: 2, unit: 'slice' },
        { name: 'Cucumber & tomato', qty: 4, unit: 'slice' },
        { name: 'Cheese', qty: 1, unit: 'slice' },
        { name: 'Butter', qty: 1, unit: 'tbsp' }
      ]
    },
    'paratha': {
      time: '20 min',
      ingredients: [
        { name: 'Whole wheat flour', qty: 0.5, unit: 'cup' },
        { name: 'Potato / Paneer stuffing', qty: 0.5, unit: 'cup' },
        { name: 'Ghee', qty: 2, unit: 'tbsp' }
      ]
    },
    'fried rice': {
      time: '15 min',
      ingredients: [
        { name: 'Cooked rice', qty: 1.5, unit: 'cup' },
        { name: 'Mixed veggies', qty: 0.5, unit: 'cup' },
        { name: 'Soy sauce & garlic', qty: 1, unit: 'tbsp' },
        { name: 'Oil', qty: 1, unit: 'tbsp' }
      ]
    },
    'pasta': {
      time: '20 min',
      ingredients: [
        { name: 'Pasta (raw)', qty: 0.75, unit: 'cup' },
        { name: 'Tomato pasta sauce', qty: 0.5, unit: 'cup' },
        { name: 'Garlic & herbs', qty: 1, unit: 'tsp' },
        { name: 'Cheese', qty: 2, unit: 'tbsp' }
      ]
    },
    'omelette': {
      time: '10 min',
      ingredients: [
        { name: 'Eggs', qty: 3, unit: 'pc' },
        { name: 'Onion & tomato', qty: 0.5, unit: 'cup' },
        { name: 'Oil/Butter', qty: 1, unit: 'tbsp' }
      ]
    },
    'oats': {
      time: '10 min',
      ingredients: [
        { name: 'Rolled oats', qty: 0.5, unit: 'cup' },
        { name: 'Milk / Water', qty: 1, unit: 'cup' },
        { name: 'Honey / Sugar', qty: 1, unit: 'tbsp' },
        { name: 'Banana / fruits', qty: 0.5, unit: 'cup' }
      ]
    },
    'chole rice': {
      time: '35 min',
      ingredients: [
        { name: 'Chickpeas (chole)', qty: 1, unit: 'cup' },
        { name: 'Basmati rice', qty: 1, unit: 'cup' },
        { name: 'Onion & tomato', qty: 1, unit: 'large' },
        { name: 'Chole masala', qty: 1, unit: 'tbsp' }
      ]
    },
    'lemon rice': {
      time: '15 min',
      ingredients: [
        { name: 'Cooked rice', qty: 1.5, unit: 'cup' },
        { name: 'Lemon juice', qty: 1, unit: 'tbsp' },
        { name: 'Peanuts & chana dal', qty: 1, unit: 'tbsp' },
        { name: 'Turmeric & curry leaves', qty: 1, unit: 'tsp' }
      ]
    }
  };

  // Match active recipe
  const mealLower = selectedMeal.toLowerCase().trim();
  let activeRecipeKey = 'rajma rice';
  for (const key in recipes) {
    if (mealLower.includes(key)) {
      activeRecipeKey = key;
      break;
    }
  }
  let currentRecipe = recipes[activeRecipeKey];

  if (mealTitleEl) {
    mealTitleEl.textContent = selectedMeal;
  }

  if (mealTimeEl && currentRecipe) {
    mealTimeEl.textContent = `${currentRecipe.time} Cook Time`;
  }

  if (mealEmojiEl) {
    let imageFilename = '';
    if (mealLower.includes('sandwich')) imageFilename = 'Sandwich.png';
    else if (mealLower.includes('egg toast') || mealLower.includes('egg-toast')) imageFilename = 'Egg Toast.png';
    else if (mealLower.includes('dal chawal')) imageFilename = 'Dal Chawal.png';
    else if (mealLower.includes('poha')) imageFilename = 'Poha.png';
    else if (mealLower.includes('curd rice')) imageFilename = 'Curd Rice.png';
    else if (mealLower.includes('bread omelette')) imageFilename = 'Bread Omelette.png';
    else if (mealLower.includes('upma')) imageFilename = 'Upma.png';
    else if (mealLower.includes('khichdi') || mealLower.includes('khichidi')) imageFilename = 'Khichidi.png';
    else if (mealLower.includes('rajma rice')) imageFilename = 'Rajma Rice.png';
    else if (mealLower.includes('paratha')) imageFilename = 'Paratha.png';
    else if (mealLower.includes('fried rice')) imageFilename = 'Fried Rice.png';
    else if (mealLower.includes('pasta')) imageFilename = 'Pasta.png';
    else if (mealLower.includes('omelette')) imageFilename = 'Omelette.png';
    else if (mealLower.includes('oats')) imageFilename = 'Oats.png';
    else if (mealLower.includes('chole rice')) imageFilename = 'Chole Rice.png';
    else if (mealLower.includes('lemon rice')) imageFilename = 'Lemon Rice.png';
    else if (mealLower.includes('maggi')) imageFilename = 'Maggi.png';

    if (imageFilename) {
      mealEmojiEl.innerHTML = `<img src="Assets/Dishes/${encodeURIComponent(imageFilename)}" alt="${selectedMeal}" style="width: 90px; height: 90px; object-fit: contain;">`;
    } else if (selectedMealEmoji) {
      mealEmojiEl.innerHTML = `<img src="${selectedMealEmoji}" alt="${selectedMeal}" style="width: 90px; height: 90px; object-fit: contain;">`;
    } else {
      mealEmojiEl.textContent = '🍛';
    }
  }

  // Stepper quantity formatting helper
  function formatQty(val, unit) {
    let rounded = Math.round(val * 100) / 100;
    let fractionStr = '';
    const whole = Math.floor(rounded);
    const frac = rounded - whole;

    if (Math.abs(frac - 0.5) < 0.01) {
      fractionStr = (whole > 0 ? whole + ' ' : '') + '½';
    } else if (Math.abs(frac - 0.25) < 0.01) {
      fractionStr = (whole > 0 ? whole + ' ' : '') + '¼';
    } else if (Math.abs(frac - 0.75) < 0.01) {
      fractionStr = (whole > 0 ? whole + ' ' : '') + '¾';
    } else {
      fractionStr = rounded.toString();
    }

    let displayUnit = unit;
    if (rounded > 1) {
      if (unit === 'cup') displayUnit = 'cups';
      else if (unit === 'pack') displayUnit = 'packs';
      else if (unit === 'pc') displayUnit = 'pcs';
      else if (unit === 'slice') displayUnit = 'slices';
    }
    return `${fractionStr} ${displayUnit}`;
  }

  // Stepper and ingredients logic
  let servings = 1;
  let tempServings = 1;

  const servingsOverlay = document.getElementById('servings-overlay');
  const servingsSheet = document.getElementById('servings-sheet');
  const servingsVal = document.getElementById('servings-val');
  const servingsDec = document.getElementById('servings-dec-btn');
  const servingsInc = document.getElementById('servings-inc-btn');
  const applyServingsBtn = document.getElementById('apply-servings-btn');
  const cancelServingsBtn = document.getElementById('cancel-servings-btn');

  const ingredientsListEl = document.getElementById('cook-ingredients-list');

  function updateIngredientsUI() {
    if (ingredientsListEl && currentRecipe) {
      ingredientsListEl.innerHTML = '';
      currentRecipe.ingredients.forEach(item => {
        const scaledQty = item.qty * servings;
        const row = document.createElement('div');
        row.className = 'c-cook-row';
        row.innerHTML = `
          <div style="display: flex; align-items: center; min-width: 0; flex: 1; gap: 8px; flex-wrap: wrap;">
            <span class="c-cook-row__name">${item.name}</span>
            <span class="c-cook-row__missing-tag ty-label">Out of stock</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
            <span class="c-cook-row__qty">${formatQty(scaledQty, item.unit)}</span>
            <button class="c-cook-row__toggle-btn" aria-label="Mark as missing">
              <svg class="c-icon-unselected" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg class="c-icon-selected" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" fill="currentColor"></circle>
                <line x1="15" y1="9" x2="9" y2="15" stroke="var(--color-base)"></line>
                <line x1="9" y1="9" x2="15" y2="15" stroke="var(--color-base)"></line>
              </svg>
            </button>
          </div>
        `;
        const toggleBtn = row.querySelector('.c-cook-row__toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            row.classList.toggle('is-missing');
          });
        }
        ingredientsListEl.appendChild(row);
      });
    }
  }

  function updateBottomSheetStepperUI() {
    if (servingsVal) {
      servingsVal.textContent = tempServings;
    }
    if (servingsDec) {
      if (tempServings <= 1) {
        servingsDec.disabled = true;
        servingsDec.style.opacity = '0.5';
      } else {
        servingsDec.disabled = false;
        servingsDec.style.opacity = '1';
      }
    }
  }

  function openServingsSheet() {
    tempServings = servings;
    updateBottomSheetStepperUI();
    if (servingsOverlay && servingsSheet) {
      servingsOverlay.classList.add('is-visible');
      servingsSheet.classList.add('is-visible');
    }
  }

  function closeServingsSheet() {
    if (servingsOverlay && servingsSheet) {
      servingsOverlay.classList.remove('is-visible');
      servingsSheet.classList.remove('is-visible');
    }
  }

  // Change Dish logic
  const changeDishBtn = document.getElementById('change-dish-btn');
  const changeDishOverlay = document.getElementById('change-dish-overlay');
  const changeDishSheet = document.getElementById('change-dish-sheet');
  const changeDishList = document.getElementById('change-dish-list');
  const cancelChangeDishBtn = document.getElementById('cancel-change-dish-btn');

  function getMealImageOrEmoji(mealLower) {
    let imageFilename = '';
    if (mealLower.includes('sandwich')) imageFilename = 'Sandwich.png';
    else if (mealLower.includes('egg toast') || mealLower.includes('egg-toast')) imageFilename = 'Egg Toast.png';
    else if (mealLower.includes('dal chawal')) imageFilename = 'Dal Chawal.png';
    else if (mealLower.includes('poha')) imageFilename = 'Poha.png';
    else if (mealLower.includes('curd rice')) imageFilename = 'Curd Rice.png';
    else if (mealLower.includes('bread omelette')) imageFilename = 'Bread Omelette.png';
    else if (mealLower.includes('upma')) imageFilename = 'Upma.png';
    else if (mealLower.includes('khichdi') || mealLower.includes('khichidi')) imageFilename = 'Khichidi.png';
    else if (mealLower.includes('rajma rice')) imageFilename = 'Rajma Rice.png';
    else if (mealLower.includes('paratha')) imageFilename = 'Paratha.png';
    else if (mealLower.includes('fried rice')) imageFilename = 'Fried Rice.png';
    else if (mealLower.includes('pasta')) imageFilename = 'Pasta.png';
    else if (mealLower.includes('omelette')) imageFilename = 'Omelette.png';
    else if (mealLower.includes('oats')) imageFilename = 'Oats.png';
    else if (mealLower.includes('chole rice')) imageFilename = 'Chole Rice.png';
    else if (mealLower.includes('lemon rice')) imageFilename = 'Lemon Rice.png';
    else if (mealLower.includes('maggi')) imageFilename = 'Maggi.png';

    if (imageFilename) {
      return `<img src="Assets/Dishes/${encodeURIComponent(imageFilename)}" alt="" style="width: 24px; height: 24px; object-fit: contain;">`;
    }
    return '🍛';
  }

  function renderChangeDishList() {
    if (!changeDishList) return;
    changeDishList.innerHTML = '';

    function capitalize(str) {
      return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    for (const key in recipes) {
      if (cookedMealsKeys.length > 0 && !cookedMealsKeys.includes(key) && activeRecipeKey !== key) {
        continue;
      }
      const isSelected = activeRecipeKey === key;
      const formattedName = capitalize(key);
      const recipe = recipes[key];
      
      let imgHTML = '';
      let imageFilename = '';
      if (key.includes('sandwich')) imageFilename = 'Sandwich.png';
      else if (key.includes('egg toast') || key.includes('egg-toast')) imageFilename = 'Egg Toast.png';
      else if (key.includes('dal chawal')) imageFilename = 'Dal Chawal.png';
      else if (key.includes('poha')) imageFilename = 'Poha.png';
      else if (key.includes('curd rice')) imageFilename = 'Curd Rice.png';
      else if (key.includes('bread omelette')) imageFilename = 'Bread Omelette.png';
      else if (key.includes('upma')) imageFilename = 'Upma.png';
      else if (key.includes('khichdi') || key.includes('khichidi')) imageFilename = 'Khichidi.png';
      else if (key.includes('rajma rice')) imageFilename = 'Rajma Rice.png';
      else if (key.includes('paratha')) imageFilename = 'Paratha.png';
      else if (key.includes('fried rice')) imageFilename = 'Fried Rice.png';
      else if (key.includes('pasta')) imageFilename = 'Pasta.png';
      else if (key.includes('omelette')) imageFilename = 'Omelette.png';
      else if (key.includes('oats')) imageFilename = 'Oats.png';
      else if (key.includes('chole rice')) imageFilename = 'Chole Rice.png';
      else if (key.includes('lemon rice')) imageFilename = 'Lemon Rice.png';
      else if (key.includes('maggi')) imageFilename = 'Maggi.png';

      if (imageFilename) {
        imgHTML = `<img src="Assets/Dishes/${encodeURIComponent(imageFilename)}" alt="${formattedName}" class="c-meal-option__img">`;
      } else {
        imgHTML = `<span class="c-meal-option__img-placeholder">🍛</span>`;
      }

      const itemEl = document.createElement('div');
      itemEl.className = `c-meal-option js-meal-option ${isSelected ? 'is-selected' : ''}`;
      itemEl.innerHTML = `
        <div class="c-meal-option__avatar-wrapper">
          <div class="c-meal-option__avatar">
            ${imgHTML}
            <div class="c-meal-option__check">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <span class="c-meal-option__label">${formattedName}</span>
      `;

      itemEl.addEventListener('click', () => {
        localStorage.setItem('saviour_selected_meal', formattedName);

        const mealTitleEl = document.getElementById('cook-meal-title');
        const mealEmojiEl = document.getElementById('cook-meal-emoji');
        const mealTimeEl = document.getElementById('cook-meal-time');

        if (mealTitleEl) mealTitleEl.textContent = formattedName;
        if (mealTimeEl) mealTimeEl.textContent = `${recipe.time} Cook Time`;

        if (mealEmojiEl) {
          if (imageFilename) {
            mealEmojiEl.innerHTML = `<img src="Assets/Dishes/${encodeURIComponent(imageFilename)}" alt="${formattedName}" style="width: 90px; height: 90px; object-fit: contain;">`;
          } else {
            mealEmojiEl.textContent = '🍛';
          }
        }

        activeRecipeKey = key;
        currentRecipe = recipe;
        updateIngredientsUI();
        closeChangeDishSheet();
      });

      changeDishList.appendChild(itemEl);
    }
  }

  function openChangeDishSheet() {
    renderChangeDishList();
    if (changeDishOverlay && changeDishSheet) {
      changeDishOverlay.classList.add('is-visible');
      changeDishSheet.classList.add('is-visible');
    }
  }

  function closeChangeDishSheet() {
    if (changeDishOverlay && changeDishSheet) {
      changeDishOverlay.classList.remove('is-visible');
      changeDishSheet.classList.remove('is-visible');
    }
  }

  if (changeDishBtn) {
    changeDishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openChangeDishSheet();
    });
  }

  if (cancelChangeDishBtn) {
    cancelChangeDishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeChangeDishSheet();
    });
  }

  if (changeDishOverlay) {
    changeDishOverlay.addEventListener('click', (e) => {
      closeChangeDishSheet();
    });
  }

  // Initial render
  updateIngredientsUI();

  // Show servings adjuster bottom sheet dynamically
  const showServingsLink = document.getElementById('show-servings-link');
  if (showServingsLink) {
    showServingsLink.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent collapsing the drawer card
      openServingsSheet();
    });
  }

  // Stepper Event Listeners inside bottom sheet
  if (servingsDec) {
    servingsDec.addEventListener('click', (e) => {
      e.stopPropagation();
      if (tempServings > 1) {
        tempServings--;
        updateBottomSheetStepperUI();
      }
    });
  }

  if (servingsInc) {
    servingsInc.addEventListener('click', (e) => {
      e.stopPropagation();
      tempServings++;
      updateBottomSheetStepperUI();
    });
  }

  // Apply Servings
  if (applyServingsBtn) {
    applyServingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      servings = tempServings;
      updateIngredientsUI();
      closeServingsSheet();
    });
  }

  // Cancel Servings
  if (cancelServingsBtn) {
    cancelServingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeServingsSheet();
    });
  }

  // Backdrop overlay click to dismiss
  if (servingsOverlay) {
    servingsOverlay.addEventListener('click', (e) => {
      closeServingsSheet();
    });
  }

  // Toggle ingredients drawer visibility (collapsed by default)
  if (drawerBtn && drawerCard && drawerArrow && drawerText) {
    drawerBtn.addEventListener('click', () => {
      const isOpen = drawerCard.classList.toggle('is-open');
      if (isOpen) {
        drawerText.textContent = 'Hide ingredients';
        drawerArrow.textContent = '↑';
      } else {
        drawerText.textContent = 'Show ingredients';
        drawerArrow.textContent = '↓';
      }
    });
  }

  // Bind navigation actions
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      window.location.href = 'cooking-time.html';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const notCookingOverlay = document.getElementById('not-cooking-overlay');
      if (notCookingOverlay) {
        notCookingOverlay.classList.add('is-visible');
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 2500);
      } else {
        window.location.href = 'home.html';
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
  }
}

/**
 * Creates and animatedly reveals the cooking started overlay
 */
function showCookingStartedOverlay(mealName) {
  if (document.querySelector('.c-success-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'c-success-overlay';
  overlay.innerHTML = `
    <div class="c-success-card">
      <div class="c-success-checkmark" style="background-color: var(--color-action-subtle); color: var(--color-action);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="c-success-title">Let's Cook!</h2>
      <p class="c-success-subtitle">Starting to cook <strong>${mealName}</strong>. Enjoy your meal!</p>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
  });

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
}

function showCookingDoneOverlay(mealName) {
  if (document.querySelector('.c-success-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'c-success-overlay';
  overlay.innerHTML = `
    <div class="c-success-card">
      <div class="c-success-checkmark" style="background-color: var(--color-success-subtle); color: var(--color-success);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="c-success-title">Yum! Done Cooking</h2>
      <p class="c-success-subtitle">Hope you enjoy your delicious <strong>${mealName}</strong>. Have a great, relaxing evening!</p>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
  });

  setTimeout(() => {
    window.location.href = 'home.html';
  }, 2500);
}

/**
 * Initializes the Cooking Time page with a countdown timer
 */
function initCookingTime() {
  const mealTitleEl = document.getElementById('cooking-meal-title');
  const timerTextEl = document.getElementById('cooking-timer-text');
  const progressCircle = document.getElementById('cooking-progress-circle');
  const doneBtn = document.getElementById('done-cooking-btn');
  const skipBtn = document.getElementById('skip-timer-btn');
  const backBtn = document.getElementById('cook-back-btn');

  // Load selected meal from localStorage (fallback to Rajma Rice)
  const selectedMeal = localStorage.getItem('saviour_selected_meal') || 'Rajma Rice';
  if (mealTitleEl) {
    mealTitleEl.textContent = selectedMeal;
  }

  // Timer Configuration (34 minutes 51 seconds = 2091 seconds)
  let totalSeconds = 2091; // 34:51
  let remainingSeconds = totalSeconds;

  // Circumference of SVG circle (2 * PI * r = 2 * 3.14159 * 100 = 628.3)
  const circumference = 628.3;

  function updateTimerUI() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;

    if (timerTextEl) {
      timerTextEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    if (progressCircle) {
      // Circle stroke starts full and goes to empty
      const offset = circumference - (circumference * remainingSeconds / totalSeconds);
      progressCircle.style.strokeDashoffset = offset;
    }

    // Done Cooking button becomes active and fully visible when timer has progress (active after 3 seconds of mock usage)
    if (remainingSeconds <= 2088) {
      if (doneBtn) {
        doneBtn.style.opacity = '1';
        doneBtn.disabled = false;
      }
    }
  }

  updateTimerUI();

  // Run the countdown timer every second
  const timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateTimerUI();
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);

  // Bind Done Cooking action
  if (doneBtn) {
    doneBtn.disabled = true; // initially disabled as per Figma opacity 0.5
    doneBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      const energy = localStorage.getItem('saviour_selected_energy');
      if (energy === 'energy-tired' || energy === 'energy-energetic') {
        window.location.href = 'prep-tomorrow.html';
      } else {
        showCookingDoneOverlay(selectedMeal);
      }
    });
  }

  // Bind Skip Timer action (goes to prep-tomorrow.html)
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      window.location.href = 'prep-tomorrow.html';
    });
  }

  // Bind Back action (goes to cook-item.html)
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearInterval(timerInterval);
      window.location.href = 'cook-item.html';
    });
  }
}

/**
 * Initializes the Prep for Tomorrow page
 */
function initPrepTomorrow() {
  const headerTitleEl = document.getElementById('prep-header-title');
  const mealNameEl = document.getElementById('prep-meal-name');
  const actionInstructionEl = document.getElementById('prep-action-instruction');
  const descTextEl = document.getElementById('prep-description-text');
  const mealEmojiEl = document.getElementById('prep-meal-emoji');
  const prepDurationEl = document.getElementById('prep-duration');

  const soakingBtn = document.getElementById('its-soaking-btn');
  const skipBtn = document.getElementById('skip-prep-btn');
  const backBtn = document.getElementById('prep-back-btn');

  const changePrepBtn = document.getElementById('change-prep-btn');
  const prepOverlay = document.getElementById('prep-overlay');
  const prepSheet = document.getElementById('prep-sheet');
  const prepListEl = document.getElementById('prep-list');

  // Prep Tasks Database
  const preps = {
    'soak chole': {
      label: 'Soak chole',
      icon: '🫘',
      action: 'Soak &frac12; cup in water',
      desc: "Soaking chickpeas cuts tomorrow's cook time from 45 min to 20 min.",
      badge: '25 MIN SAVED',
      context: 'For chole rice'
    },
    'soak rajma': {
      label: 'Soak Rajma',
      icon: '🥣',
      action: 'Soak 1 cup in water',
      desc: "Soaking rajma cuts tomorrow's cook time from 40 min to 20 min.",
      badge: '20 MIN SAVED',
      context: 'For rajma rice'
    },
    'boil eggs': {
      label: 'Boil eggs',
      icon: '🥚',
      action: 'Boil 2 eggs & peel',
      desc: "Pre-boiling eggs cuts tomorrow's prep time for Egg Toast or egg curry.",
      badge: '10 MIN SAVED',
      context: 'For egg toast'
    },
    'chop onion': {
      label: 'Chop onion',
      icon: '🧅',
      action: 'Fine chop 2 onions',
      desc: "Keeps onions chopped and ready to toss in tomorrow's tadka instantly.",
      badge: '5 MIN SAVED',
      context: 'For general tadka'
    },
    'boil rice': {
      label: 'Boil rice',
      icon: '🍚',
      action: 'Cook 1 cup basmati rice',
      desc: "Cool rice is perfect for tomorrow's quick Fried Rice.",
      badge: '15 MIN SAVED',
      context: 'For fried rice'
    },
    'soak chana': {
      label: 'Soak chana',
      icon: '🥣',
      action: 'Soak 1 cup black chana',
      desc: "Cuts tomorrow's boiling time for chana masala.",
      badge: '20 MIN SAVED',
      context: 'For chana masala'
    }
  };

  // Load selected meal from localStorage (fallback to Rajma Rice)
  const selectedMeal = localStorage.getItem('saviour_selected_meal') || 'Rajma Rice';
  const mealLower = selectedMeal.toLowerCase().trim();

  // Smart selection for default active prep
  let activePrepKey = 'soak rajma';
  if (mealLower.includes('chole')) {
    activePrepKey = 'soak chole';
  } else if (mealLower.includes('rajma')) {
    activePrepKey = 'soak rajma';
  } else if (mealLower.includes('egg') || mealLower.includes('omelette')) {
    activePrepKey = 'boil eggs';
  } else if (mealLower.includes('fried rice')) {
    activePrepKey = 'boil rice';
  } else if (mealLower.includes('chana')) {
    activePrepKey = 'soak chana';
  } else if (mealLower.includes('sandwich') || mealLower.includes('upma') || mealLower.includes('poha')) {
    activePrepKey = 'chop onion';
  }

  function updatePrepUI() {
    const prep = preps[activePrepKey];
    if (!prep) return;

    if (headerTitleEl) {
      headerTitleEl.textContent = `Tonight: ${prep.label.toLowerCase()}`;
    }

    if (mealNameEl) {
      // Format display name (e.g. "Soak rajma" -> "Rajma")
      const words = prep.label.split(' ');
      const nameOnly = words.slice(1).join(' ');
      mealNameEl.textContent = nameOnly.charAt(0).toUpperCase() + nameOnly.slice(1);
    }

    if (actionInstructionEl) {
      actionInstructionEl.innerHTML = prep.action;
    }

    if (descTextEl) {
      descTextEl.textContent = prep.desc;
    }

    if (prepDurationEl) {
      prepDurationEl.textContent = prep.context;
    }

    if (mealEmojiEl) {
      mealEmojiEl.textContent = prep.icon;
      mealEmojiEl.style.fontSize = '60px';
      mealEmojiEl.style.display = 'flex';
      mealEmojiEl.style.alignItems = 'center';
      mealEmojiEl.style.justifyContent = 'center';
    }
  }

  function renderPrepList() {
    if (!prepListEl) return;
    prepListEl.innerHTML = '';

    for (const key in preps) {
      const prep = preps[key];
      const isSelected = activePrepKey === key;

      const itemEl = document.createElement('div');
      itemEl.className = `c-meal-option js-meal-option ${isSelected ? 'is-selected' : ''}`;

      itemEl.innerHTML = `
        <div class="c-meal-option__avatar-wrapper">
          <div class="c-meal-option__avatar">
            <span class="c-meal-option__emoji" style="font-size: 28px; display: flex; align-items: center; justify-content: center;">${prep.icon}</span>
            <div class="c-meal-option__check">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <span class="c-meal-option__label" style="text-align: center; max-width: 78px; line-height: 1.2; display: block;">${prep.label}</span>
      `;

      itemEl.addEventListener('click', () => {
        activePrepKey = key;
        updatePrepUI();
        closePrepSheet();
      });

      prepListEl.appendChild(itemEl);
    }
  }

  function openPrepSheet() {
    renderPrepList();
    if (prepOverlay && prepSheet) {
      prepOverlay.classList.add('is-visible');
      prepSheet.classList.add('is-visible');
    }
  }

  function closePrepSheet() {
    if (prepOverlay && prepSheet) {
      prepOverlay.classList.remove('is-visible');
      prepSheet.classList.remove('is-visible');
    }
  }

  // Bind Open/Close actions
  if (changePrepBtn) {
    changePrepBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPrepSheet();
    });
  }

  if (prepOverlay) {
    prepOverlay.addEventListener('click', closePrepSheet);
  }

  // Initial draw
  updatePrepUI();

  // Bind footer actions
  if (soakingBtn) {
    soakingBtn.addEventListener('click', () => {
      showPrepSuccessOverlay();
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'cooking-time.html';
    });
  }
}

/**
 * Creates and animatedly reveals a success overlay for the Tomorrow Prep page
 */
function showPrepSuccessOverlay() {
  if (document.querySelector('.c-success-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'c-success-overlay';
  overlay.innerHTML = `
    <div class="c-success-card">
      <div class="c-success-checkmark" style="background-color: var(--color-action-subtle); color: var(--color-action);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 class="c-success-title">All Prepped!</h2>
      <p class="c-success-subtitle">Tomorrow's cook time is cut in half. Sleep well!</p>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-visible');
  });

  setTimeout(() => {
    window.location.href = 'home.html';
  }, 2000);
}

/**
 * Initializes the Saviour Home Screen dashboard page
 */
function initHome() {
  // Update header date & time dynamically
  const dateEl = document.getElementById('home-current-date');
  if (dateEl) {
    const updateTime = () => {
      const now = new Date();
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayName = days[now.getDay()];
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      dateEl.textContent = `${dayName}, ${hours}:${minutes} ${ampm}`;
    };
    updateTime();
    setInterval(updateTime, 60000);
  }

  // Bind selected meal to tonight's hero card dynamically
  const tonightCard = document.querySelector('.c-tonight-card');
  if (tonightCard) {
    const titleEl = tonightCard.querySelector('h2');
    const selectedMeal = localStorage.getItem('saviour_selected_meal') || 'Rajma Rice';
    if (titleEl) {
      titleEl.textContent = selectedMeal;
    }

    const emojiEl = tonightCard.querySelector('div[style*="font-size: 24px"]');
    if (emojiEl) {
      const selectedMealEmoji = localStorage.getItem('saviour_selected_meal_emoji');
      if (selectedMealEmoji) {
        emojiEl.innerHTML = `<img src="${selectedMealEmoji}" alt="${selectedMeal}" style="width: 32px; height: 32px; object-fit: contain;">`;
      } else {
        if (selectedMeal.toLowerCase().includes('rajma')) {
          emojiEl.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
              <!-- Bean 1 -->
              <path d="M22.5 8.5C26 9.5 27.5 13 26.5 16.5C25.5 20 22 21 19 20C16 19 17 15.5 18 13C19 10.5 19 7.5 22.5 8.5Z" fill="#9C4444" />
              <!-- Bean 2 -->
              <path d="M10.5 18C11.5 14 15 12.5 18 14C21 15.5 21.5 18.5 20 21C18.5 23.5 15 24 12.5 22.5C10 21 10 22 10.5 18Z" fill="#7E3333" />
              <!-- Bean 3 -->
              <path d="M22.5 24.5C26 22.5 27.5 25 26.5 28C25.5 31 22.5 32 20 30C17.5 28 19.5 26.5 21 25.5C22.5 24.5 19 26.5 22.5 24.5Z" fill="#B35555" />
            </svg>
          `;
        } else {
          let fallbackEmoji = '🍛';
          if (selectedMeal.toLowerCase().includes('sandwich')) fallbackEmoji = '🥪';
          else if (selectedMeal.toLowerCase().includes('toast')) fallbackEmoji = '🍳';
          else if (selectedMeal.toLowerCase().includes('maggi')) fallbackEmoji = '🍜';
          else if (selectedMeal.toLowerCase().includes('paratha')) fallbackEmoji = '🥞';
          else if (selectedMeal.toLowerCase().includes('khichdi')) fallbackEmoji = '🍚';
          else if (selectedMeal.toLowerCase().includes('curd')) fallbackEmoji = '🥣';
          else if (selectedMeal.toLowerCase().includes('omelette')) fallbackEmoji = '🍳';
          else if (selectedMeal.toLowerCase().includes('upma')) fallbackEmoji = '🥣';
          else if (selectedMeal.toLowerCase().includes('poha')) fallbackEmoji = '🥗';
          else if (selectedMeal.toLowerCase().includes('aloo')) fallbackEmoji = '🥔';
          emojiEl.textContent = fallbackEmoji;
        }
      }
    }
  }

  // Update notification badge dot dynamically based on unread items count
  const badgeEl = document.getElementById('home-notification-badge');
  if (badgeEl) {
    const notifications = JSON.parse(localStorage.getItem('saviour_notifications') || '[]');
    const hasUnread = notifications.some(n => n.unread);
    badgeEl.style.display = hasUnread ? 'block' : 'none';
  }
}

/**
 * Initializes the Saviour Grocery page with list interactions and bottom sheet details
 */
function initGrocery() {
  const sheet = document.getElementById('grocery-sheet');
  const overlay = document.getElementById('grocery-sheet-overlay');
  const cancelBtn = document.getElementById('sheet-btn-cancel');
  const boughtBtn = document.getElementById('sheet-btn-bought');
  const filterChips = document.querySelectorAll('#grocery-filter-bar .c-filter-chip');

  // Reset a few items in localStorage on load so that the "Need to buy" section is never empty for prototype
  let boughtItems = JSON.parse(localStorage.getItem('saviour_bought_items') || '[]');
  const defaultNeedToBuy = ['Rajma', 'Dal toor', 'Bread', 'Eggs', 'Curd', 'Coriander', 'Maggi'];
  boughtItems = boughtItems.filter(item => !defaultNeedToBuy.includes(item));
  localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));

  // Helper to update visual states of list and count summary
  function updateGroceryListUI() {
    const activeChip = document.querySelector('#grocery-filter-bar .c-filter-chip.is-selected');
    const filter = activeChip ? activeChip.getAttribute('data-filter') : 'buy';
    const rows = document.querySelectorAll('.js-grocery-item');
    let needToBuyCount = 0;

    rows.forEach(row => {
      const title = row.getAttribute('data-title');
      const status = row.getAttribute('data-status'); // 'OUT', 'LOW', 'OK'
      const checkbox = row.querySelector('.js-grocery-checkbox');
      const isBought = boughtItems.includes(title);
      const showAsChecked = isBought;

      if (showAsChecked) {
        if (checkbox) checkbox.classList.add('is-selected');
        row.classList.add('is-checked');
        row.style.opacity = '0.6';
      } else {
        if (checkbox) checkbox.classList.remove('is-selected');
        row.classList.remove('is-checked');
        row.style.opacity = '1';
      }

      const rightLabelWrap = row.querySelector('.c-pantry-row__right');
      if (rightLabelWrap) {
        const labelSpan = rightLabelWrap.querySelector('.ty-label');
        if (labelSpan) {
          if (isBought) {
            labelSpan.textContent = 'IN STOCK';
            labelSpan.style.backgroundColor = 'var(--color-success-subtle)';
            labelSpan.style.color = 'var(--color-success)';
          } else {
            // Restore original label and styles
            if (status === 'OUT') {
              labelSpan.textContent = 'OUT';
              labelSpan.style.backgroundColor = 'var(--color-error-subtle)';
              labelSpan.style.color = 'var(--color-error)';
            } else if (status === 'LOW') {
              labelSpan.textContent = 'LOW';
              labelSpan.style.backgroundColor = 'var(--color-warning-subtle)';
              labelSpan.style.color = 'var(--color-warning)';
            } else {
              labelSpan.textContent = 'IN STOCK';
              labelSpan.style.backgroundColor = 'var(--color-success-subtle)';
              labelSpan.style.color = 'var(--color-success)';
            }
          }
        }
      }

      if (!isBought && (status === 'OUT' || status === 'LOW')) {
        needToBuyCount++;
      }

      // Hide checkboxes under "All Items" view
      if (checkbox) {
        checkbox.style.display = (filter === 'buy') ? 'flex' : 'none';
      }

      // Filter logic:
      if (filter === 'buy') {
        // Under "Need to Buy", show all items that are OUT or LOW only if they are not bought yet
        // (or if they are in the middle of transitioning/fading out)
        if ((status === 'OUT' || status === 'LOW') && (!isBought || row.classList.contains('js-transitioning-out'))) {
          row.style.display = 'flex';
        } else {
          row.style.display = 'none';
        }
      } else {
        // Under "All Items", show everything
        row.style.display = 'flex';
      }
    });

    // Update summary title
    const summaryEl = document.getElementById('grocery-items-summary');
    if (summaryEl) {
      if (needToBuyCount === 0) {
        summaryEl.textContent = 'All caught up for this week!';
      } else {
        summaryEl.textContent = `${needToBuyCount} ${needToBuyCount === 1 ? 'thing' : 'things'} to grab this week.`;
      }
    }
  }

  // Open bottom sheet
  function openBottomSheet(row) {
    const title = row.getAttribute('data-title');
    const status = row.getAttribute('data-status');
    const statusLabel = row.getAttribute('data-status-label');
    const qty = row.getAttribute('data-qty');
    const needed = row.getAttribute('data-needed');
    const alsoUsed = row.getAttribute('data-also-used');
    const category = row.getAttribute('data-category');

    sheet.setAttribute('data-current-item', title);
    document.getElementById('sheet-item-title').textContent = title;

    const isBought = boughtItems.includes(title);
    const isOriginalInStock = (status === 'OK');
    const isNowInStock = isBought || isOriginalInStock;

    const statusEl = document.getElementById('sheet-item-status');
    statusEl.className = 'ty-label'; // reset classes
    if (isNowInStock) {
      statusEl.textContent = 'In stock';
      statusEl.style.backgroundColor = 'var(--color-success-subtle)';
      statusEl.style.color = 'var(--color-success)';
    } else {
      statusEl.textContent = statusLabel;
      if (status === 'OUT') {
        statusEl.style.backgroundColor = 'var(--color-error-subtle)';
        statusEl.style.color = 'var(--color-error)';
      } else if (status === 'LOW') {
        statusEl.style.backgroundColor = 'var(--color-warning-subtle)';
        statusEl.style.color = 'var(--color-warning)';
      }
    }
    statusEl.style.padding = '4px 10px';
    statusEl.style.borderRadius = '8px';

    document.getElementById('sheet-item-qty').textContent = qty;
    document.getElementById('sheet-item-needed').textContent = needed;
    document.getElementById('sheet-item-also-used').textContent = alsoUsed;
    document.getElementById('sheet-item-category').textContent = category;

    // Show/hide bottom sheet action buttons container based on whether it is In Stock
    const actionButtonsContainer = boughtBtn.parentElement;
    if (actionButtonsContainer) {
      if (isNowInStock) {
        actionButtonsContainer.style.display = 'none';
      } else {
        actionButtonsContainer.style.display = 'flex';
      }
    }

    if (boughtItems.includes(title)) {
      boughtBtn.textContent = 'Already Bought';
      boughtBtn.disabled = true;
    } else {
      boughtBtn.textContent = 'Mark as Bought';
      boughtBtn.disabled = false;
    }

    overlay.classList.add('is-visible');
    sheet.classList.add('is-visible');
  }

  function closeBottomSheet() {
    overlay.classList.remove('is-visible');
    sheet.classList.remove('is-visible');
  }

  // Initialize event bindings on rows
  const rows = document.querySelectorAll('.js-grocery-item');
  rows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.js-grocery-checkbox')) return;
      openBottomSheet(row);
    });

    const checkbox = row.querySelector('.js-grocery-checkbox');
    if (checkbox) {
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = row.getAttribute('data-title');
        const isSelected = checkbox.classList.toggle('is-selected');

        if (isSelected) {
          row.classList.add('is-checked');
          
          // Show toast message from the bottom smartly
          showToast(`${title} marked as bought!`);

          const activeChip = document.querySelector('#grocery-filter-bar .c-filter-chip.is-selected');
          const filter = activeChip ? activeChip.getAttribute('data-filter') : 'buy';
          
          if (filter === 'buy') {
            row.classList.add('js-transitioning-out');
            setTimeout(() => {
              if (row.classList.contains('is-checked')) {
                if (!boughtItems.includes(title)) {
                  boughtItems.push(title);
                  localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
                }
                row.classList.remove('js-transitioning-out');
                updateGroceryListUI();
              }
            }, 1000);
          } else {
            if (!boughtItems.includes(title)) {
              boughtItems.push(title);
              localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
            }
            updateGroceryListUI();
          }
        } else {
          row.classList.remove('is-checked');
          row.classList.remove('js-transitioning-out');
          boughtItems = boughtItems.filter(item => item !== title);
          localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
          updateGroceryListUI();
        }
      });
    }
  });

  // Cancel / Close sheet
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeBottomSheet);
  }
  if (overlay) {
    overlay.addEventListener('click', closeBottomSheet);
  }

  // Mark as bought from sheet
  if (boughtBtn) {
    boughtBtn.addEventListener('click', () => {
      const title = sheet.getAttribute('data-current-item');
      if (title) {
        const row = document.querySelector(`.js-grocery-item[data-title="${title}"]`);
        if (row) {
          const checkbox = row.querySelector('.js-grocery-checkbox');
          if (checkbox) {
            checkbox.classList.add('is-selected');
            row.classList.add('is-checked');
          }
          
          showToast(`${title} marked as bought!`);

          const activeChip = document.querySelector('#grocery-filter-bar .c-filter-chip.is-selected');
          const filter = activeChip ? activeChip.getAttribute('data-filter') : 'buy';
          
          if (filter === 'buy') {
            row.classList.add('js-transitioning-out');
            setTimeout(() => {
              if (row.classList.contains('is-checked')) {
                if (!boughtItems.includes(title)) {
                  boughtItems.push(title);
                  localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
                }
                row.classList.remove('js-transitioning-out');
                updateGroceryListUI();
              }
            }, 1000);
          } else {
            if (!boughtItems.includes(title)) {
              boughtItems.push(title);
              localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
            }
            updateGroceryListUI();
          }
        }
      }
      closeBottomSheet();
    });
  }

  // Filter chips click
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      updateGroceryListUI();
    });
  });

  // Pre-populate if bottom sheet is shown by default (bottomsheetgrocery.html)
  if (sheet && sheet.classList.contains('is-visible')) {
    sheet.setAttribute('data-current-item', 'Rajma');
    if (boughtItems.includes('Rajma') && boughtBtn) {
      boughtBtn.textContent = 'Already Bought';
      boughtBtn.disabled = true;
    }
  }

  // Initial draw
  updateGroceryListUI();
}

/**
 * Helper to display temporary toast message at the bottom of the screen
 */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'c-toast';
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }
  }

  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
      <circle cx="8" cy="8" r="8" fill="var(--color-success)" />
      <path d="M11 6L7 10L5 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('is-visible');

  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }

  toast.timeoutId = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2500);
}

/**
 * Initializes the Saviour Profile preference toggles and account settings
 */
function initProfile() {
  // Update date overlay dynamically on top of the streak flame
  const streakDateEl = document.getElementById('streak-date-overlay');
  if (streakDateEl) {
    streakDateEl.textContent = new Date().getDate();
  }

  // Update notification badge dot dynamically based on unread items count
  const badgeEl = document.getElementById('profile-notification-badge');
  if (badgeEl) {
    const notifications = JSON.parse(localStorage.getItem('saviour_notifications') || '[]');
    const hasUnread = notifications.some(n => n.unread);
    badgeEl.style.display = hasUnread ? 'block' : 'none';
  }

  const notifToggle = document.getElementById('profile-notif-toggle');
  if (notifToggle) {
    const isNudgeEnabled = localStorage.getItem('saviour_profile_nudge') !== 'false';
    notifToggle.checked = isNudgeEnabled;

    notifToggle.addEventListener('change', () => {
      localStorage.setItem('saviour_profile_nudge', notifToggle.checked);
    });
  }

  const resetToggle = document.getElementById('profile-reset-toggle');
  if (resetToggle) {
    const isResetEnabled = localStorage.getItem('saviour_profile_reset') !== 'false';
    resetToggle.checked = isResetEnabled;
    resetToggle.addEventListener('change', () => {
      localStorage.setItem('saviour_profile_reset', resetToggle.checked);
    });
  }

  // Handle office leave time redirect & custom value display
  const leaveTimeRow = document.getElementById('leave-time-row');
  if (leaveTimeRow) {
    const leaveTimeText = leaveTimeRow.querySelector('.ty-body.text-secondary');
    const savedLeaveTime = localStorage.getItem('saviour_leave_time') || '7:30 PM';
    if (leaveTimeText) {
      leaveTimeText.textContent = savedLeaveTime;
    }
    leaveTimeRow.addEventListener('click', () => {
      window.location.href = 'leave-office.html';
    });
  }

  // Handle meal preference redirect
  const mealPrefRow = document.getElementById('meal-preference-row');
  if (mealPrefRow) {
    mealPrefRow.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Logout action
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout? This will reset your profile and selections.')) {
        localStorage.clear();
        window.location.href = 'index.html';
      }
    });
  }
}

/**
 * Initializes the Saviour Notifications page
 */
function initNotifications() {
  const listContainer = document.getElementById('notifications-list-container');
  const emptyState = document.getElementById('notifications-empty-state');
  const clearBtn = document.getElementById('notifications-clear-btn');

  if (!listContainer || !emptyState) return;

  function renderNotifications() {
    const notifications = JSON.parse(localStorage.getItem('saviour_notifications') || '[]');
    
    if (notifications.length === 0) {
      listContainer.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    listContainer.style.display = 'flex';
    if (clearBtn) clearBtn.style.display = 'inline-block';
    emptyState.style.display = 'none';

    // Group notifications: New vs Earlier
    const unreadList = notifications.filter(n => n.unread);
    const readList = notifications.filter(n => !n.unread);

    let html = '';

    if (unreadList.length > 0) {
      html += `<div class="ty-label text-secondary c-notifications-group-title">New</div>`;
      unreadList.forEach(n => {
        html += renderCardHTML(n);
      });
    }

    if (readList.length > 0) {
      html += `<div class="ty-label text-secondary c-notifications-group-title">Earlier</div>`;
      readList.forEach(n => {
        html += renderCardHTML(n);
      });
    }

    listContainer.innerHTML = html;

    // Attach click listeners to cards
    const cards = listContainer.querySelectorAll('.js-app-notification-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(card.getAttribute('data-id'), 10);
        markAsReadAndNavigate(id);
      });
    });
  }

  function renderCardHTML(n) {
    let emoji = '🔔';
    if (n.type === 'energy') emoji = '⚡';
    else if (n.type === 'prep') emoji = '🥣';
    else if (n.type === 'grocery') emoji = '🛒';
    else if (n.type === 'dinner') emoji = '🍛';

    const unreadClass = n.unread ? 'is-unread' : '';

    return `
      <a href="${n.link}" class="c-app-notification-card js-app-notification-card ${unreadClass}" data-id="${n.id}">
        <div class="c-app-notification-card__icon">${emoji}</div>
        <div class="c-app-notification-card__content">
          <div class="c-app-notification-card__title text-primary">${n.title}</div>
          <div class="c-app-notification-card__desc text-secondary">${n.message}</div>
          <div class="c-app-notification-card__time text-ghost">${n.time}</div>
        </div>
      </a>
    `;
  }

  function markAsReadAndNavigate(id) {
    const notifications = JSON.parse(localStorage.getItem('saviour_notifications') || '[]');
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.unread = false;
      localStorage.setItem('saviour_notifications', JSON.stringify(notifications));
      
      // Delay navigation slightly for feedback
      setTimeout(() => {
        window.location.href = notification.link;
      }, 150);
    }
  }

  // Clear all button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all notifications?')) {
        localStorage.setItem('saviour_notifications', JSON.stringify([]));
        // Transition animation helper
        listContainer.style.opacity = '0';
        listContainer.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          renderNotifications();
          listContainer.style.opacity = '1';
        }, 300);
      }
    });
  }

  renderNotifications();
}
