import { useLocation } from "wouter";
import { MessageSquare, Clock, User } from "lucide-react";

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const tabs = [
    { id: "chat", path: "/app/chat", label: "المحادثة", icon: MessageSquare },
    { id: "queue", path: "/app/queue", label: "الطابور", icon: Clock },
    { id: "profile", path: "/app/profile", label: "الملف", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16">
        {tabs.map((tab) => {
          const isActive = location === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setLocation(tab.path);
              }}
              className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] ${
                isActive ? "text-primary" : "text-muted-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 3 : 2} />
              <span className="text-[11px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}