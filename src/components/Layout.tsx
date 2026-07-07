import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import MessageProphetique from "@/components/MessageProphetique";
import Footer from "@/components/Footer";
import ScrollManager from "@/components/ScrollManager";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollManager />
      <Header />
      <MessageProphetique />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
