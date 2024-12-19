/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion"; 

interface AnimatedLoadingProps {
    text?: string;
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({text}) => {
  return (
    <div 
      style={{width: "100%", height: "65vh", alignContent: "center", alignItems: "center", display: "flex", justifyContent: "center", flexDirection: "column"}}> 
      <BarLoader />
      <div style={{color: "primary", fontSize: "18px", fontWeight: "bold", marginTop: 2}}>{text}</div>
    </div>
  );
};

const variants = {
  initial: {
    scaleY: 0.5,
    opacity: 0,
  },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 1,
      ease: "circIn",
    },
  },
};

const BarLoader = () => {
  return (
    <motion.div
      transition={{
        staggerChildren: 0.25,
      }}
      initial="initial"
      animate="animate"
      className="flex gap-1"
    >
      <motion.div variants={variants as any} className="h-12 w-2 bg-white" />
      <motion.div variants={variants as any} className="h-12 w-2 bg-white" />
      <motion.div variants={variants as any} className="h-12 w-2 bg-white" />
      <motion.div variants={variants as any} className="h-12 w-2 bg-white" />
      <motion.div variants={variants as any} className="h-12 w-2 bg-white" />
    </motion.div>
  );
};
 