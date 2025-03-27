import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-screen", className)}>
      {children}
    </div>
  );
}

interface LayoutHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutHeader({ children, className }: LayoutHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-50", className)}>
      {children}
    </header>
  );
}

interface LayoutContentProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutContent({ children, className }: LayoutContentProps) {
  return (
    <main className={cn("flex-1", className)}>
      {children}
    </main>
  );
}