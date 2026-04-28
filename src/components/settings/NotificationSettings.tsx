import { useEffect, useState } from 'react';
import { Bell, BellOff, Send, ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface Settings {
  telegram_bot_token: string;
  telegram_chat_id: string;
  enabled: boolean;
  notify_realestate: boolean;
  notify_savings: boolean;
  notify_goals: boolean;
  notify_monthly: boolean;
  days_before_alert: number;
}

const DEFAULT: Settings = {
  telegram_bot_token: '',
  telegram_chat_id: '',
  enabled: true,
  notify_realestate: true,
  notify_savings: true,
  notify_goals: true,
  notify_monthly: true,
  days_before_alert: 7,
};

const TOGGLES: Array<{ key: keyof Settings; label: string; desc: string }> = [
  { key: 'notify_realestate', label: 'Thanh toán BĐS', desc: 'Nhắc khi có đợt đóng tiền BĐS sắp tới' },
  { key: 'notify_savings',    label: 'Sổ tiết kiệm đáo hạn', desc: 'Nhắc khi sổ sắp đến ngày đáo hạn' },
  { key: 'notify_goals',      label: 'Mục tiêu sắp deadline', desc: 'Nhắc khi goal/quỹ gần hạn còn thiếu tiền' },
  { key: 'notify_monthly',    label: 'Tổng kết tháng', desc: 'Gửi báo cáo net worth đầu mỗi tháng' },
];

interface Props { open: boolean; onClose: () => void }

export const NotificationSettings = ({ open, onClose }: Props) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!open || !token) return;
    fetch(`${API_BASE}/notifications/settings`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setSettings({ ...DEFAULT, ...data, telegram_bot_token: data.telegram_bot_token ?? '', telegram_chat_id: data.telegram_chat_id ?? '' }))
      .catch(() => {});
  }, [open, token]);

  const save = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/notifications/settings`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...settings, days_before_alert: Number(settings.days_before_alert) }),
      });
      if (r.ok) { toast.success('Đã lưu cài đặt thông báo'); onClose(); }
      else toast.error('Lưu thất bại');
    } finally { setLoading(false); }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Save first so backend uses latest token/chat_id
      await fetch(`${API_BASE}/notifications/settings`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...settings, days_before_alert: Number(settings.days_before_alert) }),
      });
      const r = await fetch(`${API_BASE}/notifications/test`, { method: 'POST', headers });
      const data = await r.json();
      if (data.ok) toast.success('Gửi thành công! Kiểm tra Telegram của bạn.');
      else toast.error(data.detail ?? 'Kết nối thất bại');
    } catch { toast.error('Không kết nối được backend'); }
    finally { setTesting(false); }
  };

  const triggerNow = async () => {
    setTriggering(true);
    try {
      const r = await fetch(`${API_BASE}/notifications/trigger`, { method: 'POST', headers });
      const data = await r.json();
      if (data.ok) toast.success(data.message);
      else toast.error('Thất bại');
    } catch { toast.error('Không kết nối được backend'); }
    finally { setTriggering(false); }
  };

  const set = (key: keyof Settings, value: Settings[keyof Settings]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const hasCredentials = settings.telegram_bot_token.trim() && settings.telegram_chat_id.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto top-[5%] translate-y-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Cài đặt thông báo Telegram
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Setup guide */}
          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2 text-sm">
            <p className="font-semibold text-sm">Hướng dẫn tạo bot (2 phút)</p>
            <ol className="space-y-1.5 text-muted-foreground list-decimal list-inside">
              <li>
                Mở Telegram, tìm{' '}
                <span className="font-mono bg-muted px-1 rounded text-foreground">@BotFather</span>
                {' '}→ gõ <span className="font-mono bg-muted px-1 rounded text-foreground">/newbot</span>
              </li>
              <li>Đặt tên bot → nhận <strong>Bot Token</strong></li>
              <li>
                Start chat với bot vừa tạo, rồi truy cập:
                <br />
                <span className="font-mono text-xs bg-muted px-1 rounded text-foreground break-all">
                  api.telegram.org/bot&#123;TOKEN&#125;/getUpdates
                </span>
              </li>
              <li>Tìm <span className="font-mono bg-muted px-1 rounded text-foreground">"id"</span> trong mục <span className="font-mono bg-muted px-1 rounded text-foreground">chat</span> → đó là <strong>Chat ID</strong></li>
            </ol>
          </div>

          {/* Credentials */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Bot Token</Label>
              <Input
                type="password"
                placeholder="123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={settings.telegram_bot_token}
                onChange={e => set('telegram_bot_token', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Chat ID</Label>
              <Input
                placeholder="123456789"
                value={settings.telegram_chat_id}
                onChange={e => set('telegram_chat_id', e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={!hasCredentials || testing}
              className="w-full"
            >
              {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Gửi tin nhắn test
            </Button>
          </div>

          {/* Master toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Bật thông báo</p>
              <p className="text-xs text-muted-foreground">Tắt để tạm dừng tất cả thông báo</p>
            </div>
            <Switch checked={settings.enabled} onCheckedChange={v => set('enabled', v)} />
          </div>

          {/* Notification types */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại thông báo</p>
            {TOGGLES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2.5">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={settings[key] as boolean}
                  onCheckedChange={v => set(key, v)}
                  disabled={!settings.enabled}
                />
              </div>
            ))}
          </div>

          {/* Days before */}
          <div className="flex items-center gap-3">
            <Label className="shrink-0">Nhắc trước</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={settings.days_before_alert}
              onChange={e => set('days_before_alert', Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">ngày</span>
          </div>

          {/* Manual trigger */}
          {hasCredentials && (
            <Button
              variant="ghost"
              size="sm"
              onClick={triggerNow}
              disabled={triggering}
              className="w-full text-muted-foreground"
            >
              {triggering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bell className="h-4 w-4 mr-2" />}
              Gửi kiểm tra tất cả thông báo ngay bây giờ
            </Button>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <Button variant="outline" onClick={onClose}>Huỷ</Button>
            <Button onClick={save} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
