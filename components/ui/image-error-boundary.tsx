"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Image Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load content
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              There was an issue loading the images in this section.
            </p>
            {this.props.showErrorDetails && this.state.error && (
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function ImageErrorBoundaryWrapper({
  children,
  fallback,
  showErrorDetails = false,
}: Props) {
  return (
    <ImageErrorBoundary fallback={fallback} showErrorDetails={showErrorDetails}>
      {children}
    </ImageErrorBoundary>
  );
}