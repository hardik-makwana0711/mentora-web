import { useAppTheme } from '@/app/providers/ThemeProvider';
import { Toaster } from 'sonner';

export function ThemeAwareToaster() {
  const { theme } = useAppTheme();
  return <Toaster richColors position="top-center" theme={theme} />;
}
