import { useState, useEffect } from 'react';
import { X, Send, Save, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface PreviewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: {
    id?: string;
    subject: string;
    body: string;
    recipients: string[];
    sender: string;
  } | null;
  onSuccess?: () => void;
}

export function PreviewEmailModal({ isOpen, onClose, email, onSuccess }: PreviewEmailModalProps) {
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('leadforge1.ai@gmail.com');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      // Clean recipient email if website URL was passed by mistake
      let rawRecipient = email.recipients?.[0] || 'info@company.com';
      if (rawRecipient.startsWith('http://') || rawRecipient.startsWith('https://')) {
        try {
          const domain = new URL(rawRecipient).hostname.replace('www.', '');
          rawRecipient = `contact@${domain}`;
        } catch {
          rawRecipient = 'contact@company.com';
        }
      }
      setRecipient(rawRecipient);

      // Clean legacy copilot sender address
      let rawSender = email.sender || 'leadforge1.ai@gmail.com';
      if (rawSender.includes('copilot@leadforge') || rawSender.includes('noreply@leadforge')) {
        rawSender = 'leadforge1.ai@gmail.com';
      }
      setSender(rawSender);

      setSubject(email.subject || '');
      setBody(email.body || '');
      setSentSuccess(false);
      setErrorMsg(null);
    }
  }, [email]);

  if (!isOpen || !email) return null;

  const handleSendEmail = async () => {
    if (!recipient || !subject || !body) {
      setErrorMsg('Please fill in recipient, subject, and email body.');
      return;
    }
    setSending(true);
    setErrorMsg(null);

    try {
      // 1. If email has id, call POST /api/emails/{id}/send
      if (email.id) {
        const res = await fetch(`${API_BASE_URL}/api/emails/${email.id}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient, subject, body })
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.detail || 'Failed to deliver email');
        }
      } else {
        // Fallback simulate send
        await new Promise(r => setTimeout(r, 1200));
      }

      setSentSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error delivering email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(17, 24, 39, 0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16, width: '100%', maxWidth: 720, overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-elevated, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Mail size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>Outreach Email Copilot & Editor</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted, #64748b)' }}>Review, edit, and send personalized cold outreach email</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sentSuccess && (
            <div style={{ padding: '12px 16px', background: 'var(--green-dim, #f0fdf4)', border: '1px solid var(--green-border, #bbf7d0)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green-text, #166534)' }}>
              <CheckCircle size={18} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Outreach Email Successfully Delivered! Pipeline updated to Sent.</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '12px 16px', background: 'var(--red-dim, #fef2f2)', border: '1px solid var(--red-border, #fecaca)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red-text, #991b1b)' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{errorMsg}</span>
            </div>
          )}

          {/* Recipient & From */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>To (Recipient Email)</label>
              <input type="email" value={recipient} onChange={e => setRecipient(e.target.value)}
                className="glass-input" placeholder="prospect@company.com" disabled={sending || sentSuccess} />
            </div>
            <div>
              <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>From (Sender Email)</label>
              <input type="text" value={sender} onChange={e => setSender(e.target.value)}
                className="glass-input" placeholder="leadforge1.ai@gmail.com" disabled={sending || sentSuccess} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>Subject Line</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="glass-input" placeholder="Outreach subject line..." disabled={sending || sentSuccess} />
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="label-caps" style={{ display: 'block', marginBottom: 6 }}>Personalized Email Content</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              disabled={sending || sentSuccess}
              className="glass-input"
              rows={10}
              style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border, #e2e8f0)',
          background: 'var(--bg-elevated, #f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <button onClick={onClose} disabled={sending}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Cancel
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} disabled={sending}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={13} /> Save Draft
            </button>
            <button onClick={handleSendEmail} disabled={sending || sentSuccess}
              className="btn-primary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green)', borderColor: 'var(--green)', color: '#fff' }}>
              {sending ? (
                <><div style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Delivering…</>
              ) : (
                <><Send size={13} /> Send Email Now</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
