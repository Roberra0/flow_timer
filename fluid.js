// Water animation loader for timer integration
window.onload = function() {
    console.log('Fluid.js loading...');
    
    const canvas = document.getElementById('fluidCanvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }
    
    console.log('Canvas found, setting up Paper.js...');
    paper.setup(canvas);
    
    // Function to properly resize canvas and water
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        // Update Paper.js view
        paper.view.viewSize.width = width;
        paper.view.viewSize.height = height;
        
        // Resize water if it exists
        if (window.water) {
            console.log('Resizing water to:', width, 'x', height);
            window.water.resize();
        }
        
        paper.view.draw();
    }
    
    console.log('Creating water instance...');
    const water = new Water(60); // 60 points for smooth water surface
    
    // Make water globally accessible for timer control and sliders
    window.water = water;
    console.log('Water instance created and made global');
    
    // Initial resize
    resizeCanvas();
    
    // Set up resize listeners
    window.addEventListener('resize', resizeCanvas);
    paper.view.onResize = resizeCanvas;
    
    // Also check for resize periodically (for extension windows)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    setInterval(() => {
        if (window.innerWidth !== lastWidth || window.innerHeight !== lastHeight) {
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
            console.log('Detected size change, resizing...');
            resizeCanvas();
        }
    }, 100);
    
    paper.view.onFrame = function(event) {
        water.update();
    };
    
    paper.view.onClick = function(event) {
        water.onClick(event);
    };
    
    console.log('Fluid.js setup complete');
};