import { Outlet } from "react-router";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import BusinessAdvisorChat from "@/components/common/BusinessAdvisorChat";

interface MainLayoutProps {
  isLoggedIn?: boolean;
}

export default function MainLayout({ isLoggedIn = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900">
      {/* Sticky Navbar at top */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Main content area (padding-top ensures content isn't covered by sticky navbar) */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer at bottom */}
      <Footer />
      {isLoggedIn && <BusinessAdvisorChat />}
    </div>
  );
}