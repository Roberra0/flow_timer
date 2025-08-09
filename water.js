// Hybrid water physics with rising animation
class Water {
    constructor(totalPoints) {
        this.totalPoints = totalPoints;
        this.width = paper.view.viewSize.width;
        this.height = paper.view.viewSize.height;
        
        // Rising water animation parameters
        this.startTime = Date.now();
        this.animationDuration = 10000; // 10 seconds in milliseconds
        this.startWaterLevel = this.height * 0.95; // Start at 95% down (visible at bottom)
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
        
        // Physics constants for water behavior (old working settings)
        this.springForce = 0.018;       // How strongly water pulls back to flat position (higher = snappier return)
        this.damping = 0.985;           // Energy loss over time (higher = smoother, less bouncy waves)
        this.spread = 0.025;            // How much neighboring points influence each other (higher = waves travel further)
        this.flatteningThreshold = 1.5; // Energy level below which water switches from spring physics to ambient waves
        
        // Ambient wave parameters (your preferred strong settings)
        this.ambientTime = 0;           // Time tracker for wave animation progression
        this.ambientStrength = 35;     // How visible the natural waves are (pixels of movement) - your preferred strength
        this.ambientSpeed = 0.049;     // How fast the ambient waves move across the surface - your preferred speed
        this.ambientFrequency1 = 0.008; // Primary wave frequency (lower = broader, slower waves)
        this.ambientFrequency2 = 0.015; // Secondary wave frequency (adds complexity and natural variation)
        
        // Create visual mesh
        this.mesh = new paper.Path();
        this.mesh.fillColor = '#3498db';
        this.mesh.onClick = this.onClick.bind(this);
        
        this.updateMesh();
    }
    
    onClick(event) {
        // Find closest point
        const clickX = event.point.x;
        const pointIndex = Math.round((clickX + this.extensionWidth) / this.spacing);
        
        if (pointIndex >= 0 && pointIndex < this.totalPoints) {
            const splashForce = 15;
            const splashRadius = 12;
            
            for (let i = 0; i < this.totalPoints; i++) {
                const distance = Math.abs(i - pointIndex);
                if (distance <= splashRadius) {
                    const falloff = Math.exp(-distance * 0.3);
                    const force = splashForce * falloff * (0.9 + Math.random() * 0.2);
                    
                    if (!this.points[i].fixed) {
                        this.points[i].y += force;
                    }
                }
            }
        }
    }
    
    update() {
        // Update rising water animation
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1); // 0 to 1 over 10 seconds
        
        // Smoothly interpolate water level from start to end
        const newWaterLevel = this.startWaterLevel + (this.endWaterLevel - this.startWaterLevel) * progress;
        this.waterLevel = newWaterLevel;
        
        console.log('Progress:', progress.toFixed(2), 'Water level:', this.waterLevel.toFixed(0));
        
        // Increment ambient time for wave animation
        this.ambientTime += this.ambientSpeed;
        
        // Calculate system energy from USER interactions (works during rising too)
        let userInteractionEnergy = 0;
        
        for (let i = 0; i < this.totalPoints; i++) {
            // Calculate what the ambient wave position should be at current water level
            const normalizedPosition = i / (this.totalPoints - 1);
            const wave1 = Math.sin((normalizedPosition * Math.PI * 3) + this.ambientTime);
            const wave2 = Math.sin((normalizedPosition * Math.PI * 5.2) + (this.ambientTime * 1.4));
            const wave3 = Math.sin((normalizedPosition * Math.PI * 1.8) + (this.ambientTime * 0.7));
            const combinedWave = (wave1 * 0.5) + (wave2 * 0.3) + (wave3 * 0.2);
            const expectedAmbientY = this.waterLevel + (combinedWave * this.ambientStrength);
            
            // Only count energy that's above what ambient waves would naturally create
            const displacement = Math.abs(this.points[i].y - expectedAmbientY);
            const velocity = Math.abs(this.points[i].velocity);
            
            // Only count significant deviations from expected ambient motion
            if (displacement > this.ambientStrength * 0.5 || velocity > 2.0) {
                userInteractionEnergy += displacement + velocity;
            }
        }
        
        // Use spring physics when there's user interaction (works during rising)
        const useSpringPhysics = userInteractionEnergy > this.flatteningThreshold;
        
        // Debug: Force ambient waves for now to test
        const forceAmbient = true;
        
        if (!forceAmbient && useSpringPhysics) {
            // User interaction - use spring-based wave physics
            this.updateSpringPhysics();
        } else {
            // Resting state - show ambient waves (works during rising)
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
                
                // Combine multiple sine waves for natural complexity
                const wave1 = Math.sin((normalizedPosition * Math.PI * 3) + this.ambientTime);
                const wave2 = Math.sin((normalizedPosition * Math.PI * 5.2) + (this.ambientTime * 1.4));
                const wave3 = Math.sin((normalizedPosition * Math.PI * 1.8) + (this.ambientTime * 0.7));
                
                // Combine waves with different amplitudes
                const combinedWave = (wave1 * 0.5) + (wave2 * 0.3) + (wave3 * 0.2);
                
                // Apply noticeable but gentle displacement
                const targetY = this.waterLevel + (combinedWave * this.ambientStrength);
                
                // Smooth transition toward target
                const difference = targetY - this.points[i].y;
                this.points[i].y += difference * 0.05;
                
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
        
        // Smooth the path to remove sharp angles
        this.mesh.smooth({ type: 'catmull-rom', factor: 0.5 });
    }
    
    resize() {
        this.width = paper.view.viewSize.width;
        this.height = paper.view.viewSize.height;
        
        // Don't reset water level during animation
        const currentTime = Date.now();
        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        if (progress >= 1) {
            // Animation complete, can reset to final level
            this.waterLevel = this.height * 0.02; // Nearly at top
        }
        
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