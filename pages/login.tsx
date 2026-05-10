import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import PhoneInput from '@/components/auth/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import Button from '@/components/ui/Button';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Shield } from 'lucide-react';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  const startTimer = useCallback(() => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOTP = async () => {
    const fullPhone = `+254${phone.replace(/\s/g, '')}`;
    if (fullPhone.length < 13) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      startTimer();
      toast.success('OTP sent successfully');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    const fullPhone = `+254${phone.replace(/\s/g, '')}`;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone, code }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Invalid OTP');
        return;
      }

      const result = await signIn('credentials', {
        phoneNumber: fullPhone,
        sessionToken: data.data.token,
        redirect: false,
      });

      if (result?.error) {
        setError('Authentication failed');
        return;
      }

      toast.success('Welcome to Admin Dashboard');
      router.push('/admin');
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    handleSendOTP();
  };

  return (
    <>
      <Head>
        <title>Admin Login — TrustFiti</title>
        <meta name="description" content="TrustFiti Admin Dashboard Login" />
      </Head>

      <Layout>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-600 mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">TrustFiti Platform Management</p>
            </div>

            {step === 'phone' ? (
              <div className="space-y-6">
                <PhoneInput
                  value={phone}
                  onChange={(v) => { setPhone(v); setError(''); }}
                  error={error}
                />

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSendOTP}
                  loading={loading}
                  disabled={phone.replace(/\s/g, '').length < 9}
                >
                  Send Verification Code
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to <span className="font-medium">+254 {phone}</span>
                  </p>
                </div>

                <OTPInput
                  onComplete={handleVerifyOTP}
                  onResend={handleResend}
                  resendTimer={resendTimer}
                  error={error}
                  disabled={loading}
                />

                <button
                  onClick={() => { setStep('phone'); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400">
                This portal is restricted to authorized administrators only.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
