"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureTextFlipProps {
  features: {
    icon: React.ElementType;
    text: string;
  }[];
  interval?: number;
  className?: string;
}

export function FeatureTextFlip({
  features,
  interval = 3000,
  className,
}: FeatureTextFlipProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [features, interval]);

  const currentFeature = features[currentFeatureIndex];

  return (
    <div
      className={cn(
        "flex items-center gap-4 bg-glass backdrop-blur-xl border border-primary/30 rounded-full px-8 py-4 shadow-glass hover:shadow-glow/20 transition-all duration-300",
        className
      )}
    >
      <motion.div
        key={`icon-${currentFeatureIndex}`}
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 200
        }}
      >
        <currentFeature.icon className="w-6 h-6 text-primary" />
      </motion.div>
      
      <motion.span
        key={`text-${currentFeatureIndex}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-lg font-medium text-text-primary whitespace-nowrap"
      >
        {currentFeature.text.split("").map((letter, index) => (
          <motion.span
            key={`${currentFeatureIndex}-${index}`}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              delay: 0.3 + (index * 0.03),
              duration: 0.2
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </div>
  );
}