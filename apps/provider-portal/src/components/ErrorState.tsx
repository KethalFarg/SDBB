
interface ErrorStateProps {
  message: string;
  retry?: () => void;
}

export function ErrorState({ message, retry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{message}</p>
      {retry && (
        <button className="btn btn-outline" onClick={retry}>
          Try Again
        </button>
      )}
    </div>
  );
}

