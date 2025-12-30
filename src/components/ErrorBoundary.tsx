import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                        <h2 className="font-semibold text-red-800">{this.state.error?.toString()}</h2>
                    </div>
                    <details className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-xs font-mono overflow-auto max-h-96">
                        {this.state.errorInfo?.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
