/**
 * Template System - Define available templates for posts
 * Each template has different layout and styling for displaying content
 */

export type TemplateId =
  | 'blog'           // Classic blog post
  | 'landing-hero'   // Hero section + content
  | 'landing-split'  // Split layout (image left, content right)
  | 'gallery'        // Featured image gallery style
  | 'minimal'        // Clean, minimal design
  | 'magazine'       // Magazine style with sidebar
  | 'centered'       // Centered content, elegant
  | 'dark';          // Dark theme landing

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string; // CSS gradient or color for preview
  category: 'blog' | 'landing' | 'creative';
}

export const templates: Template[] = [
  {
    id: 'blog',
    name: 'Blog Classic',
    description: 'Bài viết blog truyền thống, dễ đọc',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'blog',
  },
  {
    id: 'landing-hero',
    name: 'Landing Hero',
    description: 'Hero section lớn với ảnh bìa full-width',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: 'landing',
  },
  {
    id: 'landing-split',
    name: 'Landing Split',
    description: 'Layout chia đôi - ảnh và nội dung song song',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    category: 'landing',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Tập trung vào hình ảnh, phù hợp portfolio',
    thumbnail: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    category: 'creative',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Tối giản, typography đẹp, không phân tâm',
    thumbnail: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)',
    category: 'blog',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Kiểu tạp chí với sidebar thông tin',
    thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    category: 'blog',
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Nội dung căn giữa, thanh lịch',
    thumbnail: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    category: 'creative',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Giao diện tối, phù hợp tech/gaming',
    thumbnail: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    category: 'landing',
  },
];

export const getTemplate = (id: string | null): Template => {
  return templates.find(t => t.id === id) || templates[0];
};

export const getTemplatesByCategory = (category: Template['category']) => {
  return templates.filter(t => t.category === category);
};
