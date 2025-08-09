document.addEventListener("DOMContentLoaded", () => {
  // --- Variables ---
  let countdown;                
  let isRunning = false;        
  const workTime = 10;           // 5 seconds for testing
  const breakTime = 60;         // 1 minute in seconds
  let timeLeft;
  let currentType = 'work';     // 'work' or 'break'

  // --- DOM Elements ---
  const timerDisplay = document.getElementById('timer');
  const startStopBtn = document.getElementById('startStopBtn');
  const timerContainer = document.querySelector('.timer-container');
  const waterCanvas = document.getElementById('fluidCanvas');

  // --- Water Animation Control ---
  function showWater() {
    waterCanvas.classList.add('visible');
    // Reset water animation to start fresh
    if (window.water) {
      window.water.startTime = Date.now();
      window.water.animationDuration = workTime * 1000; // Convert to milliseconds
      window.water.waterLevel = window.water.startWaterLevel;
    }
  }

  function hideWater() {
    waterCanvas.classList.remove('visible');
  }

  // --- Function to update the timer display with time ---
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  // --- Function to update the timer label ---
  function updateLabel() {
    const label = currentType === 'work' ? 'Work' : 'Break';
    timerDisplay.textContent = label;
  }

  // --- Function to start a timer (work or break) ---
  function startTimer(type) {
    clearInterval(countdown);   // Clear any existing timer first
    currentType = type;
    timeLeft = type === 'work' ? workTime : breakTime;
    updateDisplay();            // Show the initial time
    
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
    timerContainer.classList.add('running'); // Add class to shift button right
    isRunning = true;
    
    countdown = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        // Timer finished - automatically start the next type
        if (type === 'work') {
          startTimer('break');  // Work finished, start break
        } else {
          startTimer('work');   // Break finished, start work
        }
      }
    }, 1000);
  }

  // --- Function to reset timer to initial state ---
  function resetTimer() {
    clearInterval(countdown);           // Stop the countdown
    currentType = 'work';               // Reset to work type
    timeLeft = workTime;                // Reset to work time
    document.body.className = '';       // Reset background color
    timerContainer.classList.remove('running'); // Remove class to shift button left
    hideWater();                        // Hide water when stopped
    updateLabel();                      // Show "Work" label
    startStopBtn.innerHTML = '<span class="material-icons">play_arrow</span>'; // Button back to play icon
    isRunning = false;                  // Update running state
  }

  // --- Initialize display ---
  updateLabel(); // Show "Work" initially
  hideWater();   // Water hidden initially

  // --- Button click event ---
  startStopBtn.addEventListener('click', () => {
    if (!isRunning) {
      // Start the timer with current type (initially 'work')
      startTimer(currentType);
    } else {
      // Stop and reset the timer
      resetTimer();
    }
  });
});