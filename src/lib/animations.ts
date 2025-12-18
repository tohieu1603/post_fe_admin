/**
 * Animation System for Post Templates
 * Defines available animations and their CSS keyframes
 */

// Animation types for different sections
export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'zoomIn'
  | 'zoomInUp'
  | 'bounceIn'
  | 'flipIn'
  | 'rotateIn'
  | 'pulse'
  | 'float'
  | 'typewriter';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationDelay = 'none' | 'short' | 'medium' | 'long';

export interface AnimationConfig {
  type: AnimationType;
  speed?: AnimationSpeed;
  delay?: AnimationDelay;
}

export interface TemplateAnimations {
  hero?: AnimationConfig;      // Hero section (title, cover)
  content?: AnimationConfig;   // Main content
  images?: AnimationConfig;    // Images in content
  sidebar?: AnimationConfig;   // Sidebar elements
  tags?: AnimationConfig;      // Tags section
}

export interface Animation {
  id: AnimationType;
  name: string;
  description: string;
  category: 'fade' | 'slide' | 'zoom' | 'special';
  preview: string; // CSS for preview animation
}

export const animations: Animation[] = [
  // None
  {
    id: 'none',
    name: 'Không animation',
    description: 'Hiển thị ngay lập tức',
    category: 'fade',
    preview: '',
  },
  // Fade animations
  {
    id: 'fadeIn',
    name: 'Fade In',
    description: 'Mờ dần hiện ra',
    category: 'fade',
    preview: 'animation: fadeIn 0.5s ease-out',
  },
  {
    id: 'fadeInUp',
    name: 'Fade In Up',
    description: 'Mờ dần + trượt lên',
    category: 'fade',
    preview: 'animation: fadeInUp 0.5s ease-out',
  },
  {
    id: 'fadeInDown',
    name: 'Fade In Down',
    description: 'Mờ dần + trượt xuống',
    category: 'fade',
    preview: 'animation: fadeInDown 0.5s ease-out',
  },
  {
    id: 'fadeInLeft',
    name: 'Fade In Left',
    description: 'Mờ dần + trượt từ trái',
    category: 'fade',
    preview: 'animation: fadeInLeft 0.5s ease-out',
  },
  {
    id: 'fadeInRight',
    name: 'Fade In Right',
    description: 'Mờ dần + trượt từ phải',
    category: 'fade',
    preview: 'animation: fadeInRight 0.5s ease-out',
  },
  // Slide animations
  {
    id: 'slideInUp',
    name: 'Slide In Up',
    description: 'Trượt lên mạnh mẽ',
    category: 'slide',
    preview: 'animation: slideInUp 0.5s ease-out',
  },
  {
    id: 'slideInDown',
    name: 'Slide In Down',
    description: 'Trượt xuống mạnh mẽ',
    category: 'slide',
    preview: 'animation: slideInDown 0.5s ease-out',
  },
  {
    id: 'slideInLeft',
    name: 'Slide In Left',
    description: 'Trượt từ trái',
    category: 'slide',
    preview: 'animation: slideInLeft 0.5s ease-out',
  },
  {
    id: 'slideInRight',
    name: 'Slide In Right',
    description: 'Trượt từ phải',
    category: 'slide',
    preview: 'animation: slideInRight 0.5s ease-out',
  },
  // Zoom animations
  {
    id: 'zoomIn',
    name: 'Zoom In',
    description: 'Phóng to từ nhỏ',
    category: 'zoom',
    preview: 'animation: zoomIn 0.5s ease-out',
  },
  {
    id: 'zoomInUp',
    name: 'Zoom In Up',
    description: 'Phóng to + trượt lên',
    category: 'zoom',
    preview: 'animation: zoomInUp 0.5s ease-out',
  },
  // Special animations
  {
    id: 'bounceIn',
    name: 'Bounce In',
    description: 'Nảy vào với hiệu ứng đàn hồi',
    category: 'special',
    preview: 'animation: bounceIn 0.75s ease-out',
  },
  {
    id: 'flipIn',
    name: 'Flip In',
    description: 'Lật 3D vào',
    category: 'special',
    preview: 'animation: flipIn 0.6s ease-out',
  },
  {
    id: 'rotateIn',
    name: 'Rotate In',
    description: 'Xoay vào từ góc',
    category: 'special',
    preview: 'animation: rotateIn 0.5s ease-out',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Nhấp nháy nhẹ (liên tục)',
    category: 'special',
    preview: 'animation: pulse 2s infinite',
  },
  {
    id: 'float',
    name: 'Float',
    description: 'Bay lơ lửng (liên tục)',
    category: 'special',
    preview: 'animation: float 3s ease-in-out infinite',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Hiệu ứng đánh máy',
    category: 'special',
    preview: 'animation: typewriter 2s steps(20)',
  },
];

export const animationSpeeds: { id: AnimationSpeed; name: string; duration: string }[] = [
  { id: 'slow', name: 'Chậm', duration: '1s' },
  { id: 'normal', name: 'Bình thường', duration: '0.5s' },
  { id: 'fast', name: 'Nhanh', duration: '0.3s' },
];

export const animationDelays: { id: AnimationDelay; name: string; delay: string }[] = [
  { id: 'none', name: 'Không delay', delay: '0s' },
  { id: 'short', name: 'Ngắn', delay: '0.1s' },
  { id: 'medium', name: 'Vừa', delay: '0.3s' },
  { id: 'long', name: 'Dài', delay: '0.5s' },
];

export const getAnimation = (id: AnimationType): Animation => {
  return animations.find(a => a.id === id) || animations[0];
};

export const getAnimationsByCategory = (category: Animation['category']) => {
  return animations.filter(a => a.category === category);
};

// Get CSS class for animation
export const getAnimationClass = (config?: AnimationConfig): string => {
  if (!config || config.type === 'none') return '';

  const classes = [`animate-${config.type}`];
  if (config.speed) classes.push(`animate-speed-${config.speed}`);
  if (config.delay && config.delay !== 'none') classes.push(`animate-delay-${config.delay}`);

  return classes.join(' ');
};

// Get inline style for animation (fallback)
export const getAnimationStyle = (config?: AnimationConfig): React.CSSProperties => {
  if (!config || config.type === 'none') return {};

  const speed = animationSpeeds.find(s => s.id === (config.speed || 'normal'))?.duration || '0.5s';
  const delay = animationDelays.find(d => d.id === (config.delay || 'none'))?.delay || '0s';

  return {
    animationName: config.type,
    animationDuration: speed,
    animationDelay: delay,
    animationFillMode: 'both',
    animationTimingFunction: 'ease-out',
  };
};

// Default animations for each template
export const defaultTemplateAnimations: Record<string, TemplateAnimations> = {
  blog: {
    hero: { type: 'fadeInUp', speed: 'normal' },
    content: { type: 'fadeIn', speed: 'normal', delay: 'short' },
    images: { type: 'zoomIn', speed: 'normal' },
    tags: { type: 'fadeInUp', speed: 'fast', delay: 'medium' },
  },
  'landing-hero': {
    hero: { type: 'zoomIn', speed: 'slow' },
    content: { type: 'fadeInUp', speed: 'normal', delay: 'medium' },
    images: { type: 'fadeIn', speed: 'normal' },
    tags: { type: 'slideInUp', speed: 'fast', delay: 'long' },
  },
  'landing-split': {
    hero: { type: 'slideInLeft', speed: 'normal' },
    content: { type: 'slideInRight', speed: 'normal', delay: 'short' },
    images: { type: 'zoomIn', speed: 'normal' },
    tags: { type: 'fadeInUp', speed: 'fast', delay: 'medium' },
  },
  gallery: {
    hero: { type: 'fadeIn', speed: 'slow' },
    content: { type: 'fadeInUp', speed: 'normal', delay: 'short' },
    images: { type: 'zoomIn', speed: 'normal' },
    tags: { type: 'fadeIn', speed: 'fast', delay: 'short' },
  },
  minimal: {
    hero: { type: 'fadeIn', speed: 'slow' },
    content: { type: 'fadeIn', speed: 'normal', delay: 'medium' },
    images: { type: 'fadeIn', speed: 'normal' },
    tags: { type: 'fadeIn', speed: 'fast', delay: 'short' },
  },
  magazine: {
    hero: { type: 'fadeInDown', speed: 'normal' },
    content: { type: 'fadeInUp', speed: 'normal', delay: 'short' },
    sidebar: { type: 'slideInRight', speed: 'normal', delay: 'medium' },
    images: { type: 'zoomIn', speed: 'normal' },
    tags: { type: 'fadeIn', speed: 'fast', delay: 'short' },
  },
  centered: {
    hero: { type: 'zoomIn', speed: 'slow' },
    content: { type: 'fadeInUp', speed: 'normal', delay: 'medium' },
    images: { type: 'rotateIn', speed: 'normal' },
    tags: { type: 'bounceIn', speed: 'fast', delay: 'long' },
  },
  dark: {
    hero: { type: 'fadeIn', speed: 'slow' },
    content: { type: 'slideInUp', speed: 'normal', delay: 'medium' },
    images: { type: 'fadeIn', speed: 'normal' },
    tags: { type: 'fadeInUp', speed: 'fast', delay: 'short' },
  },
};
