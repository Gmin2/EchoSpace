import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
}

export function WordsPullUpMultiStyle({ segments, className = '' }: WordsPullUpMultiStyleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  let wordIndex = 0;

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`}>
      {segments.map((segment, segIdx) => {
        const words = segment.text.split(' ');
        return words.map((word, wIdx) => {
          if (word === '') return null;
          const currentWordIndex = wordIndex++;
          return (
            <motion.div
              key={`${segIdx}-${wIdx}`}
              className="overflow-hidden mr-[0.25em] last:mr-0"
            >
              <motion.span
                className={`inline-block ${segment.className || ''}`}
                initial={{ y: '100%' }}
                animate={isInView ? { y: 0 } : { y: '100%' }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: currentWordIndex * 0.08,
                }}
              >
                {word}
              </motion.span>
            </motion.div>
          );
        });
      })}
    </div>
  );
}
