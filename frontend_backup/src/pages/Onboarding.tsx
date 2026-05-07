import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Stethoscope, MessageSquare, Hospital } from "lucide-react";

const slides = [
  {
    id: 1,
    icon: <Stethoscope className="h-24 w-24 text-white" />,
    title: "مرحباً في طبيب",
    subtitle: "مساعدك الطبي الشخصي للفرز السريع والتوجيه في أي وقت.",
    bg: "bg-primary"
  },
  {
    id: 2,
    icon: <MessageSquare className="h-24 w-24 text-white" />,
    title: "صف أعراضك",
    subtitle: "تحدث مع المساعد الذكي عن الأعراض التي تشعر بها بسهولة وأمان.",
    bg: "bg-[#10B981]"
  },
  {
    id: 3,
    icon: <Hospital className="h-24 w-24 text-white" />,
    title: "إعلام العيادة",
    subtitle: "نقوم بإرسال تقرير حالتك للعيادة لتجهيز الرعاية المناسبة لك.",
    bg: "bg-[#F59E0B]"
  },
];

export default function Onboarding() {
  const [_, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setLocation("/app/discovery");
    }
  };

  const skip = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setLocation("/app/discovery");
  };

  return (
    <div className={`flex h-screen-safe w-full flex-col overflow-hidden relative transition-colors duration-500 ${slides[currentSlide].bg}`}>
      <div className="absolute top-0 left-0 p-4 z-10 w-full flex justify-start">
        <Button variant="ghost" onClick={skip} className="text-white/80 hover:text-white hover:bg-white/10 font-medium min-h-[44px]">
          تخطي
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full"
          >
            <div className="mb-10 rounded-full bg-white/20 p-8">
              {slides[currentSlide].icon}
            </div>
            <h2 className="mb-4 text-4xl font-extrabold text-white tracking-tight">{slides[currentSlide].title}</h2>
            <p className="text-xl text-white/90 leading-relaxed font-medium">
              {slides[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 w-full flex flex-col gap-6 items-center">
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/30"
              }`}
            />
          ))}
        </div>

        <Button 
          size="lg" 
          onClick={nextSlide} 
          className="w-full min-h-[56px] text-lg font-bold rounded-lg bg-white text-foreground hover:bg-gray-100 transition-all duration-200 hover:scale-105"
        >
          {currentSlide === slides.length - 1 ? "ابدأ" : "التالي"}
        </Button>
      </div>
    </div>
  );
}