// src/components/ConfirmDialog.tsx
import React from 'react';

type Props = {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({ open, title='Confirm', children, onClose, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm text-gray-700 mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}
