import type { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  stepKey: string | number;
  direction: number;
  eyebrow?: string;
  question: string;
  hint?: string;
  children: ReactNode;
};

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, y: direction > 0 ? 28 : -28 }),
  center: { opacity: 1, y: 0 },
  exit: (direction: number) => ({ opacity: 0, y: direction > 0 ? -28 : 28 }),
};

const StepQuestion = ({ stepKey, direction, eyebrow, question, hint, children }: Props) => (
  <motion.div
    key={stepKey}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.6 }}
  >
    {eyebrow && <p className="text-sm font-semibold text-primary mb-2">{eyebrow}</p>}
    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{question}</h2>
    {children}
    {hint && <p className="text-sm text-muted-foreground mt-3">{hint}</p>}
  </motion.div>
);

export default StepQuestion;
