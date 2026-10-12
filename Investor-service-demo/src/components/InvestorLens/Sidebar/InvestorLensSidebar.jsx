import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileBarChart,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings2,
  Sparkles,
  Sun,
} from "lucide-react";
import "./InvestorLensSidebar.css";

const defaultDashboards = [
  { id: "client-flows", label: "Client Flows" },
  { id: "portfolio-performance", label: "Portfolio Performance" },
  { id: "auc-analysis", label: "AUC Analysis" },
];

const defaultSessions = [
  { id: "s1", title: "Top 5 clients by AUC" },
  { id: "s2", title: "Monthly inflow analysis" },
  { id: "s3", title: "Portfolio performance review" },
  { id: "s4", title: "Client concentration trends" },
  { id: "s5", title: "Compare quarterly outflows" },
  { id: "s6", title: "AUC growth by region" },
  { id: "s7", title: "Underperforming client segments" },
  { id: "s8", title: "Monthly investment summary" },
];

const getTitle = (item) =>
  item?.title ?? item?.name ?? item?.label ?? "Untitled conversation";

export default function InvestorLensSidebar({
  initialCollapsed = false,
  activeItem = "Dashboard",
  activeSessionId = null,
  dashboards = defaultDashboards,
  sessions = defaultSessions,
  selectedDashboardId = "client-flows",
  userName = "Rohidas Potangale",
  theme = "light",
  onThemeChange,
  onNavigate,
  onNewChat,
  onSelectDashboard,
  onSelectSession,
  onSettings,
  onHelp,
  onFeedback,
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [popover, setPopover] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!sidebarRef.current?.contains(event.target)) setPopover(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPopover(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RP";
  const isDark = currentTheme === "dark";

  const navigate = (item) => {
    setPopover(null);
    onNavigate?.(item);
  };

  const selectSession = (session) => {
    onSelectSession?.(session);
    setPopover(null);
  };

  const selectDashboard = (dashboard) => {
    setDashboardOpen(true);
    onSelectDashboard?.(dashboard);
    onNavigate?.("Dashboard");
    setPopover(null);
  };

  const changeTheme = (nextTheme) => {
    if (onThemeChange) {
      onThemeChange(nextTheme);
    } else {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      try {
        localStorage.setItem("investorLensTheme", nextTheme);
      } catch {
        // Ignore unavailable local storage.
      }
    }
    setCurrentTheme(nextTheme);
    setPopover(null);
  };

  const togglePopover = (name) => {
    setPopover((current) => (current === name ? null : name));
  };

  const renderAction = (label, Icon, onClick, selected = false) => (
    <button
      type="button"
      className={`il-nav-button ${selected ? "is-active" : ""}`}
      onClick={onClick}
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      <Icon size={19} aria-hidden="true" />
      {!collapsed && <span className="il-nav-label">{label}</span>}
    </button>
  );

  return (
    <aside
      ref={sidebarRef}
      className={`il-sidebar ${collapsed ? "is-collapsed" : "is-expanded"} ${
        isDark ? "theme-dark" : "theme-light"
      }`}
      aria-label="InvestorLens sidebar"
    >
      <div className="il-sidebar-header">
        <button
          type="button"
          className={`il-brand ${collapsed ? "is-collapsed" : ""}`}
          onClick={() => {
            if (collapsed) setCollapsed(false);
          }}
          aria-label={collapsed ? "Expand sidebar" : "InvestorLens"}
          title={collapsed ? "Expand sidebar" : undefined}
        >
          <span className="il-brand-icon">
            <span className="il-brand-logo" aria-hidden="true">
              <Sparkles size={22} />
            </span>
            <span className="il-brand-toggle" aria-hidden="true">
              <PanelLeftOpen size={21} />
            </span>
          </span>
          {!collapsed && <span className="il-brand-name">InvestorLens</span>}
        </button>

        {!collapsed && (
          <button
            type="button"
            className="il-icon-button il-expanded-toggle"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      <div className="il-primary-actions">
        {renderAction("New chat", Plus, () => {
          setPopover(null);
          onNewChat?.();
        })}

        {/* Search is intentionally removed. Workspace is available only when collapsed. */}
        {collapsed && (
          <div className="il-popover-anchor">
            <button
              type="button"
              className={`il-nav-button il-workspace-trigger ${
                popover === "workspace" ? "is-active" : ""
              }`}
              onClick={() => togglePopover("workspace")}
              aria-label="Workspace navigation"
              aria-haspopup="dialog"
              aria-expanded={popover === "workspace"}
              title="Workspace"
            >
              <LayoutDashboard size={19} aria-hidden="true" />
            </button>

            {popover === "workspace" && (
              <div
                className="il-popover il-workspace-popover"
                role="dialog"
                aria-label="Workspace navigation"
              >
                <div className="il-popover-header">
                  <div>
                    <strong>Workspace</strong>
                    <small>Navigate InvestorLens</small>
                  </div>
                </div>

                <div className="il-workspace-menu">
                  <button
                    type="button"
                    className={`il-menu-button ${activeItem === "Dashboard" ? "is-active" : ""}`}
                    onClick={() => {
                      setDashboardOpen(true);
                      navigate("Dashboard");
                    }}
                  >
                    <LayoutDashboard size={17} aria-hidden="true" />
                    <span>Dashboard</span>
                  </button>

                  {dashboards.map((dashboard) => (
                    <button
                      type="button"
                      key={dashboard.id}
                      className={`il-workspace-subitem ${
                        selectedDashboardId === dashboard.id ? "is-active" : ""
                      }`}
                      onClick={() => selectDashboard(dashboard)}
                      title={dashboard.label}
                    >
                      <span className="il-dashboard-dot" />
                      <span>{dashboard.label}</span>
                    </button>
                  ))}

                  <div className="il-divider" />
                  <button
                    type="button"
                    className={`il-menu-button ${activeItem === "My Insights" ? "is-active" : ""}`}
                    onClick={() => navigate("My Insights")}
                  >
                    <FileBarChart size={17} aria-hidden="true" />
                    <span>My Insights</span>
                  </button>
                  <button
                    type="button"
                    className={`il-menu-button ${activeItem === "Newsletter" ? "is-active" : ""}`}
                    onClick={() => navigate("Newsletter")}
                  >
                    <Mail size={17} aria-hidden="true" />
                    <span>Newsletter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!collapsed && (
        <nav className="il-navigation" aria-label="Main navigation">
          <div className="il-section-label">Workspace</div>

          <button
            type="button"
            className={`il-nav-button ${activeItem === "Dashboard" ? "is-active" : ""}`}
            onClick={() => {
              setDashboardOpen((value) => !value);
              navigate("Dashboard");
            }}
            aria-expanded={dashboardOpen}
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            <span className="il-nav-label">Dashboard</span>
            {dashboardOpen ? (
              <ChevronDown className="il-nav-trailing" size={15} />
            ) : (
              <ChevronRight className="il-nav-trailing" size={15} />
            )}
          </button>

          {dashboardOpen && (
            <div className="il-dashboard-list">
              {dashboards.map((dashboard) => (
                <button
                  type="button"
                  key={dashboard.id}
                  className={`il-dashboard-item ${
                    selectedDashboardId === dashboard.id ? "is-active" : ""
                  }`}
                  onClick={() => selectDashboard(dashboard)}
                >
                  <span className="il-dashboard-dot" />
                  <span>{dashboard.label}</span>
                </button>
              ))}
            </div>
          )}

          {renderAction("My Insights", FileBarChart, () => navigate("My Insights"), activeItem === "My Insights")}
          {renderAction("Newsletter", Mail, () => navigate("Newsletter"), activeItem === "Newsletter")}

          <div className="il-section-label il-recent-label">Recent</div>
          <div className="il-session-list">
            {sessions.map((session) => (
              <button
                type="button"
                key={session.id}
                className={`il-session-button ${activeSessionId === session.id ? "is-active" : ""}`}
                onClick={() => selectSession(session)}
                title={getTitle(session)}
              >
                <MessageSquare size={16} aria-hidden="true" />
                <span>{getTitle(session)}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <div className="il-profile-anchor il-profile-area">
        <button
          type="button"
          className={`il-profile-button ${popover === "profile" ? "is-active" : ""}`}
          onClick={() => togglePopover("profile")}
          aria-label="Open profile menu"
          aria-haspopup="dialog"
          aria-expanded={popover === "profile"}
          title={collapsed ? "Profile" : undefined}
        >
          <span className="il-avatar">{initials}</span>
          {!collapsed && (
            <>
              <span className="il-profile-name">{userName}</span>
              <ChevronDown className="il-profile-chevron" size={16} />
            </>
          )}
        </button>

        {popover === "profile" && (
          <div className="il-popover il-profile-popover" role="dialog" aria-label="Profile menu">
            <div className="il-profile-summary">
              <span className="il-avatar il-avatar-large">{initials}</span>
              <div>
                <strong>{userName}</strong>
                <small>InvestorLens account</small>
              </div>
            </div>
            <div className="il-divider" />
            <div className="il-menu-caption">Appearance</div>
            <button
              type="button"
              className={`il-menu-button ${!isDark ? "is-active" : ""}`}
              onClick={() => changeTheme("light")}
              aria-pressed={!isDark}
            >
              <Sun size={17} aria-hidden="true" />
              <span>Light</span>
              {!isDark && <span className="il-check">✓</span>}
            </button>
            <button
              type="button"
              className={`il-menu-button ${isDark ? "is-active" : ""}`}
              onClick={() => changeTheme("dark")}
              aria-pressed={isDark}
            >
              <Moon size={17} aria-hidden="true" />
              <span>Dark</span>
              {isDark && <span className="il-check">✓</span>}
            </button>
            {(onSettings || onFeedback || onHelp) && <div className="il-divider" />}
            {onSettings && (
              <button
                type="button"
                className="il-menu-button"
                onClick={() => {
                  setPopover(null);
                  onSettings();
                }}
              >
                <Settings2 size={17} aria-hidden="true" />
                <span>Settings</span>
              </button>
            )}
            <button
              type="button"
              className="il-menu-button"
              onClick={() => {
                setPopover(null);
                onFeedback?.();
              }}
            >
              <MessageSquare size={17} aria-hidden="true" />
              <span>Feedback</span>
            </button>
            {onHelp && (
              <button
                type="button"
                className="il-menu-button"
                onClick={() => {
                  setPopover(null);
                  onHelp();
                }}
              >
                <CircleHelp size={17} aria-hidden="true" />
                <span>Help</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
