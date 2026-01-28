import React, { useMemo } from 'react';

const BackgroundDots = () => {
  // Generate random dots with different colors
  const dots = useMemo(() => {
    const colors = [
      'bg-indigo-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-cyan-500',
      'bg-pink-500',
      'bg-violet-500',
      'bg-fuchsia-500',
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 200 + 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-wave-darker via-wave-dark to-wave-darker" />
      
      {/* Animated dots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`absolute rounded-full ${dot.color} blur-3xl`}
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: dot.opacity,
            animation: `float ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-wave-darker/80 via-transparent to-wave-darker/60" />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default BackgroundDots;
