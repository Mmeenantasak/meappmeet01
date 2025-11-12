
import React from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  confirmText?: string;
  confirmColor?: 'blue' | 'red';
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  onConfirm,
  children,
  confirmText = 'OK',
  confirmColor = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    red: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="text-gray-700 dark:text-gray-300 mb-6">
          {children}
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white ${colorClasses[confirmColor]}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
