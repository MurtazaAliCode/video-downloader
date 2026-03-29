import AdComponent from "./AdComponent";

export function AdBanner() {
  return (
    <div className="w-full bg-muted/30 border-b border-border" data-testid="ad-banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center">
          <AdComponent 
            id="top-banner"
            type="banner"
            placeholderText="Top Horizontal Banner (728x90)"
          />
        </div>
      </div>
    </div>
  );
}

export function AdSidebar() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-lg" data-testid="ad-sidebar">
      <AdComponent 
        id="sidebar-ad"
        type="sidebar"
        placeholderText="Sidebar Vertical Ad (300x250)"
      />
    </div>
  );
}

export function AdInContent() {
  return (
    <div className="my-8 flex justify-center" data-testid="ad-in-content">
      <AdComponent 
        id="content-ad"
        type="native"
        placeholderText="In-Content Native Ad"
      />
    </div>
  );
}
