import type { ReactNode } from "react";

type AppLayoutProps = {
  /**
   * The Navbar slot — pass a <Navbar … /> element here.
   * Keeping it as a ReactNode lets each page control which
   * variant + props it needs while still having it rendered
   * at the top of every page automatically.
   */
  navbar: ReactNode;
  children: ReactNode;
};

/**
 * Root layout shell.
 *
 * Usage:
 *   <AppLayout navbar={<Navbar variant="lobby" … />}>
 *     <MyPage />
 *   </AppLayout>
 *
 * The layout guarantees:
 *  - Dark chess-themed background on every page.
 *  - Navbar is always sticky at the top.
 *  - Main content grows to fill remaining viewport height.
 */
export default function AppLayout({ navbar, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#312e2b] text-[#c3c1be] flex flex-col font-sans antialiased selection:bg-[#81b64c] selection:text-white">
      {/* Sticky Navbar – rendered once for every page */}
      {navbar}

      {/* Page content fills remaining space */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

