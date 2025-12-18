/**
 * Landing Page Block System
 * Định nghĩa tất cả các block types cho landing page builder
 */

// ============ BLOCK TYPES ============

export type BlockCategory =
  | 'hero'        // Hero sections
  | 'features'    // Features/Services
  | 'content'     // Text content, about
  | 'testimonial' // Reviews, testimonials
  | 'pricing'     // Pricing tables
  | 'cta'         // Call to action
  | 'gallery'     // Image galleries
  | 'stats'       // Statistics, counters
  | 'team'        // Team members
  | 'faq'         // FAQ accordion
  | 'contact'     // Contact forms
  | 'footer';     // Footer sections

export type BlockVariant = string;

// ============ BLOCK DATA INTERFACES ============

export interface BaseBlockData {
  id: string;
  type: BlockCategory;
  variant: BlockVariant;
  settings: BlockSettings;
}

export interface BlockSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: string;
  textColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  animation?: string;
  customClass?: string;
  // Visual effects
  bgEffect?: string;      // bg-animated-gradient, bg-mesh-gradient, bg-aurora, etc.
  hoverEffect?: string;   // hover-lift, hover-glow, hover-scale, hover-rotate, etc.
  cardEffect?: string;    // card-glass, card-3d, card-floating, etc.
  fullHeight?: boolean;   // Make section full viewport height
}

// Hero Block
export interface HeroBlockData extends BaseBlockData {
  type: 'hero';
  variant: 'centered' | 'left-aligned' | 'split' | 'video' | 'slider' | 'minimal' | 'gradient' | 'parallax';
  content: {
    title: string;
    subtitle?: string;
    description?: string;
    primaryButton?: { text: string; url: string };
    secondaryButton?: { text: string; url: string };
    image?: string;
    videoUrl?: string;
    badges?: string[];
  };
}

// Features Block
export interface FeaturesBlockData extends BaseBlockData {
  type: 'features';
  variant: 'grid-3' | 'grid-4' | 'list' | 'cards' | 'icons' | 'zigzag' | 'tabs' | 'carousel';
  content: {
    title?: string;
    subtitle?: string;
    items: Array<{
      icon?: string;
      image?: string;
      title: string;
      description: string;
      link?: string;
    }>;
  };
}

// Content Block
export interface ContentBlockData extends BaseBlockData {
  type: 'content';
  variant: 'text-only' | 'text-image-left' | 'text-image-right' | 'two-columns' | 'three-columns' | 'markdown';
  content: {
    title?: string;
    subtitle?: string;
    body: string; // Markdown or HTML
    image?: string;
    images?: string[];
  };
}

// Testimonial Block
export interface TestimonialBlockData extends BaseBlockData {
  type: 'testimonial';
  variant: 'single' | 'carousel' | 'grid' | 'masonry' | 'quotes' | 'cards';
  content: {
    title?: string;
    items: Array<{
      quote: string;
      author: string;
      role?: string;
      company?: string;
      avatar?: string;
      rating?: number;
    }>;
  };
}

// Pricing Block
export interface PricingBlockData extends BaseBlockData {
  type: 'pricing';
  variant: 'simple' | 'cards' | 'comparison' | 'toggle' | 'horizontal';
  content: {
    title?: string;
    subtitle?: string;
    billingToggle?: boolean; // monthly/yearly toggle
    plans: Array<{
      name: string;
      price: string;
      priceYearly?: string;
      description?: string;
      features: string[];
      highlighted?: boolean;
      buttonText: string;
      buttonUrl: string;
    }>;
  };
}

// CTA Block
export interface CTABlockData extends BaseBlockData {
  type: 'cta';
  variant: 'simple' | 'split' | 'banner' | 'floating' | 'newsletter' | 'download';
  content: {
    title: string;
    description?: string;
    buttonText: string;
    buttonUrl: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    image?: string;
    inputPlaceholder?: string; // for newsletter
  };
}

// Gallery Block
export interface GalleryBlockData extends BaseBlockData {
  type: 'gallery';
  variant: 'grid' | 'masonry' | 'carousel' | 'lightbox' | 'slider' | 'mosaic';
  content: {
    title?: string;
    images: Array<{
      url: string;
      alt?: string;
      caption?: string;
      link?: string;
    }>;
  };
}

// Stats Block
export interface StatsBlockData extends BaseBlockData {
  type: 'stats';
  variant: 'simple' | 'cards' | 'icons' | 'counters' | 'progress';
  content: {
    title?: string;
    items: Array<{
      value: string;
      label: string;
      icon?: string;
      prefix?: string;
      suffix?: string;
    }>;
  };
}

// Team Block
export interface TeamBlockData extends BaseBlockData {
  type: 'team';
  variant: 'grid' | 'cards' | 'carousel' | 'list';
  content: {
    title?: string;
    subtitle?: string;
    members: Array<{
      name: string;
      role: string;
      image?: string;
      bio?: string;
      social?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
      };
    }>;
  };
}

// FAQ Block
export interface FAQBlockData extends BaseBlockData {
  type: 'faq';
  variant: 'accordion' | 'two-columns' | 'tabs' | 'searchable';
  content: {
    title?: string;
    subtitle?: string;
    items: Array<{
      question: string;
      answer: string;
      category?: string;
    }>;
  };
}

// Contact Block
export interface ContactBlockData extends BaseBlockData {
  type: 'contact';
  variant: 'simple' | 'split' | 'with-map' | 'minimal';
  content: {
    title?: string;
    subtitle?: string;
    email?: string;
    phone?: string;
    address?: string;
    mapUrl?: string;
    formFields?: Array<{
      name: string;
      type: 'text' | 'email' | 'textarea' | 'select';
      label: string;
      required?: boolean;
      options?: string[]; // for select
    }>;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
}

// Footer Block
export interface FooterBlockData extends BaseBlockData {
  type: 'footer';
  variant: 'simple' | 'multi-column' | 'minimal' | 'centered';
  content: {
    logo?: string;
    description?: string;
    copyright?: string;
    columns?: Array<{
      title: string;
      links: Array<{ text: string; url: string }>;
    }>;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
}

// Union type for all blocks
export type LandingBlock =
  | HeroBlockData
  | FeaturesBlockData
  | ContentBlockData
  | TestimonialBlockData
  | PricingBlockData
  | CTABlockData
  | GalleryBlockData
  | StatsBlockData
  | TeamBlockData
  | FAQBlockData
  | ContactBlockData
  | FooterBlockData;

// ============ BLOCK DEFINITIONS ============

export interface BlockDefinition {
  type: BlockCategory;
  variant: string;
  name: string;
  description: string;
  icon: string; // Ant Design Icon name (e.g., 'AimOutlined', 'RocketOutlined')
  thumbnail: string; // gradient or image
  defaultData: Partial<LandingBlock>;
}

export const blockDefinitions: BlockDefinition[] = [
  // ========== HERO BLOCKS ==========
  {
    type: 'hero',
    variant: 'centered',
    name: 'Hero Centered',
    description: 'Tiêu đề căn giữa với CTA buttons',
    icon: 'AimOutlined',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    defaultData: {
      content: {
        title: 'Tiêu đề chính của bạn',
        subtitle: 'Mô tả ngắn gọn về sản phẩm hoặc dịch vụ',
        primaryButton: { text: 'Bắt đầu ngay', url: '#' },
        secondaryButton: { text: 'Tìm hiểu thêm', url: '#' },
      },
      settings: { padding: 'xlarge', animation: 'fadeInUp' },
    },
  },
  {
    type: 'hero',
    variant: 'split',
    name: 'Hero Split',
    description: 'Chia đôi: text bên trái, ảnh bên phải',
    icon: 'LayoutOutlined',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    defaultData: {
      content: {
        title: 'Giải pháp hoàn hảo cho bạn',
        description: 'Mô tả chi tiết về lợi ích và tính năng nổi bật',
        primaryButton: { text: 'Dùng thử miễn phí', url: '#' },
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'hero',
    variant: 'gradient',
    name: 'Hero Gradient',
    description: 'Background gradient đẹp mắt',
    icon: 'BgColorsOutlined',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    defaultData: {
      content: {
        title: 'Khám phá điều tuyệt vời',
        subtitle: 'Trải nghiệm độc đáo chỉ có tại đây',
        primaryButton: { text: 'Khám phá ngay', url: '#' },
        badges: ['Miễn phí', 'Không cần thẻ'],
      },
      settings: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff',
        padding: 'xlarge',
      },
    },
  },
  {
    type: 'hero',
    variant: 'minimal',
    name: 'Hero Minimal',
    description: 'Tối giản, typography đẹp',
    icon: 'HighlightOutlined',
    thumbnail: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    defaultData: {
      content: {
        title: 'Less is More',
        subtitle: 'Đơn giản nhưng hiệu quả',
      },
      settings: { padding: 'xlarge', textColor: '#333' },
    },
  },
  {
    type: 'hero',
    variant: 'video',
    name: 'Hero Video',
    description: 'Video background ấn tượng',
    icon: 'PlaySquareOutlined',
    thumbnail: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    defaultData: {
      content: {
        title: 'Xem video giới thiệu',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        primaryButton: { text: 'Xem ngay', url: '#' },
      },
      settings: { padding: 'xlarge' },
    },
  },

  // ========== FEATURES BLOCKS ==========
  {
    type: 'features',
    variant: 'grid-3',
    name: 'Features Grid 3',
    description: '3 cột tính năng với icons',
    icon: 'AppstoreOutlined',
    thumbnail: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    defaultData: {
      content: {
        title: 'Tính năng nổi bật',
        subtitle: 'Những gì chúng tôi cung cấp',
        items: [
          { icon: 'RocketOutlined', title: 'Nhanh chóng', description: 'Tốc độ xử lý cực nhanh' },
          { icon: 'SafetyOutlined', title: 'Bảo mật', description: 'Dữ liệu được mã hóa' },
          { icon: 'BulbOutlined', title: 'Thông minh', description: 'AI hỗ trợ tối ưu' },
        ],
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'features',
    variant: 'grid-4',
    name: 'Features Grid 4',
    description: '4 cột tính năng',
    icon: 'TableOutlined',
    thumbnail: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
    defaultData: {
      content: {
        title: 'Tại sao chọn chúng tôi?',
        items: [
          { icon: 'ThunderboltOutlined', title: 'Hiệu suất cao', description: 'Xử lý hàng triệu request' },
          { icon: 'FormatPainterOutlined', title: 'Đẹp mắt', description: 'Giao diện hiện đại' },
          { icon: 'ToolOutlined', title: 'Dễ sử dụng', description: 'Không cần code' },
          { icon: 'LineChartOutlined', title: 'Phân tích', description: 'Báo cáo chi tiết' },
        ],
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'features',
    variant: 'cards',
    name: 'Features Cards',
    description: 'Cards với shadow và hover effects',
    icon: 'CreditCardOutlined',
    thumbnail: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    defaultData: {
      content: {
        title: 'Dịch vụ của chúng tôi',
        items: [
          { image: 'https://picsum.photos/400/300?1', title: 'Dịch vụ 1', description: 'Mô tả dịch vụ 1' },
          { image: 'https://picsum.photos/400/300?2', title: 'Dịch vụ 2', description: 'Mô tả dịch vụ 2' },
          { image: 'https://picsum.photos/400/300?3', title: 'Dịch vụ 3', description: 'Mô tả dịch vụ 3' },
        ],
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'features',
    variant: 'zigzag',
    name: 'Features Zigzag',
    description: 'Layout zigzag xen kẽ',
    icon: 'SwapOutlined',
    thumbnail: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
    defaultData: {
      content: {
        items: [
          { image: 'https://picsum.photos/600/400?1', title: 'Bước 1', description: 'Mô tả chi tiết bước 1...' },
          { image: 'https://picsum.photos/600/400?2', title: 'Bước 2', description: 'Mô tả chi tiết bước 2...' },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== TESTIMONIAL BLOCKS ==========
  {
    type: 'testimonial',
    variant: 'carousel',
    name: 'Testimonial Carousel',
    description: 'Carousel reviews từ khách hàng',
    icon: 'CommentOutlined',
    thumbnail: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    defaultData: {
      content: {
        title: 'Khách hàng nói gì?',
        items: [
          { quote: 'Sản phẩm tuyệt vời!', author: 'Nguyễn Văn A', role: 'CEO', company: 'Công ty ABC', rating: 5 },
          { quote: 'Dịch vụ hỗ trợ tốt', author: 'Trần Thị B', role: 'Marketing', company: 'Startup XYZ', rating: 5 },
        ],
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'testimonial',
    variant: 'grid',
    name: 'Testimonial Grid',
    description: 'Grid layout các reviews',
    icon: 'StarOutlined',
    thumbnail: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    defaultData: {
      content: {
        title: 'Đánh giá từ người dùng',
        items: [
          { quote: 'Rất hài lòng!', author: 'User 1', rating: 5 },
          { quote: 'Sẽ giới thiệu cho bạn bè', author: 'User 2', rating: 4 },
          { quote: 'Tuyệt vời!', author: 'User 3', rating: 5 },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== PRICING BLOCKS ==========
  {
    type: 'pricing',
    variant: 'cards',
    name: 'Pricing Cards',
    description: '3 gói giá với highlight',
    icon: 'DollarOutlined',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    defaultData: {
      content: {
        title: 'Bảng giá',
        subtitle: 'Chọn gói phù hợp với bạn',
        plans: [
          { name: 'Starter', price: 'Miễn phí', features: ['Feature 1', 'Feature 2'], buttonText: 'Bắt đầu', buttonUrl: '#' },
          { name: 'Pro', price: '199k/tháng', features: ['Tất cả Starter', 'Feature 3', 'Feature 4'], highlighted: true, buttonText: 'Dùng thử', buttonUrl: '#' },
          { name: 'Enterprise', price: 'Liên hệ', features: ['Tất cả Pro', 'Hỗ trợ 24/7'], buttonText: 'Liên hệ', buttonUrl: '#' },
        ],
      },
      settings: { padding: 'large' },
    },
  },
  {
    type: 'pricing',
    variant: 'toggle',
    name: 'Pricing Toggle',
    description: 'Có toggle tháng/năm',
    icon: 'SyncOutlined',
    thumbnail: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    defaultData: {
      content: {
        title: 'Giá cả linh hoạt',
        billingToggle: true,
        plans: [
          { name: 'Basic', price: '99k', priceYearly: '990k', features: ['5 projects', '10GB storage'], buttonText: 'Chọn', buttonUrl: '#' },
          { name: 'Premium', price: '299k', priceYearly: '2990k', features: ['Unlimited', '100GB storage'], highlighted: true, buttonText: 'Chọn', buttonUrl: '#' },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== CTA BLOCKS ==========
  {
    type: 'cta',
    variant: 'simple',
    name: 'CTA Simple',
    description: 'Call to action đơn giản',
    icon: 'NotificationOutlined',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    defaultData: {
      content: {
        title: 'Sẵn sàng bắt đầu?',
        description: 'Đăng ký ngay hôm nay và nhận ưu đãi đặc biệt',
        buttonText: 'Đăng ký ngay',
        buttonUrl: '#',
      },
      settings: { padding: 'large', backgroundColor: '#667eea', textColor: '#fff' },
    },
  },
  {
    type: 'cta',
    variant: 'newsletter',
    name: 'Newsletter CTA',
    description: 'Form đăng ký email',
    icon: 'MailOutlined',
    thumbnail: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    defaultData: {
      content: {
        title: 'Đăng ký nhận tin',
        description: 'Nhận thông tin mới nhất qua email',
        buttonText: 'Đăng ký',
        buttonUrl: '#',
        inputPlaceholder: 'Nhập email của bạn',
      },
      settings: { padding: 'medium' },
    },
  },
  {
    type: 'cta',
    variant: 'banner',
    name: 'CTA Banner',
    description: 'Banner ngang full width',
    icon: 'FlagOutlined',
    thumbnail: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    defaultData: {
      content: {
        title: 'Ưu đãi có hạn!',
        description: 'Giảm 50% cho 100 khách hàng đầu tiên',
        buttonText: 'Nhận ưu đãi',
        buttonUrl: '#',
      },
      settings: { padding: 'medium', backgroundColor: '#ff6b6b', textColor: '#fff' },
    },
  },

  // ========== STATS BLOCKS ==========
  {
    type: 'stats',
    variant: 'counters',
    name: 'Stats Counters',
    description: 'Số liệu thống kê ấn tượng',
    icon: 'RiseOutlined',
    thumbnail: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    defaultData: {
      content: {
        items: [
          { value: '10K+', label: 'Khách hàng', icon: 'TeamOutlined' },
          { value: '99%', label: 'Hài lòng', icon: 'SmileOutlined' },
          { value: '24/7', label: 'Hỗ trợ', icon: 'ClockCircleOutlined' },
          { value: '50+', label: 'Quốc gia', icon: 'GlobalOutlined' },
        ],
      },
      settings: { padding: 'large', backgroundColor: '#1a1a2e', textColor: '#fff' },
    },
  },

  // ========== GALLERY BLOCKS ==========
  {
    type: 'gallery',
    variant: 'masonry',
    name: 'Gallery Masonry',
    description: 'Layout masonry đẹp mắt',
    icon: 'PictureOutlined',
    thumbnail: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    defaultData: {
      content: {
        title: 'Thư viện hình ảnh',
        images: [
          { url: 'https://picsum.photos/400/300?1', alt: 'Image 1' },
          { url: 'https://picsum.photos/400/500?2', alt: 'Image 2' },
          { url: 'https://picsum.photos/400/350?3', alt: 'Image 3' },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== FAQ BLOCKS ==========
  {
    type: 'faq',
    variant: 'accordion',
    name: 'FAQ Accordion',
    description: 'Câu hỏi thường gặp dạng accordion',
    icon: 'QuestionCircleOutlined',
    thumbnail: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    defaultData: {
      content: {
        title: 'Câu hỏi thường gặp',
        items: [
          { question: 'Làm sao để bắt đầu?', answer: 'Rất đơn giản, chỉ cần đăng ký tài khoản...' },
          { question: 'Giá cả như thế nào?', answer: 'Chúng tôi có nhiều gói phù hợp...' },
          { question: 'Có hỗ trợ kỹ thuật không?', answer: 'Có, chúng tôi hỗ trợ 24/7...' },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== CONTACT BLOCKS ==========
  {
    type: 'contact',
    variant: 'split',
    name: 'Contact Split',
    description: 'Form liên hệ + thông tin',
    icon: 'PhoneOutlined',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    defaultData: {
      content: {
        title: 'Liên hệ với chúng tôi',
        subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ',
        email: 'contact@example.com',
        phone: '0123 456 789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        formFields: [
          { name: 'name', type: 'text', label: 'Họ tên', required: true },
          { name: 'email', type: 'email', label: 'Email', required: true },
          { name: 'message', type: 'textarea', label: 'Nội dung', required: true },
        ],
      },
      settings: { padding: 'large' },
    },
  },

  // ========== FOOTER BLOCKS ==========
  {
    type: 'footer',
    variant: 'multi-column',
    name: 'Footer Multi-column',
    description: 'Footer nhiều cột với links',
    icon: 'LayoutOutlined',
    thumbnail: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    defaultData: {
      content: {
        logo: 'Logo',
        description: 'Mô tả ngắn về công ty',
        copyright: '© 2024 Company. All rights reserved.',
        columns: [
          { title: 'Sản phẩm', links: [{ text: 'Tính năng', url: '#' }, { text: 'Giá cả', url: '#' }] },
          { title: 'Công ty', links: [{ text: 'Về chúng tôi', url: '#' }, { text: 'Blog', url: '#' }] },
          { title: 'Hỗ trợ', links: [{ text: 'FAQ', url: '#' }, { text: 'Liên hệ', url: '#' }] },
        ],
        socialLinks: { facebook: '#', twitter: '#', linkedin: '#' },
      },
      settings: { backgroundColor: '#1a1a2e', textColor: '#ccc' },
    },
  },
];

// ============ HELPER FUNCTIONS ============

export const getBlocksByCategory = (category: BlockCategory): BlockDefinition[] => {
  return blockDefinitions.filter(b => b.type === category);
};

export const getBlockDefinition = (type: BlockCategory, variant: string): BlockDefinition | undefined => {
  return blockDefinitions.find(b => b.type === type && b.variant === variant);
};

export const createBlock = (type: BlockCategory, variant: string): LandingBlock => {
  const definition = getBlockDefinition(type, variant);
  if (!definition) {
    throw new Error(`Block not found: ${type}/${variant}`);
  }

  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    variant,
    settings: definition.defaultData.settings || {},
    content: definition.defaultData.content || {},
  } as LandingBlock;
};

export const categories: { id: BlockCategory; name: string; icon: string }[] = [
  { id: 'hero', name: 'Hero', icon: 'CrownOutlined' },
  { id: 'features', name: 'Features', icon: 'ThunderboltOutlined' },
  { id: 'content', name: 'Content', icon: 'FileTextOutlined' },
  { id: 'testimonial', name: 'Testimonials', icon: 'CommentOutlined' },
  { id: 'pricing', name: 'Pricing', icon: 'DollarOutlined' },
  { id: 'cta', name: 'Call to Action', icon: 'NotificationOutlined' },
  { id: 'stats', name: 'Statistics', icon: 'RiseOutlined' },
  { id: 'gallery', name: 'Gallery', icon: 'PictureOutlined' },
  { id: 'team', name: 'Team', icon: 'TeamOutlined' },
  { id: 'faq', name: 'FAQ', icon: 'QuestionCircleOutlined' },
  { id: 'contact', name: 'Contact', icon: 'PhoneOutlined' },
  { id: 'footer', name: 'Footer', icon: 'LayoutOutlined' },
];
