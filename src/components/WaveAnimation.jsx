import React, { useRef, useEffect, useState } from 'react';

const WaveAnimation = ({ isPlaying = true, speedMultiplier = 1, initialTimeOffset = 0 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(initialTimeOffset);
  const speedRef = useRef(isPlaying ? 1 : 0); // Current speed multiplier (0-1)
  const externalSpeedRef = useRef(speedMultiplier); // External speed control for transitions
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const lastShootingStarTime = useRef(0);
  const transitionRef = useRef(isPlaying ? 0 : 1); // 0 = solid (playing), 1 = lines (paused)
  const swayOffsetRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize stars
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      starsRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height * 0.6,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    }
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Use ref to maintain time across play/pause
    const baseSpeed = 0.015;
    const vibrationAmount = 0.002;

    // Wave configuration
    const waves = [
      { amplitude: 50, frequency: 0.008, speed: 1, color: 'rgba(99, 102, 241, 0.4)', offset: 0 },
      { amplitude: 35, frequency: 0.012, speed: 1.2, color: 'rgba(139, 92, 246, 0.3)', offset: 2 },
      { amplitude: 25, frequency: 0.015, speed: 0.8, color: 'rgba(59, 130, 246, 0.25)', offset: 4 },
      { amplitude: 40, frequency: 0.01, speed: 1.5, color: 'rgba(168, 85, 247, 0.2)', offset: 6 },
    ];

    // Draw stars
    const drawStars = (time) => {
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset);
        const currentOpacity = star.opacity * (0.7 + twinkle * 0.3);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();
      });
    };

    // Create a shooting star
    const createShootingStar = () => {
      const angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.1; // Mostly diagonal
      const speed = Math.random() * 8 + 6;
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 60 + 40,
        opacity: 1,
        life: 1,
      };
    };

    // Draw shooting stars
    const drawShootingStars = () => {
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= 0.015;
        star.opacity = star.life;

        if (star.life <= 0) return false;

        // Draw the tail (gradient line)
        const tailX = star.x - (star.vx / Math.sqrt(star.vx * star.vx + star.vy * star.vy)) * star.length;
        const tailY = star.y - (star.vy / Math.sqrt(star.vx * star.vx + star.vy * star.vy)) * star.length;

        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 180, 100, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw the orange head
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 160, 60, ${star.opacity})`;
        ctx.fill();

        return true;
      });
    };

    // Maybe spawn a shooting star (occasionally)
    const maybeSpawnShootingStar = (currentTime) => {
      if (currentTime - lastShootingStarTime.current > 4000 + Math.random() * 8000) {
        if (Math.random() < 0.3) { // 30% chance when timer triggers
          shootingStarsRef.current.push(createShootingStar());
        }
        lastShootingStarTime.current = currentTime;
      }
    };

    const drawWave = (wave, baseY, time, transition, swayIntensity, waveIndex, currentTime) => {
      const points = [];
      
      // Each wave has its own unique sway with different speed and phase offset
      const individualSwaySpeed = 0.0008 + waveIndex * 0.0003; // Different speeds
      const individualSwayPhase = waveIndex * Math.PI * 0.5; // Different phase offsets
      const individualSwayAmount = 4 + waveIndex * 1.5; // Different amplitudes
      const individualSway = Math.sin(currentTime * individualSwaySpeed + individualSwayPhase) * individualSwayAmount * swayIntensity;
      
      for (let x = 0; x <= canvas.width; x += 2) {
        // Create more organic wave with multiple sine components
        const y = baseY + 
          wave.amplitude * Math.sin(x * wave.frequency + time * wave.speed + wave.offset) +
          wave.amplitude * 0.5 * Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5 + wave.offset) +
          wave.amplitude * 0.25 * Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7 + wave.offset) +
          individualSway; // Each wave has its own unique gentle sway when paused
        
        points.push({ x, y });
      }

      // Draw filled wave (opacity decreases as transition increases)
      const fillOpacity = 1 - transition;
      if (fillOpacity > 0.01) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Create gradient fill with transition opacity
        const baseColor = wave.color.replace(/[\d.]+\)$/, `${parseFloat(wave.color.match(/[\d.]+\)$/)[0]) * fillOpacity})`);
        const gradient = ctx.createLinearGradient(0, baseY - 100, 0, canvas.height);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw line wave (opacity increases as transition increases)
      const lineOpacity = transition;
      if (lineOpacity > 0.01) {
        ctx.beginPath();
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        
        const strokeColor = wave.color.replace(/[\d.]+\)$/, `${(parseFloat(wave.color.match(/[\d.]+\)$/)[0]) + 0.2) * lineOpacity})`);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const draw3DLines = (time, vibration, swayIntensity, currentTime) => {
      const centerY = canvas.height * 0.45;
      const lineCount = 15;
      const spacing = 8;

      for (let i = 0; i < lineCount; i++) {
        const depth = i / lineCount;
        const yOffset = i * spacing;
        const opacity = 0.1 + depth * 0.15;
        const scale = 1 - depth * 0.3;

        // Individual sway for each 3D line - different speed, phase, and amplitude
        const lineSwaySpeed = 0.0006 + i * 0.00015;
        const lineSwayPhase = i * Math.PI * 0.3;
        const lineSwayAmount = 2 + i * 0.5;
        const individualLineSway = Math.sin(currentTime * lineSwaySpeed + lineSwayPhase) * lineSwayAmount * swayIntensity * (1 - depth * 0.5);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
        ctx.lineWidth = 1 + depth;

        for (let x = 0; x <= canvas.width; x += 3) {
          const wave1 = Math.sin(x * 0.008 + time + i * 0.3) * (30 * scale);
          const wave2 = Math.sin(x * 0.012 + time * 1.3 + i * 0.2) * (20 * scale);
          const wave3 = Math.sin(x * 0.005 + time * 0.7 + i * 0.4) * (15 * scale);
          // Much gentler vibration
          const vib = vibration * Math.sin(x * 0.08 + currentTime * 0.003) * 0.3;
          
          const y = centerY + yOffset + wave1 + wave2 + wave3 + vib + individualLineSway;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const drawGlowOrbs = (time) => {
      const orbs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.35, radius: 150, color: 'rgba(99, 102, 241, 0.1)' },
        { x: canvas.width * 0.7, y: canvas.height * 0.4, radius: 200, color: 'rgba(139, 92, 246, 0.08)' },
        { x: canvas.width * 0.5, y: canvas.height * 0.5, radius: 180, color: 'rgba(59, 130, 246, 0.06)' },
      ];

      orbs.forEach((orb, i) => {
        const offsetX = Math.sin(time * 0.5 + i) * 20;
        const offsetY = Math.cos(time * 0.3 + i) * 15;
        
        const gradient = ctx.createRadialGradient(
          orb.x + offsetX, orb.y + offsetY, 0,
          orb.x + offsetX, orb.y + offsetY, orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const animate = () => {
      const currentTime = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars first (background)
      drawStars(timeRef.current);
      
      // Handle shooting stars
      maybeSpawnShootingStar(currentTime);
      drawShootingStars();
      
      // Draw glow orbs
      drawGlowOrbs(timeRef.current);
      
      // Smooth transition between solid and line waves
      // Only transition to lines when actually stopping (low speed), not during fast movement
      const shouldShowLines = !isPlaying && externalSpeedRef.current < 1.2;
      const targetTransition = shouldShowLines ? 1 : 0;
      transitionRef.current += (targetTransition - transitionRef.current) * 0.03; // Smooth easing
      
      // Smooth speed transition (gradual slowdown/speedup)
      // When external speed multiplier is high (during transition), keep base speed at 1
      const targetSpeed = isPlaying || externalSpeedRef.current > 1.2 ? 1 : 0;
      speedRef.current += (targetSpeed - speedRef.current) * 0.025; // Gradual speed change
      
      // Sway intensity increases as speed decreases (for paused state)
      const swayIntensity = 1 - speedRef.current;
      
      // Draw 3D grid lines with reduced vibration and individual sway
      const vibration = (1 - speedRef.current) * 0.5; // Vibration increases as speed decreases
      draw3DLines(timeRef.current, vibration, swayIntensity, currentTime);
      
      // Draw waves from back to front with transition and individual sway
      const baseY = canvas.height * 0.55;
      waves.forEach((wave, index) => {
        drawWave(wave, baseY + index * 30, timeRef.current, transitionRef.current, swayIntensity, index, currentTime);
      });

      // Smoothly transition external speed multiplier (faster response)
      externalSpeedRef.current += (speedMultiplier - externalSpeedRef.current) * 0.06;
      
      // Advance time based on current speed and external multiplier
      timeRef.current += baseSpeed * speedRef.current * externalSpeedRef.current;
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, isPlaying, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default WaveAnimation;
