// Hybrid water physics with rising animation
class Water {
    constructor(totalPoints) {
        this.totalPoints = totalPoints;
        this.width = paper.view.viewSize.width;
        this.height = paper.view.viewSize.height;
        
        // Rising water animation parameters
        this.startTime = Date.now();
        this.animationDuration = 30000; // 30 seconds in milliseconds
        this.startWaterLevel = this.height * 0.99; // Start at 99% down (very close to bottom)
        this.endWaterLevel = this.height * 0.02;   // End at 2% from top (98% filled - nearly full)
        this.waterLevel = this.startWaterLevel;
        
        console.log('Water starting at:', this.startWaterLevel, 'ending at:', this.endWaterLevel);
        
        // Create water points - extend beyond screen boundaries
        this.points = [];
        this.extensionWidth = this.width * 0.2; // Extend 20% beyond each side
        this.totalWidth = this.width + (this.extensionWidth * 2);
        this.spacing = this.totalWidth / (this.totalPoints - 1);
        
        for (let i = 0; i < this.totalPoints; i++) {
            this.points.push({
                x: (i * this.spacing) - this.extensionWidth, // Start from -extensionWidth
                y: this.waterLevel,
                py: this.waterLevel,
                velocity: 0,
                fixed: false // No fixed points needed since we extend beyond screen
            });
        }
        
        // Physics constants for water behavior (now dynamically controllable)
        this.springForce = 0.018;       // How strongly water pulls back to flat position
        this.damping = 0.985;           // Energy loss over time
        this.spread = 0.025;            // How much neighboring points influence each other
        this.splashForce = 25;          // How strong the initial splash is
        
        // Simple click-based physics switching
        this.lastClickTime = 0;         // When was the last click
        this.springDuration = 3000;     // How long to use spring physics after a click (milliseconds)
        
        // Ambient wave parameters (dynamically controllable)
        this.ambientTime = 0;           
        this.ambientStrength = 10;     // Change from 35 to 10
        this.ambientSpeed = 0.1;       // Change from 0.83 to 0.1
        this.ambientFrequency1 = 0.308; 
        this.ambientFrequency2 = 0.015; 
        
        
        // Dynamic control variables (updated by sliders)
        this.waveResponsiveness = 0.22; // How quickly waves transition to target positions
        this.meshSmoothing = 0.25;      // How much to smooth the mesh
        
        // Create visual mesh
        this.mesh = new paper.Path();
        this.mesh.fillColor = '#2EC4B6'; // Vibrant teal liquid
        this.mesh.onClick = this.onClick.bind(this);
        
        this.updateMesh();
    }
    
    onClick(event) {
        // Record click time for physics switching
        this.lastClickTime = Date.now();
        
        // Find closest point - adjust for extended coordinate system
        const clickX = event.point.x;
        
        // Find the actual closest point by distance
        let closestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < this.totalPoints; i++) {
            const distance = Math.abs(this.points[i].x - clickX);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        // Create splash effect using dynamic values
        const splashRadius = 8;  // Radius in point indices
        
        for (let i = 0; i < this.totalPoints; i++) {
            const distance = Math.abs(i - closestIndex);
            if (distance <= splashRadius) {
                const falloff = Math.exp(-distance * 0.4);
                const force = this.splashForce * falloff * (0.8 + Math.random() * 0.4);
                
                // Apply downward force (negative) for splash effect
                this.points[i].y += force;
                // Add some initial velocity for more dynamic effect
                this.points[i].velocity += force * 0.3;
            }
        }
        
        console.log('Splash at point', closestIndex, 'x:', clickX);
    }
    
    update() {
            // Don't update anything if paused
        if (this.isPaused) {
            this.updateMesh(); // Still update the mesh for visual consistency
            return;
        }

        // Update rising water animation
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1); // 0 to 1 over 30 seconds
        
        // Smoothly interpolate water level from start to end
        const newWaterLevel = this.startWaterLevel + (this.endWaterLevel - this.startWaterLevel) * progress;
        this.waterLevel = newWaterLevel;
        
        // Increment ambient time for wave animation
        this.ambientTime += this.ambientSpeed;
        
        // Simple time-based physics switching: use spring physics for a few seconds after click
        const timeSinceClick = currentTime - this.lastClickTime;
        const useSpringPhysics = timeSinceClick < this.springDuration;
        
        if (useSpringPhysics) {
            // Recent click - use spring-based wave physics
            this.updateSpringPhysics();
        } else {
            // Resting state - show ambient waves
            this.updateAmbientWaves();
        }
        
        this.updateMesh();
    }
    
    updateSpringPhysics() {
        // Step 1: Spring force toward flat water line
        for (let i = 0; i < this.totalPoints; i++) {
            if (!this.points[i].fixed) {
                const displacement = this.waterLevel - this.points[i].y;
                this.points[i].velocity += displacement * this.springForce;
            }
        }
        
        // Step 2: Smoother neighbor interactions (wave spreading)
        for (let i = 1; i < this.totalPoints - 1; i++) {
            if (!this.points[i].fixed) {
                const leftHeight = this.points[i-1].y;
                const rightHeight = this.points[i+1].y;
                const currentHeight = this.points[i].y;
                
                const avgNeighborHeight = (leftHeight + rightHeight) / 2;
                const smoothInfluence = (avgNeighborHeight - currentHeight) * this.spread;
                
                this.points[i].velocity += smoothInfluence;
            }
        }
        
        // Step 3: Apply velocity
        for (let i = 0; i < this.totalPoints; i++) {
            if (!this.points[i].fixed) {
                this.points[i].py = this.points[i].y;
                this.points[i].y += this.points[i].velocity;
                this.points[i].velocity *= this.damping;
            }
        }
    }
    
    updateAmbientWaves() {
        // Create gentle ambient waves across the entire surface
        for (let i = 0; i < this.totalPoints; i++) {
            if (!this.points[i].fixed) {
                // Calculate position along the water surface (0 to 1)
                const normalizedPosition = i / (this.totalPoints - 1);
                
                // Use the original working wave formula
                const wave1 = Math.sin((normalizedPosition * Math.PI * 3) + this.ambientTime);
                const wave2 = Math.sin((normalizedPosition * Math.PI * 5.2) + (this.ambientTime * 1.4));
                const wave3 = Math.sin((normalizedPosition * Math.PI * 1.8) + (this.ambientTime * 0.7));
                
                // Combine waves with different amplitudes
                const combinedWave = (wave1 * 0.5) + (wave2 * 0.3) + (wave3 * 0.2);
                
                // Apply displacement using dynamic responsiveness
                const targetY = this.waterLevel + (combinedWave * this.ambientStrength);
                
                // Use dynamic responsiveness value
                const difference = targetY - this.points[i].y;
                this.points[i].y += difference * this.waveResponsiveness;
                
                // Update velocity for smooth transitions back to spring physics
                this.points[i].velocity = (this.points[i].y - this.points[i].py) * 0.2;
                this.points[i].py = this.points[i].y - this.points[i].velocity;
            }
        }
    }
    
    // Helper method to interpolate water height at screen edges
    getWaterHeightAtX(targetX) {
        // Find the two closest points
        for (let i = 0; i < this.totalPoints - 1; i++) {
            const point1 = this.points[i];
            const point2 = this.points[i + 1];
            
            if (targetX >= point1.x && targetX <= point2.x) {
                // Interpolate between the two points
                const ratio = (targetX - point1.x) / (point2.x - point1.x);
                return point1.y + (point2.y - point1.y) * ratio;
            }
        }
        
        // Fallback to basic water level
        return this.waterLevel;
    }
    
    updateMesh() {
        this.mesh.clear();
        
        // Create a simple filled shape - start from bottom left
        this.mesh.moveTo(0, this.height);
        
        // Go up to water level at left edge - use interpolated water level at screen edge
        const leftWaterY = this.getWaterHeightAtX(0);
        this.mesh.lineTo(0, leftWaterY);
        
        // Follow the water surface, but only for points visible on screen
        for (let i = 0; i < this.totalPoints; i++) {
            const point = this.points[i];
            
            // Only add points that are within or near the screen bounds
            if (point.x >= -this.spacing && point.x <= this.width + this.spacing) {
                this.mesh.lineTo(point.x, point.y);
            }
        }
        
        // End at right edge water level
        const rightWaterY = this.getWaterHeightAtX(this.width);
        this.mesh.lineTo(this.width, rightWaterY);
        
        // Go down to bottom right and close
        this.mesh.lineTo(this.width, this.height);
        this.mesh.closePath();
        
        // Smooth the path using dynamic smoothing value
        this.mesh.smooth({ type: 'catmull-rom', factor: this.meshSmoothing });
    }
    
    resize() {
        const oldHeight = this.height;
        
        this.width = paper.view.viewSize.width;
        this.height = paper.view.viewSize.height;
        
        // Calculate current animation progress
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        // Recalculate water levels for new window size
        this.startWaterLevel = this.height * 0.99; // Start at 99% down (very close to bottom)
        this.endWaterLevel = this.height * 0.02;   // End at 2% from top (nearly full)
        
        // Recalculate current water level based on progress and new window size
        this.waterLevel = this.startWaterLevel + (this.endWaterLevel - this.startWaterLevel) * progress;
        
        console.log('Resize - Progress:', progress.toFixed(2), 'New water level:', this.waterLevel.toFixed(0), 'New height:', this.height);
        
        // Recalculate extended dimensions
        this.extensionWidth = this.width * 0.2;
        this.totalWidth = this.width + (this.extensionWidth * 2);
        this.spacing = this.totalWidth / (this.totalPoints - 1);
        
        // Reset all points with new extended positions
        for (let i = 0; i < this.totalPoints; i++) {
            this.points[i].x = (i * this.spacing) - this.extensionWidth;
            this.points[i].y = this.waterLevel;
            this.points[i].py = this.waterLevel;
            this.points[i].velocity = 0;
        }
        
        this.updateMesh();
    }
}