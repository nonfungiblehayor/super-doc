import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout";
import { UserContextProvider } from "./context/user";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <Layout><Home /> </Layout>} />
          <Route path="/chat" element={<Layout> <Chat /> </Layout>} />
          <Route path="/signup" element={<Layout> <Signup /> </Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </UserContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
