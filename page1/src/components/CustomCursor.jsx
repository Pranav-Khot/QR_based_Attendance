import React, { useEffect, useState } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div 
      style={{
        left: `${position.x}px`, top: `${position.y}px`,
        position: 'fixed', width: '25px', height: '25px',
        backgroundColor: 'white', borderRadius: '50%',
        mixBlendMode: 'difference', pointerEvents: 'none',
        zIndex: 10000, transition: 'transform 0.15s ease-out',
        transform: `translate(-50%, -50%) scale(${hovered ? 2.5 : 1})`
      }} 
    />
  );
};
export default CustomCursor;