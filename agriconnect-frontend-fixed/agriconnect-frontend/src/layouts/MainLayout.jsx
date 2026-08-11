import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
