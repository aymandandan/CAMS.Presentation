import { AppRouter } from "./routes";
import AppTheme from "./presentation/theme/AppTheme";
import NotificationsProvider from "./application/hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "./application/hooks/useDialogs/DialogsProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if ((error as any)?.response?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  return (
    <AppTheme>
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <DialogsProvider>
            <AppRouter />
          </DialogsProvider>
        </NotificationsProvider>
      </QueryClientProvider>
    </AppTheme>
  );
}
