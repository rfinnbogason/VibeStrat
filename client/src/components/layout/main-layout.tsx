import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <Header />
        <div className="p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
