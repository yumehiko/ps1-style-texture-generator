import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 500 
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        className={styles.container}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {visible && (
        <div 
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[position]}`}
          role="tooltip"
          style={{
            position: 'fixed',
            left: position === 'left' ? coords.x - 8 : position === 'right' ? coords.x + 8 : coords.x,
            top: position === 'top' ? coords.y - 8 : position === 'bottom' ? coords.y + 8 : coords.y,
            transform: position === 'top' || position === 'bottom' 
              ? 'translate(-50%, ' + (position === 'top' ? '-100%' : '100%') + ')'
              : 'translate(' + (position === 'left' ? '-100%' : '100%') + ', -50%)'
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};