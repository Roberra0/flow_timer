document.addEventListener("DOMContentLoaded", () => {
  // --- Variables ---
  let countdown;                
  let isRunning = false;        
  let workTime = 25 * 60;           // 25 seconds for testing
  let shortBreakTime = 5 * 60;      // 5 seconds for testing  
  let longBreakTime = 15 * 60;      // 15 seconds for testing
  let timeLeft = workTime;     
  let currentType = 'work';    // 'work', 'shortBreak', or 'longBreak'
  let sessionCount = 1;        // Track which work session (1-4)
  let isPaused = false;         // Track pause state
  let currentTheme = 'ocean'; // Default theme

  // --- DOM Elements ---
  const timerDisplay = document.getElementById('timer');
  const startStopBtn = document.getElementById('startStopBtn');
  const timerContainer = document.querySelector('.timer-container');
  const waterCanvas = document.getElementById('fluidCanvas');
  const settingsBtn = document.getElementById('settingsBtn');

// --- Settings communication methods ---
window.updateTimerFromPopup = function(newWorkTime, newShortBreakTime, newLongBreakTime, newTheme) {
  console.log('updateTimerFromPopup called with:', {
    newWorkTime,
    newShortBreakTime,
    newLongBreakTime,
    newTheme
  });
  
  try {
    workTime = newWorkTime * 60;
    shortBreakTime = newShortBreakTime * 60;
    longBreakTime = newLongBreakTime * 60;    
    
    if (newTheme) {
      applyTheme(newTheme);
    }
    
    if (!isRunning) {
      timeLeft = currentType === 'work' ? workTime : 
                 currentType === 'shortBreak' ? shortBreakTime : longBreakTime;
      updateDisplay();
    }
    
    if (window.water && currentType === 'work') {
      window.water.animationDuration = workTime * 1000;
    }
    
    saveSettingsToStorage();
    console.log('Settings updated successfully');
    
  } catch (error) {
    console.error('Error in updateTimerFromPopup:', error);
  }
};

// Listen for postMessage from settings window
// Listen for postMessage from settings window
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'updateSettings') {
    console.log('Received settings via postMessage:', event.data);
    window.updateTimerFromPopup(
      event.data.workTime,
      event.data.shortBreakTime,
      event.data.longBreakTime,
      event.data.theme
    );
  }
});

// Check for pending settings from localStorage
function checkPendingSettings() {
  try {
    const pending = localStorage.getItem('pendingSettings');
    if (pending) {
      const settings = JSON.parse(pending);
      console.log('Found pending settings:', settings);
      window.updateTimerFromPopup(
        settings.workTime,
        settings.shortBreakTime,
        settings.longBreakTime,
        settings.theme
      );
      localStorage.removeItem('pendingSettings');
    }
  } catch (error) {
    console.error('Error checking pending settings:', error);
  }
}
// --- Fix applyTheme function to properly update water color ---
function applyTheme(themeName) {
  const theme = themes[themeName];
  currentTheme = themeName;
  
  console.log('Applying theme:', themeName, 'with water color:', theme.water);
  
  // Update CSS custom properties
  document.documentElement.style.setProperty('--bg-color', theme.background);
  document.documentElement.style.setProperty('--work-bg', theme.workMode);
  document.documentElement.style.setProperty('--break-bg', theme.breakMode);
  document.documentElement.style.setProperty('--play-btn', theme.playButton);
  document.documentElement.style.setProperty('--play-hover', theme.playHover);
  document.documentElement.style.setProperty('--stop-btn', theme.stopButton);
  document.documentElement.style.setProperty('--stop-hover', theme.stopHover);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.documentElement.style.setProperty('--break-text', theme.breakText);
  
  // Update water color - try multiple ways to ensure it works
  if (window.water) {
    console.log('Updating water color to:', theme.water);
    if (window.water.mesh) {
      window.water.mesh.fillColor = theme.water;
    }
    if (window.water.path) {
      window.water.path.fillColor = theme.water;
    }
    // Force a redraw
    if (window.paper && window.paper.view) {
      window.paper.view.draw();
    }
  } else {
    console.log('Water object not found when applying theme');
  }
}

  const themes = {
    ocean: {
      background: '#FFF6E5',
      workMode: '#FFF6E5', 
      breakMode: '#FFCD00',
      playButton: '#2EC4B6',
      playHover: '#5DD5CD',
      stopButton: '#D2691E',
      stopHover: '#FF7F00',
      water: '#2EC4B6',
      text: '#222222',
      breakText: '#333'
    },
    espresso: {
      background: '#2C1810',
      workMode: '#3D2317',
      breakMode: '#D2B48C',
      playButton: '#8B4513',
      playHover: '#A0522D',
      stopButton: '#CD853F',
      stopHover: '#DAA520',
      water: '#A0522D',
      text: '#ffffff',
      breakText: '#2C1810'
    }
  };
  // --- Water Animation Control ---
  function showWater() {
    waterCanvas.classList.add('visible');
    // Reset water animation to start fresh
    if (window.water) {
      window.water.startTime = Date.now();
      window.water.animationDuration = workTime * 1000;
      window.water.waterLevel = window.water.startWaterLevel;
      console.log('Water animation started for', workTime, 'seconds');
      
      // Apply current theme's water color when showing
      if (themes[currentTheme]) {
        const theme = themes[currentTheme];
        if (window.water.mesh) {
          window.water.mesh.fillColor = theme.water;
        }
        if (window.water.path) {
          window.water.path.fillColor = theme.water;
        }
      }
    } else {
      console.log('Water object not found when trying to show water');
    }
  }


  function hideWater() {
    waterCanvas.classList.remove('visible');
    console.log('Water hidden');
  }

  // --- Function to update the timer display with time ---
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // --- Function to update the timer label ---
  function updateLabel() {
    const label = currentType === 'work' ? 'Start' : 'Break';
    timerDisplay.textContent = label;
  }

  // --- Update button icon based on state ---
  function updateSettingsButton() {
    if (!isRunning) {
      settingsBtn.innerHTML = '<span class="material-icons">settings</span>';
    } else if (currentType === 'work') {
      settingsBtn.innerHTML = '<span class="material-icons">pause</span>';
    }
  }


  // --- Function to start a timer (work or break) ---
  function startTimer(type) {
    clearInterval(countdown);   
    currentType = type;
    
    // Determine correct time based on type
    if (type === 'work') {
      timeLeft = workTime;
    } else if (type === 'shortBreak') {
      timeLeft = shortBreakTime;
    } else if (type === 'longBreak') {
      timeLeft = longBreakTime;
    }
    
    updateDisplay();            
    
    console.log('Starting', type, 'timer for', timeLeft, 'seconds. Session:', sessionCount);
    
    // Update background color based on timer type
    document.body.className = type === 'work' ? 'work-mode' : 'break-mode';
    
    // Show/hide water based on timer type
    if (type === 'work') {
      showWater();
    } else {
      hideWater();
    }
    
    // Make sure button shows stop icon and isRunning is true
    startStopBtn.innerHTML = '<span class="material-icons">stop</span>';
    timerContainer.classList.add('running');
    isRunning = true;
    
    countdown = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        // Timer finished - determine next session
        playDingSound();
        console.log(type, 'timer finished. Session count:', sessionCount);
        
        if (type === 'work') {
          // After work session, determine break type
          if (sessionCount === 4) {
            // After 4th work session, take long break
            console.log('Starting long break after session 4');
            startTimer('longBreak');
          } else {
            // After sessions 1, 2, 3, take short break
            console.log('Starting short break after session', sessionCount);
            startTimer('shortBreak');
          }
        } else if (type === 'longBreak') {
          // After long break, reset to session 1
          sessionCount = 1;
          console.log('Long break finished, resetting to session 1');
          startTimer('work');
        } else if (type === 'shortBreak') {
          // After short break, increment session and start work
          sessionCount++;
          console.log('Short break finished, starting session', sessionCount);
          startTimer('work');
        }
      }    
    }, 1000);
    
    updateSettingsButton();
  }
  

  // --- Function to reset timer to initial state ---
  function resetTimer() {
    clearInterval(countdown);           
    isPaused = false;  
  
    currentType = 'work';               
    sessionCount = 1;                   
    timeLeft = workTime;                
    document.body.className = '';       
    timerContainer.classList.remove('running'); 
    
    // Completely reset water animation state
    if (window.water) {
      window.water.isPaused = false;
      window.water.startTime = null;
      window.water.pausedAt = null;
      window.water.waterLevel = window.water.startWaterLevel;
      console.log('Water animation state reset');
    }
    
    hideWater();                        
    updateLabel();                      
    startStopBtn.innerHTML = '<span class="material-icons">play_arrow</span>'; 
    isRunning = false;                  
    console.log('Timer reset - back to session 1');
    
    updateSettingsButton(); 
  }
  

  // --- Function to handle settings/pause button ---
// --- Function to handle settings/pause button ---
// --- Function to handle settings/pause button ---
// Replace your handleSettingsPause function with this:
function handleSettingsPause() {
  if (!isRunning) {
    // Settings mode - open new popup window with external HTML file
    const settingsUrl = `settings.html?workTime=${workTime/60}&shortBreakTime=${shortBreakTime/60}&longBreakTime=${longBreakTime/60}&theme=${currentTheme}`;
    const settingsWindow = window.open(
      settingsUrl, 
      'TimerSettings', 
      'width=300,height=350,resizable=no,scrollbars=no'
    );
  } else if (currentType === 'work') {
    // Work mode - pause/resume logic (same as before)
    if (isPaused) {
      isPaused = false;
      settingsBtn.innerHTML = '<span class="material-icons">pause</span>';
      
      if (window.water) {
        const pausedDuration = Date.now() - window.water.pausedAt;
        window.water.startTime += pausedDuration;
        window.water.isPaused = false;
        waterCanvas.style.pointerEvents = 'all';
      }
      
      countdown = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateDisplay();
        } else {
          playDingSound();
          console.log(currentType, 'timer finished. Session count:', sessionCount);
          
          if (currentType === 'work') {
            if (sessionCount === 4) {
              console.log('Starting long break after session 4');
              startTimer('longBreak');
            } else {
              console.log('Starting short break after session', sessionCount);
              startTimer('shortBreak');
            }
          } else if (currentType === 'longBreak') {
            sessionCount = 1;
            console.log('Long break finished, resetting to session 1');
            startTimer('work');
          } else if (currentType === 'shortBreak') {
            sessionCount++;
            console.log('Short break finished, starting session', sessionCount);
            startTimer('work');
          }
        }
      }, 1000);
    } else {
      isPaused = true;
      clearInterval(countdown);
      settingsBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
      
      if (window.water) {
        window.water.isPaused = true;
        window.water.pausedAt = Date.now();
        waterCanvas.style.pointerEvents = 'none';
      }
    }
  }
}

  // --- Initialize display ---
  updateLabel(); // Show "Work" initially (empty)
  hideWater();   // Water hidden initially
  updateSettingsButton(); // Set initial settings button appearance
  //updateTimerValues(); // Initialize timer values from sliders
  console.log('Timer initialized');

  // --- Button click events ---
  startStopBtn.addEventListener('click', () => {
    if (!isRunning) {
      // Start the timer with current type (initially 'work')
      startTimer(currentType);
    } else {
      // Stop and reset the timer
      resetTimer();
    }
  });

  // --- Play ding sound ---
// --- Play ding sound ---
// --- Play cheerful ding sound ---
function playDingSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a bright two-tone ding
    const playTone = (frequency, startTime, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    // Two-tone bright ding: high note then slightly lower
    const now = audioContext.currentTime;
    playTone(1200, now, 0.3);        // Bright high tone
    playTone(900, now + 0.15, 0.4);  // Slightly lower tone overlapping
    
  } catch (e) {
    console.log('Audio not supported:', e);
  }
}  

settingsBtn.addEventListener('click', handleSettingsPause);

// --- Save and load settings ---
function saveSettingsToStorage() {
  const settings = {
    workTime: workTime,
    shortBreakTime: shortBreakTime,
    longBreakTime: longBreakTime,
    currentTheme: currentTheme
  };
  localStorage.setItem('timerSettings', JSON.stringify(settings));
}

function loadSettingsFromStorage() {
  try {
    const saved = localStorage.getItem('timerSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      workTime = settings.workTime || 25 * 60;
      shortBreakTime = settings.shortBreakTime || 5 * 60;
      longBreakTime = settings.longBreakTime || 15 * 60;
            currentTheme = settings.currentTheme || 'ocean';
      
      // Update timeLeft if not running
      if (!isRunning) {
        timeLeft = currentType === 'work' ? workTime : 
                   currentType === 'shortBreak' ? shortBreakTime : longBreakTime;
      }
      
      console.log('Loaded settings:', settings);
      return true;
    }
  } catch (e) {
    console.log('Error loading settings:', e);
  }
  return false;
}

// Load saved settings or use defaults
if (!loadSettingsFromStorage()) {
  applyTheme('ocean'); // Only apply default if no saved settings
} else {
  applyTheme(currentTheme); // Apply saved theme
}


checkPendingSettings();

});