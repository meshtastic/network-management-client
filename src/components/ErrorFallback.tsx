interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  return (
    <div className="text-center">
      <h2>Something went wrong!</h2>
      <p>{error.toString()}</p>
    </div>
  );
};
