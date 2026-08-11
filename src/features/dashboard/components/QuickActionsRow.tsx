import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { webPathForQuickAction } from '@/features/dashboard/lib/quick-action-routes';
import { translateQuickActionLabel } from '@/lib/translate-dashboard';

export type QuickAction = {
  action_id: string;
  action_name: string;
  icon: string;
  target_route: string;
};

export function QuickActionsRow({ roleBase, actions }: { roleBase: string; actions: QuickAction[] }) {
  const navigate = useNavigate();
  if (!actions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="mt-8 flex flex-wrap gap-3"
    >
      {actions.map((a) => (
        <Button
          key={a.action_id}
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate(webPathForQuickAction(roleBase, a.target_route))}
        >
          {translateQuickActionLabel(a.action_id, a.action_name)}
        </Button>
      ))}
    </motion.div>
  );
}
