// Saviour - Energy Check Interactions
document.addEventListener('DOMContentLoaded', () => {
  const energyWrapper = document.getElementById('energy-zones-wrapper');
  const zones = document.querySelectorAll('.energy-zone');
  
  // Set up header time (5:00 PM · Monday as requested, keeping style consistent)
  const liveTimeEl = document.getElementById('live-time');
  if (liveTimeEl) {
    liveTimeEl.textContent = "5:00 PM · Monday";
  }

  let transitioning = false;

  zones.forEach((zone, index) => {
    zone.addEventListener('click', () => {
      // Prevent multiple selections or double-tap redirects
      if (transitioning) return;
      transitioning = true;

      const energyLevel = zone.getAttribute('data-energy');
      
      // Store in localStorage for future use (clean integration step)
      localStorage.setItem('userEnergyLevel', energyLevel);

      // Clean existing selection states
      energyWrapper.classList.remove('has-selection', 'selected-1', 'selected-2', 'selected-3');
      zones.forEach(z => z.classList.remove('selected'));

      // Apply selected state classes
      zone.classList.add('selected');
      energyWrapper.classList.add('has-selection');
      energyWrapper.classList.add(`selected-${index + 1}`);

      // Perform redirect to success screen after 2 seconds
      setTimeout(() => {
        window.location.href = 'lock-screen-630.html';
      }, 2000);
    });
  });

  // Init Lucide icons if any are added in structural layers
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
