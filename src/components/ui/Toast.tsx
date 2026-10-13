import { Check, AlertTriangle, Info } from 'lucide-react';
import type { ToastItem } from '../../context/ToastContext';

export default function Toast({ toast }: { toast: ToastItem }) {
  const Icon =
    toast.type === 'success' ? Check : toast.type === 'error' ? AlertTriangle : Info;
  return (
    <div className={`toast toast--${toast.type}`}>
      <Icon size={16} />
      <span>{toast.message}</span>
    </div>
  );
}