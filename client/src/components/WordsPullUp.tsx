import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export function WordsPullUp({ text, className = '', showAsterisk = false, style }: WordsPullUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const words = text.split(' ');

  return (
    <div ref={ref} className={`flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLastWord = i === words.length - 1;
        return (
          <motion.div
            key={i}
            className="overflow-hidden mr-[0.25em] last:mr-0"
          >
            <motion.span
              className="inline-block relative"
              initial={{ y: '100%' }}
              animate={isInView ? { y: 0 } : { y: '100%' }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
            >
              {word}
              {isLastWord && showAsterisk && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
              )}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
