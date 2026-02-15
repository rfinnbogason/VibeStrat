import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { TrialWarningBanner } from "./trial-warning-banner";

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

        {/* Trial Warning Banner */}
        <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6">
          <TrialWarningBanner />
        </div>

        <div className="p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
