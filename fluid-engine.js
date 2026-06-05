// =================================================================================
// PRIYA SEVA CENTER - MASTER BACKGROUND & FLUID CURRENT ENGINE
// =================================================================================

window.addEventListener('DOMContentLoaded', () => {
    // 1. DYNAMICALLY INJECT THE CANVAS LAYER SO YOU DON'T HAVE TO CODE IT IN HTML
    const canvas = document.createElement('canvas');
    canvas.id = 'nightCanvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    // 2. INITIALIZE COUPLINGS FOR SIMULATING LIQUID VELOCITY CURRENTS
    let gridRows = 20, gridCols = 20;
    let velocityGrid = [];
    for (let r = 0; r < gridRows; r++) {
        velocityGrid[r] = [];
        for (let c = 0; c < gridCols; c++) {
            velocityGrid[r][c] = { x: 0, y: 0 };
        }
    }

    let mouseX = 0, mouseY = 0, lastX = 0, lastY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        let dx = mouseX - lastX;
        let dy = mouseY - lastY;
        
        // Find which cell of the fluid body the mouse is moving through
        let cellX = Math.floor((mouseX / window.innerWidth) * gridCols);
        let cellY = Math.floor((mouseY / window.innerHeight) * gridRows);
        
        if (cellX >= 0 && cellX < gridCols && cellY >= 0 && cellY < gridRows) {
            // Apply moderate velocity to the fluid grid to mimic water displacement
            velocityGrid[cellY][cellX].x += dx * 0.15;
            velocityGrid[cellY][cellX].y += dy * 0.15;
        }
        
        lastX = mouseX;
        lastY = mouseY;

        // Automatically pass tracking data to your HTML form field borders if they exist
        const trackers = document.querySelectorAll('.light-tracker');
        trackers.forEach(el => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // 3. INITIALIZE THE STAR ARRAY WITH SINE-WAVE PULSING & COLOR FIELDS
    let stars = [];
    for(let i = 0; i < 200; i++) {
        let isShifter = Math.random() > 0.65;
        stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            baseX: 0, baseY: 0, // Used to compute smooth current drifting offsets
            size: Math.random() * 1.5 + 0.4,
            driftSpeed: (Math.random() * 0.6) + 0.2, // Drift from right to left
            phase: Math.random() * Math.PI * 2,
            phaseSpeed: (Math.random() * 0.02) + 0.005,
            isShifter: isShifter,
            targetColor: isShifter ? (Math.random() > 0.5 ? {r:160, g:80, b:255} : {r:255, g:50, b:80}) : {r:255, g:255, b:255},
            currentColor: {r:255, g:255, b:255}
        });
    }

    // 4. MAIN ANIMATION FRAME LOOP
    function loop() {
        ctx.fillStyle = '#020614';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Slow down and smooth out the water grid velocities continuously
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                velocityGrid[r][c].x *= 0.95;
                velocityGrid[r][c].y *= 0.95;
            }
        }

        // Render and process the starlight bodies passing through the liquid currents
        stars.forEach(s => {
            // Natural steady drifting from right to left
            s.x -= s.driftSpeed;
            if (s.x < -20) {
                s.x = canvas.width + 20;
                s.y = Math.random() * canvas.height;
            }

            // Interpolate the specific water vector energy operating beneath the star
            let cellX = Math.floor((s.x / window.innerWidth) * gridCols);
            let cellY = Math.floor((s.y / window.innerHeight) * gridRows);
            
            if (cellX >= 0 && cellX < gridCols && cellY >= 0 && cellY < gridRows) {
                let current = velocityGrid[cellY][cellX];
                // Accumulate fluid displacement offsets smoothly
                s.baseX += (current.x - s.baseX) * 0.1;
                s.baseY += (current.y - s.baseY) * 0.1;
            }

            // Apply standard drag friction to the star's local liquid offset position
            s.baseX *= 0.92;
            s.baseY *= 0.92;

            s.phase += s.phaseSpeed;
            let wave = Math.sin(s.phase);
            let alpha = Math.abs(wave);

            // Change colors inside the dark phase smoothly
            if (s.isShifter && alpha < 0.05) {
                if (s.currentColor.r === 255) {
                    s.currentColor = s.targetColor;
                } else {
                    s.currentColor = {r:255, g:255, b:255};
                }
            }

            ctx.save();
            // Render smooth light displacement offset coordinates instead of original positions
            let renderX = s.x + s.baseX;
            let renderY = s.y + s.baseY;

            ctx.fillStyle = `rgba(${s.currentColor.r}, ${s.currentColor.g}, ${s.currentColor.b}, ${alpha})`;
            ctx.shadowBlur = s.size * 6;
            ctx.shadowColor = `rgba(${s.currentColor.r}, ${s.currentColor.g}, ${s.currentColor.b}, ${alpha})`;
            
            ctx.beginPath();
            ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Overlay a faint bioluminescent light wash under the cursor coordinate
        let cursorGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120);
        cursorGlow.addColorStop(0, 'rgba(0, 229, 255, 0.025)');
        cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        requestAnimationFrame(loop);
    }
    loop();
});
