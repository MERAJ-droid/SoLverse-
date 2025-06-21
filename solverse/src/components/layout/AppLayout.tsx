'use client'
import FloatingDockDemo from "@/components/ui/floating-dock-demo";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {children}
      <FloatingDockDemo />
    </div>
  );
}
