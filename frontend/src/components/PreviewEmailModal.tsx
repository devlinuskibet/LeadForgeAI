import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PreviewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    subject: string;
    body: string;
    recipients: string[];
    sender: string;
  } | null;
}

export function PreviewEmailModal({ isOpen, onClose, email }: PreviewEmailModalProps) {
  if (!isOpen || !email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4 space-y-3 text-sm">
              <div className="flex">
                <span className="w-16 text-gray-500 font-medium">To:</span>
                <span className="text-gray-900">{email.recipients?.join(", ") || "Unknown"}</span>
              </div>
              <div className="flex">
                <span className="w-16 text-gray-500 font-medium">From:</span>
                <span className="text-gray-900">{email.sender}</span>
              </div>
              <div className="flex">
                <span className="w-16 text-gray-500 font-medium">Subject:</span>
                <span className="text-gray-900 font-medium">{email.subject}</span>
              </div>
            </div>
            
            <div className="px-6 py-6 text-gray-800 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {email.body}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <ExternalLink size={14} /> This is exactly how the recipient will see the email.
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
