import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);

  // Don't render on touch devices (mobile/tablet) — cursor gets stuck at last touch position
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouchDevice) return null;

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const addHover = () => cursor.classList.add('hovering');
    const removeHover = () => cursor.classList.remove('hovering');

    document.addEventListener('mousemove', moveCursor);

    const attachHover = () => {
      const hoverTargets = document.querySelectorAll('a, button, input, select, textarea');
      hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', addHover);
        el.addEventListener('mouseleave', removeHover);
      });
    };

    attachHover();

    return () => {
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor">
      <svg width="20" height="20" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        {/* Face */}
        <circle cx="14" cy="14" r="13" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5" />
        {/* Left eye */}
        <circle cx="10" cy="11" r="2" fill="#fff" />
        {/* Right eye */}
        <circle cx="18" cy="11" r="2" fill="#fff" />
        {/* Smile */}
        <path
          d="M9 17 Q14 22 19 17"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default CustomCursor;
