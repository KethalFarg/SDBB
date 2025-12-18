
interface StatusPillProps {
  status: string | undefined;
}

export function StatusPill({ status }: StatusPillProps) {
  if (!status) return null;
  
  const s = status.toLowerCase();
  let className = 'status-pill ';
  let label = status.replace('_', ' ');

  // Mapping status to CSS classes
  if (['active', 'scheduled', 'won', 'assigned', 'show'].includes(s)) {
    className += 'status-assigned'; // Using existing green-ish class
  } else if (['pending', 'hold', 'new'].includes(s)) {
    className += 'status-review'; // Using existing yellow-ish class
  } else if (['paused', 'no_show', 'canceled', 'lost', 'designation'].includes(s)) {
    className += 'status-no-coverage'; // Using existing red-ish class
  } else {
    className += 'status-new';
  }

  // Special labels
  if (s === 'hold') label = 'Hold';
  if (s === 'no_show') label = 'No Show';

  return <span className={className}>{label}</span>;
}

