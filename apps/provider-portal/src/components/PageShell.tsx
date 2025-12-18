import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-titles">
              <h2 className="page-title">{title}</h2>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="page-header-actions">{actions}</div>}
          </div>
        </div>
      </header>
      <div className="page-body">
        <div className="container">
          {children}
        </div>
      </div>
    </div>
  );
}

