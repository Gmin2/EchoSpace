import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const chars = text.split('');

  return (
    <p ref={containerRef} className={`flex flex-wrap ${className}`}>
      {chars.map((char, i) => {
        const charProgress = i / chars.length;
        const opacity = useTransform(
          scrollYProgress,
          [charProgress - 0.1, charProgress + 0.05],
          [0.2, 1]
        );

        return (
          <motion.span key={i} style={{ opacity }}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </p>
  );
}
