import React from 'react';

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
  onEmpty?: React.ReactNode;
}

export function DataTable({ headers, children, empty, onEmpty }: DataTableProps) {
  if (empty) {
    return <>{onEmpty}</>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

