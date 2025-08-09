document.addEventListener('DOMContentLoaded', function() {
  console.log('Settings page loaded');
  
  const themeSelect = document.getElementById('themeSelect');
  const workSlider = document.getElementById('workSlider');
  const shortBreakSlider = document.getElementById('shortBreakSlider');
  const longBreakSlider = document.getElementById('longBreakSlider');
  const workValue = document.getElementById('workValue');
  const shortBreakValue = document.getElementById('shortBreakValue');
  const longBreakValue = document.getElementById('longBreakValue');
  const saveBtn = document.getElementById('saveBtn');

  // Get settings from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const workTime = urlParams.get('workTime') || '25';
  const shortBreakTime = urlParams.get('shortBreakTime') || '5';
  const longBreakTime = urlParams.get('longBreakTime') || '15';
  const currentTheme = urlParams.get('theme') || 'ocean';

  console.log('URL params:', { workTime, shortBreakTime, longBreakTime, currentTheme });

  // Set initial values
  workSlider.value = workTime;
  shortBreakSlider.value = shortBreakTime;
  longBreakSlider.value = longBreakTime;
  workValue.textContent = workTime;
  shortBreakValue.textContent = shortBreakTime;
  longBreakValue.textContent = longBreakTime;
  themeSelect.value = currentTheme;

  // Update display values when sliders change
  workSlider.addEventListener('input', function() {
    workValue.textContent = workSlider.value;
  });

  shortBreakSlider.addEventListener('input', function() {
    shortBreakValue.textContent = shortBreakSlider.value;
  });

  longBreakSlider.addEventListener('input', function() {
    longBreakValue.textContent = longBreakSlider.value;
  });

  // Save settings and close window
  saveBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Save button clicked');
    
    const newSettings = {
      workTime: parseInt(workSlider.value),
      shortBreakTime: parseInt(shortBreakSlider.value),
      longBreakTime: parseInt(longBreakSlider.value),
      theme: themeSelect.value
    };
    
    console.log('Attempting to save:', newSettings);
    console.log('Window opener exists:', !!window.opener);
    
    let success = false;
    
    try {
      // Try method 1: PostMessage (most reliable for cross-origin)
      if (window.opener) {
        console.log('Method 1: Using postMessage');
        window.opener.postMessage({
          type: 'updateSettings',
          ...newSettings
        }, '*');
        success = true;
      }
    } catch (error) {
      console.log('PostMessage failed, trying localStorage:', error);
    }
    
    // Fallback: LocalStorage
    if (!success) {
      try {
        console.log('Method 2: Using localStorage fallback');
        localStorage.setItem('pendingSettings', JSON.stringify(newSettings));
        success = true;
      } catch (error) {
        console.error('LocalStorage failed:', error);
      }
    }
    
    if (success) {
      console.log('Settings saved, closing window');
      window.close();
    } else {
      alert('Unable to save settings. Please try again.');
    }
  });
  
  console.log('Settings page setup complete');
});