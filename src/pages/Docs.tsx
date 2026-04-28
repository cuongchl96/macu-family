import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  BookOpen,
  Target,
  PiggyBank,
  Building2,
  TrendingUp,
  Wallet,
  Vault,
  Sparkles,
  LayoutDashboard,
  DollarSign,
  ChevronRight,
  Coins,
  LineChart,
  Bitcoin,
  AlertCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionId =
  | 'introduction'
  | 'flow'
  | 'goals'
  | 'savings'
  | 'salary'
  | 'capital'
  | 'funds'
  | 'realestate'
  | 'investments'
  | 'highlights';

interface TocItem {
  id: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

// ─── Navigation Config ────────────────────────────────────────────────────────

const navGroups: NavGroup[] = [
  {
    label: 'Bắt đầu',
    items: [
      { id: 'introduction', label: 'Giới thiệu', icon: BookOpen },
      { id: 'flow', label: 'Luồng sử dụng', icon: ArrowRight },
    ],
  },
  {
    label: 'Tài sản',
    items: [
      { id: 'savings', label: 'Sổ tiết kiệm', icon: PiggyBank },
      { id: 'realestate', label: 'Bất động sản', icon: Building2 },
      { id: 'investments', label: 'Đầu tư', icon: TrendingUp },
      { id: 'capital', label: 'Nguồn vốn', icon: Wallet },
    ],
  },
  {
    label: 'Kế hoạch',
    items: [
      { id: 'goals', label: 'Mục tiêu', icon: Target },
      { id: 'funds', label: 'Quỹ', icon: Vault },
      { id: 'salary', label: 'Phân bổ lương', icon: DollarSign },
    ],
  },
  {
    label: 'Tổng quan',
    items: [
      { id: 'highlights', label: 'Highlights', icon: Sparkles },
    ],
  },
];

// ─── Content Helpers ──────────────────────────────────────────────────────────

const Heading2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2
    id={id}
    className="mt-10 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight border-b border-border pb-2"
  >
    {children}
  </h2>
);

const Heading3 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h3
    id={id}
    className="mt-6 mb-2 scroll-mt-20 text-base font-semibold tracking-tight"
  >
    {children}
  </h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground leading-7 mb-4">{children}</p>
);

const Callout = ({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip';
  children: React.ReactNode;
}) => {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    tip: 'bg-green-500/10 border-green-500/30 text-green-400',
  };
  const Icon = type === 'warning' ? AlertCircle : Lightbulb;
  return (
    <div className={cn('my-4 flex gap-3 rounded-lg border p-4', styles[type])}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <p className="text-sm leading-6">{children}</p>
    </div>
  );
};

const RelationBox = ({
  left,
  right,
  relation,
}: {
  left: string;
  right: string;
  relation: string;
}) => (
  <div className="my-4 flex items-center justify-center gap-3 rounded-lg border border-border p-4 bg-muted/30">
    <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
      {left}
    </span>
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground">{relation}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
    <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
      {right}
    </span>
  </div>
);

const StepList = ({ steps }: { steps: { title: string; desc: string }[] }) => (
  <ol className="my-4 space-y-3">
    {steps.map((step, i) => (
      <li key={i} className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {i + 1}
        </span>
        <div>
          <p className="text-sm font-medium">{step.title}</p>
          <p className="text-sm text-muted-foreground">{step.desc}</p>
        </div>
      </li>
    ))}
  </ol>
);

// ─── Section Content ──────────────────────────────────────────────────────────

const content: Record<SectionId, { toc: TocItem[]; body: React.ReactNode }> = {
  introduction: {
    toc: [
      { id: 'van-de', label: 'Vấn đề cần giải quyết' },
      { id: 'giai-phap', label: 'Giải pháp' },
      { id: 'pham-vi', label: 'Phạm vi sản phẩm' },
      { id: 'khai-niem', label: 'Các khái niệm cốt lõi' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Bắt đầu</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">MacuFam Wealth Hub</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Công cụ quản trị tài chính hướng mục tiêu cho gia đình — giúp bạn biết tiền đang đi
          đâu và có đủ tiền đúng lúc không.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="van-de">Vấn đề cần giải quyết</Heading2>
        <P>
          Nhiều người có thu nhập ổn định nhưng vẫn thường xuyên rơi vào tình trạng "tháng nào
          tiêu hết tháng đó" hoặc khi cần một khoản lớn lại không đủ. Nguyên nhân thường đến từ
          3 vấn đề:
        </P>
        <ul className="my-4 space-y-3 text-sm text-muted-foreground">
          {[
            {
              title: 'Gửi tiết kiệm không có chủ đích',
              desc: 'Tiền gửi ngân hàng xong không biết khoản đó để làm gì. Đến khi cần thì rút ra dùng bừa, mục tiêu quan trọng hơn lại bị bỏ lỡ.',
            },
            {
              title: 'Không biết dùng tiền dành dụm vào việc gì',
              desc: 'Tiền tiết kiệm hàng tháng cứ tích lũy mà không có kế hoạch rõ ràng — cuối năm nhìn lại vẫn không đạt được mục tiêu nào.',
            },
            {
              title: 'Thiếu kế hoạch tài chính cho cả năm',
              desc: 'Các nghĩa vụ tài chính lớn (đóng tiền nhà, học phí, du lịch...) đến gần mới biết là thiếu tiền, không có thời gian chuẩn bị.',
            },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-border p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-yellow-500" />
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <Heading2 id="giai-phap">Giải pháp</Heading2>
        <P>
          MacuFam Wealth Hub giải quyết các vấn đề trên bằng cách kết nối tất cả các khoản tiết
          kiệm với một mục tiêu cụ thể, đồng thời cho phép lập kế hoạch phân bổ thu nhập tương
          lai trước khi tiền về.
        </P>
        <P>
          Thay vì hỏi "tôi có bao nhiêu tiền?", sản phẩm giúp bạn trả lời được: <br />
          <strong className="text-foreground">
            "Mục tiêu nào của tôi đang thiếu tiền, và tôi cần làm gì để đủ đúng hạn?"
          </strong>
        </P>

        <Heading2 id="pham-vi">Phạm vi sản phẩm</Heading2>
        <Callout type="info">
          MacuFam <strong>không phải</strong> ứng dụng quản lý chi tiêu hàng ngày. Sản phẩm tập
          trung vào quản trị tài chính ở tầng chiến lược: các khoản tiền lớn, mục tiêu trung/dài
          hạn, và kế hoạch tích lũy có chủ đích.
        </Callout>
        <ul className="my-4 space-y-2 text-sm text-muted-foreground list-none">
          {[
            ['✅ Theo dõi', 'sổ tiết kiệm, bất động sản, vàng, chứng khoán, crypto'],
            ['✅ Lập kế hoạch', 'mục tiêu tài chính với deadline và tiến độ'],
            ['✅ Phân bổ', 'thu nhập tương lai vào các mục tiêu'],
            ['❌ Không theo dõi', 'chi tiêu hàng ngày (ăn uống, mua sắm...)'],
            ['❌ Không quản lý', 'ngân sách tháng hay danh mục chi tiêu'],
          ].map(([tag, desc], i) => (
            <li key={i} className="flex gap-2">
              <span className="font-medium text-foreground w-28 shrink-0">{tag}</span>
              <span>{desc}</span>
            </li>
          ))}
        </ul>

        <Heading2 id="khai-niem">Các khái niệm cốt lõi</Heading2>
        <P>Hệ thống xây dựng xung quanh 3 khái niệm chính:</P>
        <div className="my-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Mục tiêu',
              desc: 'Trung tâm của hệ thống. Mọi khoản tiền đều cần có một mục tiêu.',
            },
            {
              icon: PiggyBank,
              title: 'Sổ tiết kiệm',
              desc: 'Nguồn tiền duy nhất để fill mục tiêu. Mỗi sổ chỉ gán cho 1 mục tiêu.',
            },
            {
              icon: DollarSign,
              title: 'Phân bổ lương',
              desc: 'Lập kế hoạch dùng thu nhập tương lai cho các mục tiêu.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="font-semibold text-sm mb-1">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </article>
    ),
  },

  flow: {
    toc: [
      { id: 'luong-tong-quan', label: 'Luồng tổng quan' },
      { id: 'buoc-1', label: 'Bước 1: Khai báo tài sản' },
      { id: 'buoc-2', label: 'Bước 2: Kiểm tra mục tiêu' },
      { id: 'buoc-3', label: 'Bước 3: Lên kế hoạch lương' },
      { id: 'buoc-4', label: 'Bước 4: Theo dõi tiến độ' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Bắt đầu</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Luồng sử dụng gợi ý</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Hướng dẫn từng bước để thiết lập và sử dụng MacuFam hiệu quả ngay từ đầu.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="luong-tong-quan">Luồng tổng quan</Heading2>
        <div className="my-4 space-y-2">
          {[
            { step: 'Khai báo BĐS / Quỹ / Thủ công', arrow: true },
            { step: 'Hệ thống tự tạo Mục tiêu (hoặc bạn tạo thủ công)', arrow: true },
            { step: 'Gán Sổ tiết kiệm vào Mục tiêu tương ứng', arrow: true },
            { step: 'Khai báo thu nhập và Phân bổ vào Mục tiêu', arrow: true },
            { step: 'Dashboard hiển thị mục tiêu nào đủ / thiếu / sắp đến hạn', arrow: false },
          ].map(({ step, arrow }, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-center">
                {step}
              </div>
              {arrow && <ChevronRight className="rotate-90 h-4 w-4 text-muted-foreground my-1" />}
            </div>
          ))}
        </div>

        <Heading2 id="buoc-1">Bước 1: Khai báo tài sản</Heading2>
        <P>
          Bắt đầu bằng cách nhập toàn bộ tài sản hiện có vào hệ thống để có bức tranh tài chính
          đầy đủ.
        </P>
        <StepList
          steps={[
            {
              title: 'Thêm sổ tiết kiệm',
              desc: 'Vào Tiết kiệm → thêm từng sổ với số tiền, ngân hàng, ngày đáo hạn và lãi suất.',
            },
            {
              title: 'Thêm bất động sản',
              desc: 'Vào Bất động sản → thêm từng tài sản kèm lịch thanh toán. Hệ thống tự tạo mục tiêu từ các kỳ thanh toán.',
            },
            {
              title: 'Thêm tài sản đầu tư',
              desc: 'Vào Đầu tư → nhập danh mục vàng, chứng khoán, crypto đang nắm giữ.',
            },
            {
              title: 'Thêm quỹ',
              desc: 'Vào Quỹ → tạo các quỹ có deadline (quỹ khẩn cấp, quỹ du lịch...). Hệ thống tự tạo mục tiêu tương ứng.',
            },
          ]}
        />

        <Heading2 id="buoc-2">Bước 2: Kiểm tra mục tiêu</Heading2>
        <P>
          Sau khi khai báo tài sản, vào <strong className="text-foreground">Kế hoạch lương</strong> để xem
          danh sách mục tiêu đã được tạo tự động. Với các mục tiêu chưa có nguồn (ví dụ: mua xe,
          du học), hãy tạo thủ công với số tiền cần và deadline.
        </P>
        <Callout type="tip">
          Với mỗi mục tiêu, hãy gán ngay ít nhất 1 sổ tiết kiệm tương ứng. Điều này giúp hệ
          thống tính được tiến độ thực tế so với mục tiêu.
        </Callout>

        <Heading2 id="buoc-3">Bước 3: Lên kế hoạch lương</Heading2>
        <P>
          Khai báo thu nhập dự kiến của tháng tới (lương, thưởng, thu nhập khác), sau đó phân
          bổ thử vào từng mục tiêu. Hệ thống sẽ cho thấy:
        </P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Mục tiêu nào sẽ đủ tiền nếu phân bổ theo kế hoạch</li>
          <li>Mục tiêu nào đang thiếu và cần ưu tiên hơn</li>
          <li>Tổng tiền chưa phân bổ còn lại</li>
        </ul>

        <Heading2 id="buoc-4">Bước 4: Theo dõi tiến độ</Heading2>
        <P>
          Sử dụng <strong className="text-foreground">Dashboard</strong> và{' '}
          <strong className="text-foreground">Highlights</strong> để theo dõi hàng tuần/tháng. Khi
          có sổ tiết kiệm đáo hạn hoặc mục tiêu sắp đến hạn, hệ thống sẽ hiển thị cảnh báo để
          bạn kịp thời xử lý.
        </P>
        <Callout type="warning">
          Khi một sổ tiết kiệm đáo hạn, hiện tại bạn cần tự cập nhật lại (edit hoặc xóa và tạo
          sổ mới, gán lại mục tiêu). Tính năng xử lý tự động sẽ được phát triển trong tương lai.
        </Callout>
      </article>
    ),
  },

  goals: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'nguon-tao', label: 'Nguồn tạo mục tiêu' },
      { id: 'tien-do', label: 'Theo dõi tiến độ' },
      { id: 'quan-he', label: 'Quan hệ với sổ tiết kiệm' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Kế hoạch</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Mục tiêu</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Khái niệm trung tâm của toàn bộ hệ thống. Mọi khoản tiền đều cần có một mục tiêu.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Một <strong className="text-foreground">Mục tiêu</strong> là cam kết "cần có{' '}
          <strong className="text-foreground">X tiền</strong> trước ngày{' '}
          <strong className="text-foreground">Y</strong>". Ví dụ:
        </P>
        <ul className="my-4 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Đóng đợt 3 căn hộ Vinhomes — 850 triệu trước 30/9/2025</li>
          <li>Quỹ du lịch Nhật Bản — 80 triệu trước 1/6/2026</li>
          <li>Mua ô tô gia đình — 600 triệu trước 1/1/2027</li>
        </ul>
        <P>
          Khi tiền trong các sổ tiết kiệm được gán vào mục tiêu, hệ thống tự động tính tiến độ
          và cảnh báo khi có nguy cơ không đủ tiền đúng hạn.
        </P>

        <Heading2 id="nguon-tao">Nguồn tạo mục tiêu</Heading2>
        <P>Mục tiêu có thể được tạo từ 3 nguồn:</P>
        <div className="my-4 space-y-3">
          {[
            {
              icon: Building2,
              source: 'Tự động từ Bất động sản',
              desc: 'Khi bạn khai báo một BĐS và nhập lịch thanh toán, hệ thống tự tạo mục tiêu tương ứng cho từng kỳ thanh toán. Đây là loại mục tiêu có deadline cứng nhất — trễ hạn có thể bị phạt hợp đồng.',
              badge: 'Tự động',
            },
            {
              icon: Vault,
              source: 'Tự động từ Quỹ',
              desc: 'Khi bạn tạo một Quỹ mới và đặt deadline, hệ thống tự tạo mục tiêu fill đầy quỹ đó trước ngày định.',
              badge: 'Tự động',
            },
            {
              icon: Target,
              source: 'Tạo thủ công',
              desc: 'Cho các mục tiêu không đến từ BĐS hay Quỹ: mua xe, du học, đám cưới, sửa nhà... Bạn tự nhập số tiền cần và deadline.',
              badge: 'Thủ công',
            },
          ].map(({ icon: Icon, source, desc, badge }, i) => (
            <div key={i} className="rounded-lg border border-border p-4 flex gap-3">
              <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{source}</p>
                  <Badge variant={badge === 'Tự động' ? 'default' : 'secondary'} className="text-xs">
                    {badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Heading2 id="tien-do">Theo dõi tiến độ</Heading2>
        <P>
          Mỗi mục tiêu hiển thị rõ 3 thông số:
        </P>
        <ul className="my-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li><strong className="text-foreground">Đã có</strong>: tổng tiền trong các sổ tiết kiệm được gán vào mục tiêu này</li>
          <li><strong className="text-foreground">Còn thiếu</strong>: khoảng cách đến số tiền cần</li>
          <li><strong className="text-foreground">Thời gian còn lại</strong>: số ngày/tháng đến deadline</li>
        </ul>
        <Callout type="tip">
          Hệ thống cảnh báo khi tốc độ tích lũy hiện tại không đủ để đạt mục tiêu đúng hạn, giúp
          bạn điều chỉnh kế hoạch sớm thay vì phát hiện quá muộn.
        </Callout>

        <Heading2 id="quan-he">Quan hệ với Sổ tiết kiệm</Heading2>
        <P>
          Sổ tiết kiệm là <strong className="text-foreground">nguồn tiền duy nhất</strong> để fill
          mục tiêu. Quan hệ giữa hai bên:
        </P>
        <RelationBox
          left="1 Sổ tiết kiệm"
          relation="chỉ gán cho"
          right="1 Mục tiêu"
        />
        <RelationBox
          left="1 Mục tiêu"
          relation="có thể nhận từ"
          right="Nhiều Sổ TK"
        />
        <P>
          Ví dụ: mục tiêu "Đóng đợt 3 căn hộ 850tr" có thể được fill từ 3 sổ tiết kiệm khác
          nhau ở các ngân hàng khác nhau, mỗi sổ đóng góp một phần.
        </P>
      </article>
    ),
  },

  savings: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'gan-muc-tieu', label: 'Gán vào mục tiêu' },
      { id: 'theo-doi', label: 'Thông tin theo dõi' },
      { id: 'dao-han', label: 'Khi sổ đáo hạn' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Tài sản</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Sổ tiết kiệm</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Nguồn tiền duy nhất để fill mục tiêu. Mỗi sổ đều phải có chủ đích rõ ràng.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Trong MacuFam, mỗi sổ tiết kiệm không chỉ là một con số trong tài khoản ngân hàng —
          nó đại diện cho một phần tiền đang được tích lũy cho một mục tiêu cụ thể. Khi bạn thêm
          một sổ tiết kiệm, hệ thống yêu cầu bạn trả lời: <em>"Sổ này để làm gì?"</em>
        </P>
        <Callout type="info">
          Triết lý của sản phẩm: tiền không có địa chỉ là tiền sẽ biến mất. Bắt buộc gán mục
          tiêu cho mỗi sổ giúp bạn luôn biết tiền đang làm việc gì.
        </Callout>

        <Heading2 id="gan-muc-tieu">Gán vào mục tiêu</Heading2>
        <P>Quy tắc gán:</P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>1 sổ tiết kiệm chỉ được gán cho đúng 1 mục tiêu</li>
          <li>1 mục tiêu có thể nhận tiền từ nhiều sổ tiết kiệm khác nhau</li>
          <li>Không thể có sổ tiết kiệm "tự do" — không gán mục tiêu nào</li>
        </ul>
        <Callout type="tip">
          Nếu bạn có tiền tiết kiệm chưa biết để làm gì, hãy tạo mục tiêu "Dự phòng" hoặc "Chưa
          phân bổ" rồi gán vào đó. Điều này vẫn tốt hơn là để sổ không có địa chỉ.
        </Callout>

        <Heading2 id="theo-doi">Thông tin theo dõi</Heading2>
        <P>Với mỗi sổ tiết kiệm, bạn có thể nhập:</P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Số tiền hiện tại</li>
          <li>Ngân hàng và loại sổ</li>
          <li>Ngày đáo hạn</li>
          <li>Lãi suất (%/năm)</li>
          <li>Mục tiêu được gán</li>
        </ul>

        <Heading2 id="dao-han">Khi sổ đáo hạn</Heading2>
        <P>
          Hiện tại hệ thống chưa tự động xử lý khi sổ tiết kiệm đáo hạn. Khi sổ đến ngày đáo
          hạn và tiền đã về tài khoản, bạn cần thực hiện thủ công:
        </P>
        <StepList
          steps={[
            {
              title: 'Nếu tiền đã được dùng cho mục tiêu',
              desc: 'Xóa sổ tiết kiệm đó và cập nhật tiến độ mục tiêu tương ứng.',
            },
            {
              title: 'Nếu tái tục hoặc chuyển sang sổ mới',
              desc: 'Edit sổ cũ để cập nhật số tiền mới, ngày đáo hạn mới. Mục tiêu gán giữ nguyên.',
            },
            {
              title: 'Nếu chuyển sang mục tiêu khác',
              desc: 'Xóa sổ cũ và tạo sổ mới với mục tiêu mới được gán.',
            },
          ]}
        />
        <Callout type="warning">
          Tính năng tự động nhắc nhở và xử lý sổ đáo hạn đang được phát triển.
        </Callout>
      </article>
    ),
  },

  salary: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'khai-bao-thu-nhap', label: 'Khai báo thu nhập' },
      { id: 'phan-bo', label: 'Phân bổ vào mục tiêu' },
      { id: 'ket-qua', label: 'Đọc kết quả' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Kế hoạch</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Phân bổ lương</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Lập kế hoạch dùng thu nhập tương lai trước khi tiền về — để không bao giờ bị bất ngờ
          khi đến hạn mục tiêu.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Module Phân bổ lương giải quyết câu hỏi: <em>"Tháng tới tôi nhận được bao nhiêu, và
          nên cho vào đâu?"</em>
        </P>
        <P>
          Thay vì đợi tiền về rồi mới quyết định, bạn lập kế hoạch <strong className="text-foreground">trước</strong> — khai báo thu nhập dự kiến và phân bổ vào các mục tiêu. Kết quả là một bản đồ rõ ràng: mục tiêu nào sẽ đủ tiền, mục tiêu nào cần ưu tiên hơn.
        </P>
        <Callout type="info">
          Lương và thưởng <strong>không được tracking như tài sản</strong> trong hệ thống. Chúng
          chỉ tồn tại trong module Phân bổ lương như công cụ lập kế hoạch — sau khi tiền về, bạn
          tự quyết định gửi tiết kiệm hay đầu tư dựa trên kế hoạch đã lập.
        </Callout>

        <Heading2 id="khai-bao-thu-nhap">Khai báo thu nhập</Heading2>
        <P>Bạn có thể khai báo nhiều nguồn thu nhập cho một kỳ lương:</P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Lương cơ bản hàng tháng</li>
          <li>Thưởng dự kiến (KPI, dự án...)</li>
          <li>Thu nhập phụ (freelance, cho thuê...)</li>
          <li>Bất kỳ nguồn tiền nào dự kiến nhận được</li>
        </ul>

        <Heading2 id="phan-bo">Phân bổ vào mục tiêu</Heading2>
        <P>
          Sau khi khai báo tổng thu nhập dự kiến, bạn phân bổ từng khoản cho từng mục tiêu. Ví
          dụ:
        </P>
        <div className="my-4 rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ví dụ phân bổ tháng 6
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: 'Tổng thu nhập dự kiến', value: '40,000,000 ₫', highlight: true },
              { label: '→ Đóng đợt 3 căn hộ (mục tiêu BĐS)', value: '15,000,000 ₫' },
              { label: '→ Quỹ du lịch Nhật 2026', value: '5,000,000 ₫' },
              { label: '→ Mua xe 2027', value: '10,000,000 ₫' },
              { label: 'Chưa phân bổ', value: '10,000,000 ₫', muted: true },
            ].map(({ label, value, highlight, muted }, i) => (
              <div
                key={i}
                className={cn(
                  'flex justify-between text-sm',
                  highlight && 'font-semibold text-foreground border-b border-border pb-2',
                  muted && 'text-muted-foreground'
                )}
              >
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <Heading2 id="ket-qua">Đọc kết quả</Heading2>
        <P>Sau khi phân bổ, hệ thống cho bạn thấy:</P>
        <ul className="my-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Mục tiêu nào sẽ đủ tiền nếu thực hiện theo kế hoạch</li>
          <li>Mục tiêu nào vẫn còn thiếu dù đã phân bổ tối đa</li>
          <li>Tổng tiền chưa phân bổ — nhắc nhở không để tiền "tự do"</li>
        </ul>
        <Callout type="tip">
          Tính năng gợi ý phân bổ thông minh (AI) đang trong roadmap — hệ thống sẽ tự đề xuất
          nên ưu tiên mục tiêu nào dựa trên deadline và khoảng thiếu hụt.
        </Callout>
      </article>
    ),
  },

  capital: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'thanh-phan', label: 'Thành phần tài sản' },
      { id: 'su-dung', label: 'Cách sử dụng' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Tài sản</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Nguồn vốn</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Bức tranh tổng thể về toàn bộ tài sản hiện có — nền tảng để đưa ra quyết định tài
          chính chiến lược.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Module Nguồn vốn tổng hợp <strong className="text-foreground">tất cả tài sản</strong>{' '}
          của bạn vào một nơi để có cái nhìn toàn cảnh. Đây không phải nơi để lập kế hoạch —
          đây là nơi để <em>đánh giá thực trạng</em> và đưa ra quyết định chiến lược.
        </P>
        <P>
          Ví dụ câu hỏi mà Nguồn vốn giúp trả lời: <em>"Tôi có nên bán một phần vàng để gửi
          tiết kiệm cho mục tiêu BĐS sắp đến hạn không?"</em>
        </P>

        <Heading2 id="thanh-phan">Thành phần tài sản</Heading2>
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          {[
            { icon: PiggyBank, title: 'Tiết kiệm', desc: 'Tổng tiền trong các sổ tiết kiệm, phân bổ theo mục tiêu.' },
            { icon: Building2, title: 'Bất động sản', desc: 'Giá trị các tài sản BĐS đang theo dõi.' },
            { icon: Coins, title: 'Vàng', desc: 'Số lượng và giá trị quy đổi của vàng đang nắm giữ.' },
            { icon: LineChart, title: 'Chứng khoán', desc: 'Danh mục cổ phiếu, ETF, trái phiếu.' },
            { icon: Bitcoin, title: 'Crypto', desc: 'Danh mục tài sản số (Bitcoin, Ethereum...).' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
              <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Callout type="info">
          Lương và thưởng không xuất hiện trong Nguồn vốn. Thu nhập chỉ được sử dụng trong module
          Phân bổ lương như công cụ kế hoạch — sau khi thực sự được gửi tiết kiệm hay đầu tư, chúng
          mới hiển thị ở đây.
        </Callout>

        <Heading2 id="su-dung">Cách sử dụng</Heading2>
        <P>
          Xem Nguồn vốn khi bạn cần đánh giá toàn bộ tình hình tài chính, thường là:
        </P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Đầu tháng: tổng kết và lên kế hoạch</li>
          <li>Trước quyết định lớn: mua/bán tài sản, vay vốn</li>
          <li>Cuối năm: đánh giá tổng quan tài chính cả năm</li>
        </ul>
      </article>
    ),
  },

  funds: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'khac-biet', label: 'Khác gì với mục tiêu thủ công?' },
      { id: 'tao-quy', label: 'Tạo quỹ' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Kế hoạch</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Quỹ</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Các khoản tích lũy có chủ đích với deadline rõ ràng — từ quỹ khẩn cấp đến quỹ du lịch.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Quỹ là một dạng mục tiêu tích lũy có cấu trúc, với số tiền cần đạt và deadline được
          định nghĩa rõ. Khi bạn tạo một Quỹ, hệ thống tự động tạo một Mục tiêu tương ứng để
          theo dõi tiến độ fill đầy quỹ đó.
        </P>
        <P>Ví dụ các loại quỹ phổ biến:</P>
        <ul className="my-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Quỹ khẩn cấp — 100 triệu, duy trì liên tục</li>
          <li>Quỹ du lịch Nhật Bản 2026 — 80 triệu trước 1/6/2026</li>
          <li>Quỹ học phí con — 200 triệu trước 9/2027</li>
          <li>Quỹ sửa nhà — 150 triệu trước Tết 2026</li>
        </ul>

        <Heading2 id="khac-biet">Khác gì với mục tiêu thủ công?</Heading2>
        <P>
          Về bản chất, Quỹ và Mục tiêu thủ công đều là "cần X tiền trước ngày Y". Sự khác biệt
          nằm ở chỗ:
        </P>
        <div className="my-4 rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Tiêu chí</th>
                <th className="text-left px-4 py-2 font-medium">Quỹ</th>
                <th className="text-left px-4 py-2 font-medium">Mục tiêu thủ công</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['Nguồn tạo', 'Module Quỹ riêng biệt', 'Module Kế hoạch lương'],
                ['Tính chất', 'Tích lũy dần, fill đầy', 'Khoản cần có tại deadline'],
                ['Ví dụ', 'Quỹ du lịch, quỹ học phí', 'Mua xe, đám cưới'],
              ].map(([criterion, fund, goal], i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2 font-medium text-foreground">{criterion}</td>
                  <td className="px-4 py-2">{fund}</td>
                  <td className="px-4 py-2">{goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading2 id="tao-quy">Tạo quỹ</Heading2>
        <StepList
          steps={[
            { title: 'Đặt tên và mô tả quỹ', desc: 'Ví dụ: "Quỹ du lịch gia đình 2026"' },
            { title: 'Nhập số tiền cần đạt', desc: 'Tổng số tiền cần fill đầy quỹ.' },
            {
              title: 'Đặt deadline',
              desc: 'Ngày cần fill đầy quỹ. Hệ thống tự tính tốc độ tích lũy cần thiết mỗi tháng.',
            },
            {
              title: 'Gán sổ tiết kiệm',
              desc: 'Sau khi tạo quỹ, vào Sổ tiết kiệm và gán các sổ tương ứng vào mục tiêu của quỹ này.',
            },
          ]}
        />
        <Callout type="warning">
          Tính năng deadline và logic tích lũy cho Quỹ đang được tinh chỉnh. Một số hành vi có
          thể thay đổi trong phiên bản tiếp theo.
        </Callout>
      </article>
    ),
  },

  realestate: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'lich-thanh-toan', label: 'Lịch thanh toán' },
      { id: 'muc-tieu-tu-dong', label: 'Mục tiêu tự động' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Tài sản</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Bất động sản</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Theo dõi tài sản BĐS và tự động tạo mục tiêu từ các kỳ thanh toán.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Module BĐS phục vụ những người đang mua nhà/căn hộ theo hình thức thanh toán nhiều đợt
          — một hình thức rất phổ biến tại Việt Nam. Mỗi đợt thanh toán là một deadline tài chính
          cứng: trễ hạn có thể bị phạt hợp đồng hoặc mất cọc.
        </P>

        <Heading2 id="lich-thanh-toan">Lịch thanh toán</Heading2>
        <P>
          Khi thêm một tài sản BĐS, bạn nhập đầy đủ lịch thanh toán theo hợp đồng:
        </P>
        <div className="my-4 rounded-lg border border-border overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ví dụ lịch thanh toán căn hộ
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Đợt</th>
                <th className="text-left px-4 py-2 font-medium">Số tiền</th>
                <th className="text-left px-4 py-2 font-medium">Deadline</th>
                <th className="text-left px-4 py-2 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ['Đợt 1 — Đặt cọc', '200,000,000 ₫', '15/01/2024', '✅ Đã đóng'],
                ['Đợt 2 — Ký HĐMB', '500,000,000 ₫', '30/03/2024', '✅ Đã đóng'],
                ['Đợt 3 — Xây thô', '850,000,000 ₫', '30/09/2025', '⏳ Sắp đến'],
                ['Đợt 4 — Hoàn thiện', '600,000,000 ₫', '15/03/2026', '🔜 Tương lai'],
              ].map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading2 id="muc-tieu-tu-dong">Mục tiêu tự động</Heading2>
        <P>
          Với mỗi đợt thanh toán <strong className="text-foreground">chưa đóng</strong>, hệ thống
          tự động tạo một Mục tiêu tương ứng. Bạn không cần tạo thủ công — chỉ cần vào danh sách
          Mục tiêu và gán sổ tiết kiệm vào.
        </P>
        <Callout type="warning">
          Đây là loại mục tiêu ưu tiên cao nhất. Nên đảm bảo các mục tiêu BĐS luôn được gán đủ
          sổ tiết kiệm và theo dõi tiến độ thường xuyên.
        </Callout>
      </article>
    ),
  },

  investments: {
    toc: [
      { id: 'tong-quan', label: 'Tổng quan' },
      { id: 'vang', label: 'Vàng' },
      { id: 'chung-khoan', label: 'Chứng khoán' },
      { id: 'crypto', label: 'Tiền số (Crypto)' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Tài sản</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Đầu tư</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Theo dõi danh mục vàng, chứng khoán và tiền số — phục vụ đánh giá tổng tài sản.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="tong-quan">Tổng quan</Heading2>
        <P>
          Module Đầu tư không phải công cụ phân tích đầu tư chuyên sâu — mục đích chính là
          tracking để đưa vào bức tranh Nguồn vốn tổng thể. Bạn biết mình đang có bao nhiêu tài
          sản đầu tư để đưa ra quyết định chiến lược (có nên chốt lời để đổ vào mục tiêu BĐS hay
          không?).
        </P>

        <Heading2 id="vang">Vàng</Heading2>
        <P>
          Nhập số lượng vàng đang nắm giữ (tính theo chỉ/lượng hoặc gram), hệ thống hiển thị giá
          trị quy đổi. Phân loại được vàng vật chất và vàng tài khoản.
        </P>

        <Heading2 id="chung-khoan">Chứng khoán</Heading2>
        <P>
          Nhập danh mục cổ phiếu, ETF, trái phiếu đang nắm giữ kèm giá mua vào. Theo dõi tổng
          giá trị danh mục và P&L (lãi/lỗ) tổng quan.
        </P>

        <Heading2 id="crypto">Tiền số (Crypto)</Heading2>
        <P>
          Nhập danh mục crypto (Bitcoin, Ethereum...) kèm số lượng và giá trị. Phục vụ tracking
          tổng tài sản trong Nguồn vốn.
        </P>
        <Callout type="info">
          Giá vàng, chứng khoán, crypto hiện tại được cập nhật thủ công. Tích hợp giá thời gian
          thực đang trong roadmap.
        </Callout>
      </article>
    ),
  },

  highlights: {
    toc: [
      { id: 'khai-niem', label: 'Khái niệm' },
      { id: 'canh-bao', label: 'Các loại cảnh báo' },
      { id: 'tuong-lai', label: 'Tính năng sắp có' },
    ],
    body: (
      <article>
        <Badge className="mb-3">Tổng quan</Badge>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Highlights</h1>
        <p className="mb-6 text-lg text-muted-foreground leading-7">
          Radar cảnh báo những gì quan trọng nhất cần chú ý — để không bỏ lỡ deadline hay cơ hội.
        </p>
        <Separator className="mb-8" />

        <Heading2 id="khai-niem">Khái niệm</Heading2>
        <P>
          Highlights là trang tổng hợp các thông tin quan trọng nổi bật, được tổng hợp tự động
          từ dữ liệu trong toàn bộ hệ thống. Thay vì phải vào từng module để kiểm tra, bạn mở
          Highlights và thấy ngay "những gì cần xử lý hôm nay/tuần này".
        </P>

        <Heading2 id="canh-bao">Các loại cảnh báo</Heading2>
        <div className="my-4 space-y-3">
          {[
            {
              icon: Target,
              title: 'Mục tiêu sắp đến hạn',
              desc: 'Mục tiêu có deadline trong vòng 30-60 ngày tới, hiển thị tiến độ và khoảng còn thiếu.',
            },
            {
              icon: PiggyBank,
              title: 'Sổ tiết kiệm sắp đáo hạn',
              desc: 'Nhắc nhở các sổ tiết kiệm đến ngày đáo hạn để bạn kịp xử lý — tái tục hay rút ra dùng cho mục tiêu.',
            },
            {
              icon: AlertCircle,
              title: 'Mục tiêu thiếu tiền nghiêm trọng',
              desc: 'Mục tiêu có deadline gần nhưng tiến độ fill dưới mức cần thiết — cần ưu tiên phân bổ thêm.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border p-4">
              <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Heading2 id="tuong-lai">Tính năng sắp có</Heading2>
        <P>Highlights đang được mở rộng để tích hợp thêm:</P>
        <ul className="my-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            <strong className="text-foreground">Tin tức tài chính nổi bật</strong> — thị trường,
            lãi suất, tỷ giá
          </li>
          <li>
            <strong className="text-foreground">Ngân hàng vừa tăng/giảm lãi suất</strong> — gợi
            ý tái cơ cấu sổ tiết kiệm
          </li>
          <li>
            <strong className="text-foreground">Gợi ý AI</strong> — phân tích và đề xuất hành
            động dựa trên toàn bộ dữ liệu tài chính của bạn
          </li>
        </ul>
      </article>
    ),
  },
};

// ─── Docs Page ────────────────────────────────────────────────────────────────

const Docs = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('introduction');
  const [activeToc, setActiveToc] = useState('');

  const current = content[activeSection];

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveToc(id);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActiveToc('');
  }, [activeSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveToc(entry.target.id);
        });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-4 px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Về app
          </button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">MacuFam</span>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm text-muted-foreground">Tài liệu</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border p-4">
          <div className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
                        activeSection === id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12 max-w-3xl">
          {current.body}

          {/* Prev / Next */}
          <div className="mt-12 flex gap-3 border-t border-border pt-6">
            {(() => {
              const allSections = navGroups.flatMap((g) => g.items);
              const idx = allSections.findIndex((s) => s.id === activeSection);
              const prev = allSections[idx - 1];
              const next = allSections[idx + 1];
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => setActiveSection(prev.id)}
                      className="flex-1 flex flex-col items-start rounded-lg border border-border p-3 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-xs text-muted-foreground mb-1">← Trước</span>
                      <span className="text-sm font-medium">{prev.label}</span>
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {next ? (
                    <button
                      onClick={() => setActiveSection(next.id)}
                      className="flex-1 flex flex-col items-end rounded-lg border border-border p-3 hover:bg-muted transition-colors text-right"
                    >
                      <span className="text-xs text-muted-foreground mb-1">Tiếp →</span>
                      <span className="text-sm font-medium">{next.label}</span>
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                </>
              );
            })()}
          </div>
        </main>

        {/* Right TOC */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
          {current.toc.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Trên trang này
              </p>
              <div className="space-y-1">
                {current.toc.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => scrollToId(id)}
                    className={cn(
                      'w-full text-left text-sm py-1 transition-colors block',
                      activeToc === id
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Docs;
