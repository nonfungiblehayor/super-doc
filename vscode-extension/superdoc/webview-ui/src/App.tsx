import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat/[id]";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout";
import { UserContextProvider } from "./context/user";
import { SessionContextProvider } from "./context/session";
import ToastProvider from "./context/toast";
import Otp from "./pages/Otp";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <ToastProvider />
      <Sonner />
      <UserContextProvider>
      <SessionContextProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={ <Layout><Home /> </Layout>} />
          <Route path="/chat/:id" element={<Layout> <Chat /> </Layout>} />
          <Route path="/signup" element={<Layout> <Signup /> </Layout>} />
           <Route path="/confirm-otp" element={<Layout> <Otp /> </Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
      </SessionContextProvider>
      </UserContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
