import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(
    error: Error,
  ): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo,
  ) {
    console.error(
      "Application error:",
      error,
      info.componentStack,
    );
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      error: null,
    });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-lg font-semibold">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              The application encountered an
              unexpected error.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Try Again
              </button>
            </div>

            {import.meta.env.DEV && (
              <details className="mt-5">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  Error details
                </summary>

                <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}