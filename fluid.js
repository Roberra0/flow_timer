// Water animation loader for timer integration
window.onload = function() {
    const canvas = document.getElementById('fluidCanvas');
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }
    
    paper.setup(canvas);
    
    const water = new Water(60); // 60 points for smooth water surface
    
    // Make water globally accessible for timer control
    window.water = water;
    
    paper.view.draw();
    
    paper.view.onResize = function(event) {
        water.resize();
    };
    
    paper.view.onFrame = function(event) {
        water.update();
    };
    
    paper.view.onClick = function(event) {
        water.onClick(event);
    };
};