import { NavLink, Outlet } from "react-router-dom";
import { LocationStatus } from "./LocationStatus";

const navigation = [
  { label: "home", to: "/", disabled: false },
  { label: "projects", to: "/projects", disabled: false },
  { label: "food", to: "/food", disabled: false },
  { label: "writings (Coming Soon)", to: "/writings", disabled: true },
];

export function Layout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        skip to content
      </a>

      <header className="site-header">
        <div className="identity-block">
          <NavLink className="identity" to="/" aria-label="Michael Suteja, home">
            Michael Suteja
          </NavLink>
          <p>Where I am now: Singapore</p>
          <LocationStatus />
        </div>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) =>
            item.disabled ? (
              <span className="disabled" aria-disabled="true" key={item.to}>
                {item.label}
              </span>
            ) : (
              <NavLink
                end={item.to === "/"}
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "active" : undefined
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
      </header>

      <div id="main-content" className="site-content">
        <Outlet />
      </div>

      <footer className="site-footer">
        <span>Last updated: {__BUILD_DATE__}</span>
      </footer>
    </div>
  );
}
