import { useState, type ReactNode } from "react";
import InvestorLensLayout from "./components/InvestorLens/Sidebar/InvestorLensLayout.jsx";
import "./App.css";

type AppProps = {
  children: ReactNode;
};

export default function App({ children }: AppProps) {
  const [activeItem, setActiveItem] = useState("new-chat");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedDashboardId, setSelectedDashboardId] = useState("client-flows");

  return (
    <InvestorLensLayout
      sidebarProps={{
        activeItem,
        activeSessionId,
        selectedDashboardId,
        onNavigate: (page: string) => setActiveItem(page),
        onNewChat: () => {
          setActiveItem("new-chat");
          setActiveSessionId(null);
        },
        onSelectDashboard: (dashboard: { id: string }) => {
          setSelectedDashboardId(dashboard.id);
          setActiveItem("Dashboard");
        },
        onSelectSession: (session: { id: string }) => {
          setActiveSessionId(session.id);
          setActiveItem("conversation");
        },
        onSettings: () => setActiveItem("settings"),
        onHelp: () => setActiveItem("help"),
        onFeedback: () => setActiveItem("feedback"),
      }}
    >
      {children}
    </InvestorLensLayout>
  );
}
