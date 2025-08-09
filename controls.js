// Wave controls script - separate file for CSP compliance
document.addEventListener('DOMContentLoaded', function() {
    console.log('Controls script loaded');
    
    // Wait for water to be available
    function setupControls() {
      // Ambient wave controls
      const strengthSlider = document.getElementById('strengthSlider');
      const speedSlider = document.getElementById('speedSlider');
      const responseSlider = document.getElementById('responseSlider');
      const smoothSlider = document.getElementById('smoothSlider');
      
      // Spring physics controls
      const splashSlider = document.getElementById('splashSlider');
      const springSlider = document.getElementById('springSlider');
      const dampingSlider = document.getElementById('dampingSlider');
      const spreadSlider = document.getElementById('spreadSlider');
      const durationSlider = document.getElementById('durationSlider');
      
      // Value displays
      const strengthValue = document.getElementById('strengthValue');
      const speedValue = document.getElementById('speedValue');
      const responseValue = document.getElementById('responseValue');
      const smoothValue = document.getElementById('smoothValue');
      const splashValue = document.getElementById('splashValue');
      const springValue = document.getElementById('springValue');
      const dampingValue = document.getElementById('dampingValue');
      const spreadValue = document.getElementById('spreadValue');
      const durationValue = document.getElementById('durationValue');
      
      const toggleButton = document.getElementById('toggleControls');
      const resizeButton = document.getElementById('resizeWater');
      const controlsPanel = document.getElementById('waveControls');
      
      if (!strengthSlider || !window.water) {
        console.log('Waiting for water or sliders... Water exists:', !!window.water);
        setTimeout(setupControls, 200);
        return;
      }
      
      console.log('Setting up controls, water found:', !!window.water);
      
      function updateWaves() {
        if (window.water) {
          // Update ambient wave parameters
          window.water.ambientStrength = parseFloat(strengthSlider.value);
          window.water.ambientSpeed = parseFloat(speedSlider.value);
          window.water.waveResponsiveness = parseFloat(responseSlider.value);
          window.water.meshSmoothing = parseFloat(smoothSlider.value);
          
          // Update spring physics parameters
          window.water.splashForce = parseFloat(splashSlider.value);
          window.water.springForce = parseFloat(springSlider.value);
          window.water.damping = parseFloat(dampingSlider.value);
          window.water.spread = parseFloat(spreadSlider.value);
          window.water.springDuration = parseFloat(durationSlider.value) * 1000; // Convert to milliseconds
          
          // Update display values
          strengthValue.textContent = strengthSlider.value;
          speedValue.textContent = speedSlider.value;  
          responseValue.textContent = responseSlider.value;
          smoothValue.textContent = smoothSlider.value;
          splashValue.textContent = splashSlider.value;
          springValue.textContent = springSlider.value;
          dampingValue.textContent = dampingSlider.value;
          spreadValue.textContent = spreadSlider.value;
          durationValue.textContent = durationSlider.value;
          
          console.log('Updated water params:', {
            // Ambient
            strength: window.water.ambientStrength,
            speed: window.water.ambientSpeed,
            responsiveness: window.water.waveResponsiveness,
            smoothing: window.water.meshSmoothing,
            // Spring
            splash: window.water.splashForce,
            spring: window.water.springForce,
            damping: window.water.damping,
            spread: window.water.spread,
            duration: window.water.springDuration
          });
        } else {
          console.log('Water not available for updates');
        }
      }
      
      // Add event listeners for all sliders
      strengthSlider.addEventListener('input', updateWaves);
      speedSlider.addEventListener('input', updateWaves);
      responseSlider.addEventListener('input', updateWaves);
      smoothSlider.addEventListener('input', updateWaves);
      splashSlider.addEventListener('input', updateWaves);
      springSlider.addEventListener('input', updateWaves);
      dampingSlider.addEventListener('input', updateWaves);
      spreadSlider.addEventListener('input', updateWaves);
      durationSlider.addEventListener('input', updateWaves);
      
      // Toggle functionality
      let hidden = false;
      toggleButton.addEventListener('click', function() {
        hidden = !hidden;
        if (hidden) {
          // Hide all controls except the button
          const controls = controlsPanel.querySelectorAll('div');
          controls.forEach(div => div.style.display = 'none');
          toggleButton.textContent = 'Show Controls';
          controlsPanel.style.minWidth = 'auto';
        } else {
          // Show all controls
          const controls = controlsPanel.querySelectorAll('div');
          controls.forEach(div => div.style.display = 'block');
          toggleButton.textContent = 'Hide Controls';
          controlsPanel.style.minWidth = '220px';
        }
      });
      
      // Force resize functionality
      resizeButton.addEventListener('click', function() {
        console.log('Manual resize triggered');
        if (window.resizeCanvas) {
          window.resizeCanvas();
          console.log('Resize function called');
        } else {
          console.log('Resize function not available');
        }
      });
      
      // Hover effects
      toggleButton.addEventListener('mouseenter', function() {
        this.style.background = '#2980b9';
      });
      toggleButton.addEventListener('mouseleave', function() {
        this.style.background = '#3498db';
      });
      
      resizeButton.addEventListener('mouseenter', function() {
        this.style.background = '#e67e22';
      });
      resizeButton.addEventListener('mouseleave', function() {
        this.style.background = '#f39c12';
      });
      
      updateWaves(); // Initialize
      console.log('Controls setup complete');
    }
    
    setupControls();
  });