import { useState } from 'react';
import { Coins, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export const PinLogin = () => {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (value: string) => {
    if (value.length < 8) return;
    setError('');
    setIsLoading(true);
    try {
      await login(value);
    } catch {
      setError('PIN không đúng. Vui lòng thử lại.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setPin(value);
    setError('');
    if (value.length === 8) {
      handleSubmit(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MacuFam</h1>
          <p className="text-muted-foreground text-sm">Quản lý tài sản gia đình</p>
        </div>

        {/* PIN Input */}
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Nhập mã PIN 8 số để đăng nhập</span>
            </div>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={8}
              value={pin}
              onChange={handleChange}
              disabled={isLoading}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={6} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={7} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            disabled={pin.length < 8 || isLoading}
            onClick={() => handleSubmit(pin)}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
          </Button>
        </div>
      </div>
    </div>
  );
};
