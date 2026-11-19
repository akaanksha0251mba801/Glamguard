import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = error.message || "Something went wrong.";
    try {
      const parsed = JSON.parse(readable) as { error?: string; operationType?: string };
      if (parsed.error) {
        readable = `We could not complete your request (${parsed.operationType || "data"} access). Please try refreshing or signing in again.`;
      }
    } catch {
      // Keep original message
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F9] flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-white border border-[#E8DFE6] rounded-2xl p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-[#38243E] mb-3">
              Something paused unexpectedly
            </h1>
            <p className="text-sm text-[#6B5570] leading-relaxed mb-6">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#E84D79] hover:bg-[#D43B68] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Reload GlamGuard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
