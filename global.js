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
  const skeletonPages = ['meals', 'home', 'grocery', 'profile'];
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
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="c-shimmer" style="height: 52px; width: 52px; border-radius: 50%;"></div>
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
            <div class="c-shimmer" style="height: 20px; width: 100px; border-radius: var(--radius-sm);"></div>
            <div class="c-shimmer" style="height: 14px; width: 200px; border-radius: var(--radius-sm);"></div>
          </div>
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

  grid.addEventListener('click', (e) => {
    const option = e.target.closest('.js-meal-option');
    if (!option) return;

    // Handle Custom Meal Addition (Onboarding only)
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
  const bubbles = document.querySelectorAll('.js-energy-bubble');
  bubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      e.preventDefault();
      const selection = bubble.getAttribute('id');
      localStorage.setItem('saviour_selected_energy', selection);

      if (selection === 'energy-okay' || selection === 'energy-fine') {
        localStorage.setItem('saviour_notification_type', 'rajma_rice');
        localStorage.setItem('saviour_selected_meal', 'Rajma Rice');
        localStorage.removeItem('saviour_selected_meal_emoji');
        window.location.href = 'notification-screen.html';
      } else {
        localStorage.setItem('saviour_notification_type', 'how_tired');
        window.location.href = 'index.html';
      }
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

  if (mealTitleEl) {
    mealTitleEl.textContent = selectedMeal;
  }

  if (mealEmojiEl) {
    if (selectedMealEmoji) {
      mealEmojiEl.innerHTML = `<img src="${selectedMealEmoji}" alt="${selectedMeal}" style="width: 60px; height: 60px; object-fit: contain;">`;
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
      mealEmojiEl.textContent = fallbackEmoji;
    }
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
      window.location.href = 'index.html';
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
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
      showCookingStartedOverlay(selectedMeal);
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

  const soakingBtn = document.getElementById('its-soaking-btn');
  const skipBtn = document.getElementById('skip-prep-btn');
  const backBtn = document.getElementById('prep-back-btn');

  // Load selected meal from localStorage (fallback to Rajma Rice)
  const selectedMeal = localStorage.getItem('saviour_selected_meal') || 'Rajma Rice';

  // Extract first word (e.g. "Rajma Rice" -> "rajma", "Sandwich" -> "sandwich")
  const firstWord = selectedMeal.trim().split(' ')[0].toLowerCase();

  if (headerTitleEl) {
    headerTitleEl.textContent = `Tonight: soak ${firstWord}`;
  }

  if (mealNameEl) {
    // If it's Rajma Rice, format as "Rajama" (Figma spelling) or capitalized first word
    const capitalizedWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    mealNameEl.textContent = capitalizedWord === 'Rajma' ? 'Rajama' : capitalizedWord;
  }

  if (actionInstructionEl) {
    actionInstructionEl.innerHTML = `Soak &frac12; cup in water`;
  }

  if (descTextEl) {
    descTextEl.textContent = `Soaking cuts tomorrow's cook time from 45 min to 20 min.`;
  }

  // Customize emoji if not Rajma Rice
  if (mealEmojiEl && selectedMeal.toLowerCase() !== 'rajma rice') {
    const selectedMealEmoji = localStorage.getItem('saviour_selected_meal_emoji') || '';
    if (selectedMealEmoji) {
      mealEmojiEl.innerHTML = `<img src="${selectedMealEmoji}" alt="${selectedMeal}" style="width: 60px; height: 60px; object-fit: contain;">`;
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
      mealEmojiEl.textContent = fallbackEmoji;
    }
  }

  // Bind actions
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
    window.location.href = 'index.html';
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

  let boughtItems = JSON.parse(localStorage.getItem('saviour_bought_items') || '[]');

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
      const label = row.querySelector('.c-pantry-row__label');
      const isBought = boughtItems.includes(title);

      if (isBought) {
        if (checkbox) checkbox.classList.add('is-selected');
        row.classList.add('is-checked');
        row.style.opacity = '0.5';
        if (label) label.style.textDecoration = 'line-through';
      } else {
        if (checkbox) checkbox.classList.remove('is-selected');
        row.classList.remove('is-checked');
        row.style.opacity = '1';
        if (label) label.style.textDecoration = 'none';
        if (status === 'OUT' || status === 'LOW') {
          needToBuyCount++;
        }
      }

      // Filter logic:
      if (filter === 'buy') {
        // Under "Need to Buy", show all items that are OUT or LOW (whether bought/checked or not)
        if (status === 'OUT' || status === 'LOW') {
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

    const statusEl = document.getElementById('sheet-item-status');
    statusEl.textContent = statusLabel;
    statusEl.className = 'ty-label'; // reset classes
    if (status === 'OUT') {
      statusEl.style.backgroundColor = 'var(--color-error-subtle)';
      statusEl.style.color = 'var(--color-error)';
    } else if (status === 'LOW') {
      statusEl.style.backgroundColor = 'var(--color-warning-subtle)';
      statusEl.style.color = 'var(--color-warning)';
    } else {
      statusEl.style.backgroundColor = 'var(--color-success-subtle)';
      statusEl.style.color = 'var(--color-success)';
    }
    statusEl.style.padding = '4px 10px';
    statusEl.style.borderRadius = '8px';

    document.getElementById('sheet-item-qty').textContent = qty;
    document.getElementById('sheet-item-needed').textContent = needed;
    document.getElementById('sheet-item-also-used').textContent = alsoUsed;
    document.getElementById('sheet-item-category').textContent = category;

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
          if (!boughtItems.includes(title)) {
            boughtItems.push(title);
          }
        } else {
          row.classList.remove('is-checked');
          boughtItems = boughtItems.filter(item => item !== title);
        }
        localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
        updateGroceryListUI();
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
        }
        if (!boughtItems.includes(title)) {
          boughtItems.push(title);
          localStorage.setItem('saviour_bought_items', JSON.stringify(boughtItems));
        }
        updateGroceryListUI();
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
 * Initializes the Saviour Profile preference toggles and account settings
 */
function initProfile() {
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
  const prefContainer = document.querySelector('.SingleGroupedCard') || document.querySelector('main.app-content div[style*="padding: 0 16px"]');
  if (prefContainer) {
    const prefRows = prefContainer.children;
    if (prefRows && prefRows.length >= 4) {
      // Row 0: Office leave time
      const officeLeaveRow = prefRows[0];
      const leaveTimeCaption = officeLeaveRow.querySelector('.ty-caption') || officeLeaveRow.querySelector('.30Pm');
      const savedLeaveTime = localStorage.getItem('saviour_leave_time') || '7:30 PM';
      if (leaveTimeCaption) {
        leaveTimeCaption.textContent = savedLeaveTime;
      }
      officeLeaveRow.addEventListener('click', () => {
        window.location.href = 'leave-office.html';
      });

      // Row 1: Diet preference
      const dietRow = prefRows[1];
      dietRow.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  // Delete account action
  const deleteBtn = document.querySelector('main.app-content button[style*="text-decoration: underline"]');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete your account? This will clear all progress and choices.')) {
        localStorage.clear();
        alert('Account data cleared successfully!');
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
