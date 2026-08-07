'use client';

import React, { useState, useEffect, useRef } from 'react';

const FUN_MESSAGES = [
  'Beep boop! Hello human! 🤖',
  'Following your lead! 🚀',
  'V-TAPP 2026 is gonna be epic! 🔥',
  'Did you check out the events? 🎟️',
  'Robotics & Hackathons await! ⚡',
  'VIT-AP Techfest rules! 🌟',
  'Need help exploring? 🗺️',
  'System operational! ⚙️',
];

export default function CuteRobotCompanion() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [rotation, setRotation] = useState(0);
  const [isHappy, setIsHappy] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const targetRef = useRef({ x: 100, y: 100 });
  const currentRef = useRef({ x: 100, y: 100 });
  const lastMouseTimeRef = useRef(Date.now());
  const idleTargetRef = useRef({ x: 200, y: 200 });

  // Handle Mouse Movement & Idle Detection
  useEffect(() => {
    // Set initial position to right side of viewport on mount
    if (typeof window !== 'undefined') {
      const initX = window.innerWidth - 120;
      const initY = window.innerHeight / 2;
      targetRef.current = { x: initX, y: initY };
      currentRef.current = { x: initX, y: initY };
      setPos({ x: initX, y: initY });
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Keep enough clearance that the robot's hover scale never reaches back
      // under the pointer and intercepts clicks meant for the page.
      targetRef.current = { x: e.clientX + 76, y: e.clientY + 56 };
      lastMouseTimeRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic Blink Animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Main Physics Lerp Loop & Idle Random Wandering
  useEffect(() => {
    let animFrameId: number;

    const updatePhysics = () => {
      const now = Date.now();
      const timeSinceMouse = now - lastMouseTimeRef.current;

      // If no mouse movement for > 2.5 seconds, wander randomly around screen
      if (timeSinceMouse > 2500) {
        if (Math.random() < 0.001) {
          const margin = 100;
          idleTargetRef.current = {
            x: margin + Math.random() * (window.innerWidth - margin * 2),
            y: margin + Math.random() * (window.innerHeight - margin * 2),
          };
        }
        targetRef.current = idleTargetRef.current;
      }

      // Smooth lerp towards target
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;

      currentRef.current.x += dx * 0.08;
      currentRef.current.y += dy * 0.08;

      // Calculate tilt based on horizontal velocity
      const tilt = Math.min(Math.max(dx * 1.2, -22), 22);

      setPos({ x: currentRef.current.x, y: currentRef.current.y });
      setRotation(tilt);

      animFrameId = requestAnimationFrame(updatePhysics);
    };

    animFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleRobotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpinning(true);
    setIsHappy(true);

    const randomMsg = FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];
    setMessage(randomMsg);
    setShowMessage(true);

    setTimeout(() => setIsSpinning(false), 600);
    setTimeout(() => setIsHappy(false), 1500);
    setTimeout(() => setShowMessage(false), 3500);
  };

  return (
    <div
      className="cute-robot-companion fixed z-[9999] pointer-events-none transition-transform duration-75 ease-out select-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {/* Speech / Thought Bubble */}
      {showMessage && (
        <div className="cute-robot-bubble pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-ink-950/95 px-3 py-1.5 font-mono text-[11px] font-semibold text-white backdrop-blur-md animate-bounce">
          {message}
          <div className="cute-robot-bubble-tail absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r bg-ink-950" />
        </div>
      )}

      {/* Robot Body Container (Clickable) */}
      <div
        onClick={handleRobotClick}
        className={`pointer-events-auto relative cursor-pointer transition-transform duration-500 hover:scale-125 ${
          isSpinning ? 'animate-spin' : 'animate-pulse'
        }`}
        title="Click me! 🤖"
      >
        {/* Ambient Thruster Glow & Particles */}
        <div className="cute-robot-thruster absolute -bottom-2 left-1/2 h-4 w-6 -translate-x-1/2 rounded-full blur-sm animate-ping" />
        <div className="absolute -bottom-3 left-1/2 h-2 w-4 -translate-x-1/2 rounded-full bg-amber-400 blur-[2px]" />

        {/* Cute Floating Robot SVG */}
        <svg
          width="54"
          height="54"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cute-robot-svg"
        >
          {/* Antenna */}
          <line x1="32" y1="12" x2="32" y2="4" stroke="var(--robot-accent-bright)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="3" r="3" fill="var(--robot-accent)" className="animate-pulse" />
          <circle cx="32" cy="3" r="5" fill="var(--robot-accent)" opacity="0.4" className="animate-ping" />

          {/* Ears / Head Joints */}
          <rect x="10" y="20" width="4" height="8" rx="2" fill="var(--robot-joint)" />
          <rect x="50" y="20" width="4" height="8" rx="2" fill="var(--robot-joint)" />

          {/* Robot Head Outer Frame */}
          <rect x="13" y="12" width="38" height="26" rx="8" fill="var(--robot-shell)" stroke="var(--robot-accent-bright)" strokeWidth="2" />

          {/* Screen Display Visor */}
          <rect x="16" y="15" width="32" height="20" rx="5" fill="var(--robot-visor)" stroke="var(--robot-visor-border)" strokeWidth="1" />

          {/* Expressive LED Eyes */}
          {isHappy ? (
            /* Happy Arch Eyes (^ ^) */
            <g stroke="var(--robot-eye)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 26 Q25 21 29 26" />
              <path d="M35 26 Q39 21 43 26" />
            </g>
          ) : isBlinking ? (
            /* Blinking Eyes (- -) */
            <g stroke="var(--robot-eye)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="21" y1="24" x2="29" y2="24" />
              <line x1="35" y1="24" x2="43" y2="24" />
            </g>
          ) : (
            /* Normal Glowing Eyes */
            <g>
              <circle cx="24" cy="24" r="3.5" fill="var(--robot-eye)" />
              <circle cx="40" cy="24" r="3.5" fill="var(--robot-eye)" />
              {/* Pupil highlights */}
              <circle cx="25.5" cy="22.5" r="1" fill="#ffffff" />
              <circle cx="41.5" cy="22.5" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Robot Floating Body */}
          <path
            d="M20 40 C20 37, 44 37, 44 40 L40 52 C40 54, 24 54, 24 52 Z"
            fill="var(--robot-body)"
            stroke="var(--robot-accent-bright)"
            strokeWidth="1.5"
          />

          {/* Chest Reactor Pulse Light */}
          <circle cx="32" cy="45" r="3" fill="var(--robot-accent-bright)" className="animate-pulse" />

          {/* Arms */}
          <path d="M16 41 C12 43, 10 48, 14 50" stroke="var(--robot-joint)" strokeWidth="2" strokeLinecap="round" />
          <path d="M48 41 C52 43, 54 48, 50 50" stroke="var(--robot-joint)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
