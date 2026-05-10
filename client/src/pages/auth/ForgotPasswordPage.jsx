import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Connect to real API when ready
    try {
      await new Promise(r => setTimeout(r, 1000));
      setIsSent(true);
      toast.success('Reset link sent to your email.');
    } catch (error) {
      toast.error('Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="flex min-h-screen items-center justify-center py-12">
      <div
        className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-(--app-color-border)/40 backdrop-blur-md"
        style={{ backgroundColor: 'var(--app-color-surface-glass)', boxShadow: 'var(--app-shadow-elevated)' }}
      >
        <div className="p-8 lg:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Link to="/" className="mb-8">
              <img src="/logo.png" alt="TraveLoop" className="h-20 w-20 object-contain" />
            </Link>
            
            {!isSent ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-(--app-color-text)">Forgot Password?</h2>
                <p className="mt-2 text-sm text-(--app-color-text-muted)">
                  No worries, we'll send you reset instructions.
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Send size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-(--app-color-text)">Check your email</h2>
                <p className="mt-2 text-sm text-(--app-color-text-muted)">
                  We've sent a password reset link to <br />
                  <span className="font-bold text-(--app-color-text)">{email}</span>
                </p>
              </>
            )}
          </div>

          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />

              <Button type="submit" fullWidth loading={isSubmitting}>
                Reset Password
              </Button>

              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          ) : (
            <div className="space-y-6">
              <Button fullWidth onClick={() => setIsSent(false)} variant="secondary">
                Try another email
              </Button>
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm font-bold text-(--app-color-text-muted) hover:text-(--app-color-primary) transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
