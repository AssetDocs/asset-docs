import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface AccountTabErrorBoundaryProps {
  /** Changing this key resets the boundary (e.g. the active tab). */
  resetKey?: string;
  children: React.ReactNode;
}

interface AccountTabErrorBoundaryState {
  error: Error | null;
}

/**
 * Scoped error boundary for account dashboard sections.
 *
 * Without this, any render-time error inside a tab unmounts the whole app and
 * leaves a fully blank screen with no message. This keeps the failure visible
 * and recoverable without touching any business logic.
 */
class AccountTabErrorBoundary extends React.Component<
  AccountTabErrorBoundaryProps,
  AccountTabErrorBoundaryState
> {
  state: AccountTabErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AccountTabErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AccountTabErrorBoundary] Section crashed:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps: AccountTabErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-semibold text-foreground">This section could not be displayed.</p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto break-words">
              {error.message || 'An unexpected error occurred while loading this section.'}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={this.reset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Try again
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default AccountTabErrorBoundary;
