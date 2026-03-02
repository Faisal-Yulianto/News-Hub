"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export default function ScrollToTopButton({
  threshold = 400,
  className = "",
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > threshold);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 
      rounded-full bg-primary text-white 
      p-3 shadow-lg transition-all duration-300 
      hover:scale-110 ${className}`}
    >
      <Icon icon="fa6-solid:angles-up" className="w-5 h-5 dark:text-black" />
    </button>
  );
}
