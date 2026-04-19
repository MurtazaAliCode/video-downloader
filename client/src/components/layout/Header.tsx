import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import logoUrl from "@/assets/viddownloader-logo-new.png";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer" data-testid="logo-link">
              <img src={logoUrl} alt="VidDownloader Logo" className="w-10 h-10 sm:w-12 sm:h-12 hover:scale-105 transition-transform duration-300 drop-shadow-md" />
              <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                VidDownloader
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid={`nav-link-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Full Toggle */}
            <div className="hidden lg:flex items-center bg-secondary/50 p-1 rounded-full border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => theme === "light" && toggleTheme()}
                className={`rounded-full px-4 py-1 h-8 text-xs font-bold transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5 mr-1.5" />
                DARK
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => theme === "dark" && toggleTheme()}
                className={`rounded-full px-4 py-1 h-8 text-xs font-bold transition-all duration-300 ${
                  theme === "light" 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5 mr-1.5" />
                LIGHT
              </Button>
            </div>

            {/* Mobile Icon-only Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="lg:hidden rounded-lg bg-secondary hover:bg-accent text-foreground w-10 h-10"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg bg-secondary hover:bg-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
