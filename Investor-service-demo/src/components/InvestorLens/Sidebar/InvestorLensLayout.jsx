import InvestorLensSidebar from "./InvestorLensSidebar.jsx";
import "./InvestorLensLayout.css";

/**
 * Shared application shell: sidebar at the left, page content at the right.
 * Use it around any page component, e.g. Dashboard, ClientProfiles, or Chat.
 */
export default function InvestorLensLayout({
  children,
  sidebarProps = {},
  className = "",
  contentClassName = "",
  contentId,
}) {
  return (
    <div className={`il-app-layout ${className}`.trim()}>
      <InvestorLensSidebar {...sidebarProps} />
      <main
        id={contentId}
        className={`il-app-content ${contentClassName}`.trim()}
      >
        {children}
      </main>
    </div>
  );
}
