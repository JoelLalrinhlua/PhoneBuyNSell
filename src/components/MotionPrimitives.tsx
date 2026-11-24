import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`reveal-base ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

interface AnimatedAedProps {
  amount: number;
  prefix?: string;
  className?: string;
}

export const AnimatedAed: React.FC<AnimatedAedProps> = ({
  amount,
  prefix = '',
  className = '',
}) => {
  const [displayed, setDisplayed] = useState(amount);
  const prevRef = useRef(amount);

  useEffect(() => {
    const startValue = prevRef.current;
    const endValue = amount;
    prevRef.current = amount;

    if (startValue === endValue) return;

    let rafId = 0;
    const duration = 360;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayed(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [amount]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}AED {Math.round(displayed).toLocaleString('en-US')}
    </span>
  );
};
