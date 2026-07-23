import React, { useState } from 'react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: 'companies' | 'contacts') => {
    try {
      setDownloading(type);
      const response = await fetch(`/api/export/${type}/csv`);
      if (!response.ok) {
        throw new Error(`Failed to export ${type}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadforge_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Export failed for ${type}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        color: '#f8fafc',
        padding: '24px',
        borderRadius: '12px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Export Workspace Data</h2>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '20px' }}>
          Select the data entity you wish to export into CSV format for external processing or backup.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => handleExport('companies')}
            disabled={downloading === 'companies'}
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {downloading === 'companies' ? 'Exporting Companies...' : 'Export Companies CSV'}
          </button>

          <button
            onClick={() => handleExport('contacts')}
            disabled={downloading === 'contacts'}
            style={{
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {downloading === 'contacts' ? 'Exporting Contacts...' : 'Export Contacts CSV'}
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
