'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimateSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  from?: 'bottom' | 'left' | 'right' | 'fade';
}

export function AnimateSection({ children, className = '', delay = 0, from = 'bottom' }: AnimateSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('anim-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const baseClass = from === 'bottom'
    ? 'anim-from-bottom'
    : from === 'left'
    ? 'anim-from-left'
    : from === 'right'
    ? 'anim-from-right'
    : 'anim-fade';

  return (
    <div ref={ref} className={`${baseClass} ${className}`}>
      {children}
    </div>
  );
}

// Staggered children wrapper — adds delay per child automatically
export function StaggerChildren({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => child.classList.add('stagger-child'));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('stagger-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`stagger-container ${className}`}>
      {children}
    </div>
  );
}
