import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import MessageProphetique from "@/components/MessageProphetique";
import Footer from "@/components/Footer";
import ScrollManager from "@/components/ScrollManager";

const Layout = () => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollManager />
      <Header />
      {pathname !== "/" && <MessageProphetique />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
