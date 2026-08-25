import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              The application encountered an error. Please refresh the page or contact support if the problem persists.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-600 font-semibold mb-2">Technical Details</summary>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                <p className="text-red-600 font-mono mb-2">
                  {this.state.error && this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;