import { Component, type ErrorInfo, type ReactNode } from 'react';
import { tr } from '@/constants/strings';
import { Button } from '@/components/ui/Button';

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-semibold text-[var(--color-m-text)]">{tr.errorTitle}</p>
          <Button type="button" onClick={() => window.location.reload()}>
            {tr.retry}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
