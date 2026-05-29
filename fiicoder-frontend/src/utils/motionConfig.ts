export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// for divs that dont support trasition-all and need transition-colors (those that are janky)
export const hoverTransition = { type: "tween", duration: 0.2, ease: "linear" } as const;

// main page fade + slide
export const pageVariants = prefersReducedMotion()
  ? {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    }
  : {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };

// components loads in cascade
export const staggerConfig = prefersReducedMotion()
  ? { staggerChildren: 0, delayChildren: 0 }
  : { staggerChildren: 0.08, delayChildren: 0.1 };

// vertical slide + fade
export const itemVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0, y: 0 },
      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    };

export const containerVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: staggerConfig },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };

// animatie pentru dropdowns
export const dropdownVariants = prefersReducedMotion()
  ? {
      hidden: { opacity: 0, y: 0 },
      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      exit: { opacity: 0, y: 0, transition: { duration: 0 } },
    }
  : {
      hidden: { opacity: 0, y: -5 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
      exit: { opacity: 0, y: -5, transition: { duration: 0.1 } },
    };