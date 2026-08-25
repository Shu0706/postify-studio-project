// Framer Motion Animation Variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6 }
};

export const slideUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const slideDown = {
  initial: { opacity: 0, y: -60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const slideLeft = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 60 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const slideRight = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const scaleUp = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
  transition: { duration: 0.6, ease: "backOut" }
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const flipIn = {
  initial: { opacity: 0, rotateY: -90 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: 90 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 5,
      stiffness: 100,
      restDelta: 0.001
    }
  },
  exit: { opacity: 0, scale: 0.3 }
};

export const elasticIn = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 200
    }
  },
  exit: { opacity: 0, scale: 0 }
};

// Container animations for staggered children
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.5 }
};

export const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Hover animations
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  whileTap: { scale: 0.95 }
};

export const hoverLift = {
  whileHover: { 
    y: -8,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  whileTap: { y: 0 }
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
    transition: { duration: 0.2 }
  }
};

export const hoverRotate = {
  whileHover: { 
    rotate: 5,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: -200 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 200 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: "easeOut" }
};

// Loading animations
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Complex animations
export const floatingCard = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const morphing = {
  animate: {
    borderRadius: ["20px", "50px", "20px"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const gradientShift = {
  animate: {
    background: [
      "linear-gradient(45deg, #3b82f6, #8b5cf6)",
      "linear-gradient(45deg, #8b5cf6, #ec4899)",
      "linear-gradient(45deg, #ec4899, #f59e0b)",
      "linear-gradient(45deg, #f59e0b, #3b82f6)"
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Utility function to create custom variants
export const createSlideVariant = (direction, distance = 60) => ({
  initial: { 
    opacity: 0, 
    [direction === 'up' || direction === 'down' ? 'y' : 'x']: 
      direction === 'up' || direction === 'left' ? distance : -distance 
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    y: 0 
  },
  exit: { 
    opacity: 0, 
    [direction === 'up' || direction === 'down' ? 'y' : 'x']: 
      direction === 'up' || direction === 'left' ? distance : -distance 
  },
  transition: { duration: 0.6, ease: "easeOut" }
});

export const createScaleVariant = (scale = 0.8) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale },
  transition: { duration: 0.6, ease: "easeOut" }
});
