import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center h-full w-full py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
    <h3 className="mt-2 text-lg font-semibold text-slate-800">{title}</h3>
    <p className="mt-1 mb-4 text-sm text-slate-500 max-w-sm">{description}</p>
    {action && <div>{action}</div>}
  </div>
);
