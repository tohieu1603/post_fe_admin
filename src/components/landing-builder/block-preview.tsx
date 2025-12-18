"use client";

import React, { createElement } from "react";
import { Button, Rate, Collapse, Input, Row, Col, Card } from "antd";
import * as Icons from "@ant-design/icons";
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  LandingBlock,
  HeroBlockData,
  FeaturesBlockData,
  ContentBlockData,
  TestimonialBlockData,
  PricingBlockData,
  CTABlockData,
  GalleryBlockData,
  StatsBlockData,
  FAQBlockData,
  ContactBlockData,
  FooterBlockData,
  BlockSettings,
} from "@/lib/landing-blocks";

// Dynamic icon renderer - render Ant Design icon if name ends with "Outlined", else show as text
const renderDynamicIcon = (iconName: string | undefined, style?: React.CSSProperties) => {
  if (!iconName) return null;

  // Check if it's an Ant Design icon name
  if (iconName.endsWith("Outlined") || iconName.endsWith("Filled") || iconName.endsWith("TwoTone")) {
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[iconName];
    if (IconComponent) {
      return createElement(IconComponent, { style: { fontSize: 48, ...style } });
    }
  }

  // Fallback: render as emoji or text
  return <span style={{ fontSize: 48, ...style }}>{iconName}</span>;
};

interface BlockPreviewProps {
  blocks: LandingBlock[];
}

// Helper to get padding value
const getPadding = (padding?: BlockSettings["padding"]): string => {
  const paddings: Record<string, string> = {
    none: "0",
    small: "24px 16px",
    medium: "48px 24px",
    large: "80px 32px",
    xlarge: "120px 48px",
  };
  return paddings[padding || "medium"] || "48px 24px";
};

// Helper to get animation class
const getAnimationClass = (animation?: string): string => {
  if (!animation || animation === "none") return "";
  return `animate-${animation}`;
};

// Helper to get block classes
const getBlockClasses = (settings: BlockSettings): string => {
  const classes: string[] = [];
  if (settings.bgEffect) classes.push(settings.bgEffect as string);
  if (settings.hoverEffect) classes.push(settings.hoverEffect as string);
  if (settings.cardEffect) classes.push(settings.cardEffect as string);
  if (settings.customClass) classes.push(settings.customClass);
  return classes.join(" ");
};

// Helper styles
const getBlockStyle = (settings: BlockSettings): React.CSSProperties => {
  const style: React.CSSProperties = {
    padding: getPadding(settings.padding),
    color: settings.textColor || undefined,
    position: "relative",
  };

  if (settings.backgroundColor) {
    if (settings.backgroundColor.includes("gradient")) {
      style.background = settings.backgroundColor;
      // If it's an animated gradient, set background-size
      if (settings.backgroundColor.includes("-45deg")) {
        style.backgroundSize = "400% 400%";
      }
    } else {
      style.backgroundColor = settings.backgroundColor;
    }
  }

  if (settings.backgroundImage) {
    if (settings.backgroundOverlay) {
      style.background = `linear-gradient(${settings.backgroundOverlay}, ${settings.backgroundOverlay}), url(${settings.backgroundImage}) center/cover`;
    } else {
      style.backgroundImage = `url(${settings.backgroundImage})`;
      style.backgroundSize = "cover";
      style.backgroundPosition = "center";
    }
  }

  if ((settings as Record<string, unknown>).fullHeight) {
    style.minHeight = "100vh";
    style.display = "flex";
    style.alignItems = "center";
  }

  return style;
};

// ============ HERO BLOCKS ============
const HeroBlock: React.FC<{ block: HeroBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);
  const blockClasses = getBlockClasses(settings);

  if (variant === "split") {
    return (
      <div className={blockClasses} style={{ ...getBlockStyle(settings), background: settings.backgroundColor || "#f8f9fa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }} className={animClass}>
            <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16, color: settings.textColor || "#1a1a2e" }}>
              {content.title}
            </h1>
            {content.description && (
              <p style={{ fontSize: 18, color: settings.textColor || "#666", marginBottom: 24, lineHeight: 1.6 }}>
                {content.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              {content.primaryButton && (
                <Button type="primary" size="large" href={content.primaryButton.url}>
                  {content.primaryButton.text}
                </Button>
              )}
              {content.secondaryButton && (
                <Button size="large" href={content.secondaryButton.url}>
                  {content.secondaryButton.text}
                </Button>
              )}
            </div>
          </div>
          {content.image && (
            <div style={{ flex: 1, minWidth: 300 }} className={`${animClass} animate-delay-short`}>
              <img src={content.image} alt="" style={{ width: "100%", borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "video") {
    return (
      <div className={blockClasses} style={{ ...getBlockStyle(settings), background: settings.backgroundColor || "#1a1a2e", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }} className={animClass}>
          <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24, color: settings.textColor || "#fff" }}>
            {content.title}
          </h1>
          {content.videoUrl && (
            <div style={{ position: "relative", paddingBottom: "56.25%", marginTop: 32, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <iframe
                src={content.videoUrl}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
          {content.primaryButton && (
            <Button type="primary" size="large" icon={<PlayCircleOutlined />} style={{ marginTop: 32 }} href={content.primaryButton.url}>
              {content.primaryButton.text}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default: centered / gradient / minimal
  return (
    <div className={blockClasses} style={{ ...getBlockStyle(settings), textAlign: "center", background: settings.backgroundColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }} className={animClass}>
        {content.badges && content.badges.length > 0 && (
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center", gap: 8 }}>
            {content.badges.map((badge, i) => (
              <span key={i} style={{ padding: "4px 12px", background: "rgba(255,255,255,0.2)", borderRadius: 20, fontSize: 12, color: settings.textColor || "#fff" }}>
                {badge}
              </span>
            ))}
          </div>
        )}
        <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 16, color: settings.textColor || "#fff", lineHeight: 1.2 }}>
          {content.title}
        </h1>
        {content.subtitle && (
          <p style={{ fontSize: 22, color: settings.textColor || "rgba(255,255,255,0.9)", marginBottom: 32, lineHeight: 1.5 }}>
            {content.subtitle}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {content.primaryButton && (
            <Button type="primary" size="large" style={{ height: 48, padding: "0 32px", fontSize: 16 }} href={content.primaryButton.url}>
              {content.primaryButton.text}
            </Button>
          )}
          {content.secondaryButton && (
            <Button size="large" ghost style={{ height: 48, padding: "0 32px", fontSize: 16, borderColor: settings.textColor || "#fff", color: settings.textColor || "#fff" }} href={content.secondaryButton.url}>
              {content.secondaryButton.text}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ FEATURES BLOCKS ============
const FeaturesBlock: React.FC<{ block: FeaturesBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  const gridCols = variant === "grid-4" ? 4 : 3;

  if (variant === "zigzag") {
    return (
      <div style={getBlockStyle(settings)}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {content.items.map((item, index) => (
            <div
              key={index}
              className={animClass}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 48,
                marginBottom: 64,
                flexDirection: index % 2 === 0 ? "row" : "row-reverse",
                flexWrap: "wrap",
              }}
            >
              {item.image && (
                <div style={{ flex: 1, minWidth: 300 }}>
                  <img src={item.image} alt="" style={{ width: "100%", borderRadius: 12 }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div style={getBlockStyle(settings)}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {content.title && (
            <div style={{ textAlign: "center", marginBottom: 48 }} className={animClass}>
              <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{content.title}</h2>
              {content.subtitle && <p style={{ fontSize: 18, color: "#666" }}>{content.subtitle}</p>}
            </div>
          )}
          <Row gutter={[24, 24]}>
            {content.items.map((item, index) => (
              <Col xs={24} md={8} key={index}>
                <Card
                  hoverable
                  className={`${animClass} animate-delay-${index === 0 ? "none" : index === 1 ? "short" : "medium"}`}
                  cover={item.image && <img alt="" src={item.image} style={{ height: 200, objectFit: "cover" }} />}
                >
                  <Card.Meta title={item.title} description={item.description} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  }

  // Default: grid-3 / grid-4
  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <div style={{ textAlign: "center", marginBottom: 48 }} className={animClass}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{content.title}</h2>
            {content.subtitle && <p style={{ fontSize: 18, color: "#666" }}>{content.subtitle}</p>}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 32 }}>
          {content.items.map((item, index) => (
            <div
              key={index}
              className={`${animClass} animate-delay-${index === 0 ? "none" : index === 1 ? "short" : "medium"}`}
              style={{ textAlign: "center", padding: 24 }}
            >
              <div style={{ marginBottom: 16, color: "#1890ff" }}>{renderDynamicIcon(item.icon)}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: "#666", lineHeight: 1.5 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ CONTENT BLOCKS ============
const ContentBlock: React.FC<{ block: ContentBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  if (variant === "text-image-left" || variant === "text-image-right") {
    const imageFirst = variant === "text-image-left";
    return (
      <div style={getBlockStyle(settings)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 48, flexDirection: imageFirst ? "row" : "row-reverse", flexWrap: "wrap" }}>
          {content.image && (
            <div style={{ flex: 1, minWidth: 300 }} className={animClass}>
              <img src={content.image} alt="" style={{ width: "100%", borderRadius: 12 }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 300 }} className={`${animClass} animate-delay-short`}>
            {content.title && <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{content.title}</h2>}
            {content.subtitle && <p style={{ fontSize: 18, color: "#666", marginBottom: 16 }}>{content.subtitle}</p>}
            <div style={{ fontSize: 16, lineHeight: 1.8, color: "#444" }} dangerouslySetInnerHTML={{ __html: content.body }} />
          </div>
        </div>
      </div>
    );
  }

  // Default: text-only / markdown
  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 800, margin: "0 auto" }} className={animClass}>
        {content.title && <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{content.title}</h2>}
        {content.subtitle && <p style={{ fontSize: 18, color: "#666", marginBottom: 24, textAlign: "center" }}>{content.subtitle}</p>}
        <div style={{ fontSize: 16, lineHeight: 1.8, color: "#444" }} dangerouslySetInnerHTML={{ __html: content.body }} />
      </div>
    </div>
  );
};

// ============ TESTIMONIAL BLOCKS ============
const TestimonialBlock: React.FC<{ block: TestimonialBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  if (variant === "single" && content.items.length > 0) {
    const item = content.items[0];
    return (
      <div style={getBlockStyle(settings)}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }} className={animClass}>
          {content.title && <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>{content.title}</h2>}
          <p style={{ fontSize: 24, fontStyle: "italic", lineHeight: 1.6, marginBottom: 24 }}>&ldquo;{item.quote}&rdquo;</p>
          {item.rating && <Rate disabled defaultValue={item.rating} style={{ marginBottom: 16 }} />}
          <div>
            <strong style={{ fontSize: 18 }}>{item.author}</strong>
            {item.role && <span style={{ color: "#666" }}> — {item.role}</span>}
            {item.company && <span style={{ color: "#666" }}>, {item.company}</span>}
          </div>
        </div>
      </div>
    );
  }

  // Grid / carousel
  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center" }} className={animClass}>
            {content.title}
          </h2>
        )}
        <Row gutter={[24, 24]}>
          {content.items.map((item, index) => (
            <Col xs={24} md={8} key={index}>
              <Card className={`${animClass} animate-delay-${index === 0 ? "none" : index === 1 ? "short" : "medium"}`} style={{ height: "100%" }}>
                <p style={{ fontSize: 16, fontStyle: "italic", marginBottom: 16 }}>&ldquo;{item.quote}&rdquo;</p>
                {item.rating && <Rate disabled defaultValue={item.rating} style={{ marginBottom: 12 }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {item.avatar && <img src={item.avatar} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />}
                  <div>
                    <strong>{item.author}</strong>
                    {item.role && <div style={{ fontSize: 12, color: "#666" }}>{item.role}</div>}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

// ============ PRICING BLOCKS ============
const PricingBlock: React.FC<{ block: PricingBlockData }> = ({ block }) => {
  const { content, settings } = block;
  const animClass = getAnimationClass(settings.animation);

  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <div style={{ textAlign: "center", marginBottom: 48 }} className={animClass}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>{content.title}</h2>
            {content.subtitle && <p style={{ fontSize: 18, color: "#666" }}>{content.subtitle}</p>}
          </div>
        )}
        <Row gutter={[24, 24]} justify="center">
          {content.plans.map((plan, index) => (
            <Col xs={24} md={8} key={index}>
              <Card
                className={`${animClass} animate-delay-${index === 0 ? "none" : index === 1 ? "short" : "medium"}`}
                style={{
                  height: "100%",
                  textAlign: "center",
                  border: plan.highlighted ? "2px solid #1890ff" : undefined,
                  transform: plan.highlighted ? "scale(1.05)" : undefined,
                  position: "relative",
                }}
              >
                {plan.highlighted && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#1890ff", color: "#fff", padding: "4px 16px", borderRadius: 12, fontSize: 12 }}>
                    Phổ biến nhất
                  </div>
                )}
                <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{plan.name}</h3>
                <div style={{ fontSize: 42, fontWeight: 700, color: "#1890ff", marginBottom: 8 }}>{plan.price}</div>
                {plan.description && <p style={{ color: "#666", marginBottom: 24 }}>{plan.description}</p>}
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 24, textAlign: "left" }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <Button type={plan.highlighted ? "primary" : "default"} size="large" block href={plan.buttonUrl}>
                  {plan.buttonText}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

// ============ CTA BLOCKS ============
const CTABlock: React.FC<{ block: CTABlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  if (variant === "newsletter") {
    return (
      <div style={{ ...getBlockStyle(settings), background: settings.backgroundColor || "#f8f9fa" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }} className={animClass}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{content.title}</h2>
          {content.description && <p style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>{content.description}</p>}
          <div style={{ display: "flex", gap: 12, maxWidth: 400, margin: "0 auto" }}>
            <Input placeholder={content.inputPlaceholder || "Email của bạn"} size="large" style={{ flex: 1 }} />
            <Button type="primary" size="large">{content.buttonText}</Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "split" && content.image) {
    return (
      <div style={getBlockStyle(settings)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }} className={animClass}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: settings.textColor }}>{content.title}</h2>
            {content.description && <p style={{ fontSize: 18, marginBottom: 24, color: settings.textColor || "#666" }}>{content.description}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <Button type="primary" size="large" href={content.buttonUrl}>{content.buttonText}</Button>
              {content.secondaryButtonText && (
                <Button size="large" ghost href={content.secondaryButtonUrl}>{content.secondaryButtonText}</Button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <img src={content.image} alt="" style={{ width: "100%", borderRadius: 12 }} />
          </div>
        </div>
      </div>
    );
  }

  // Default: simple / banner
  return (
    <div style={{ ...getBlockStyle(settings), textAlign: "center", background: settings.backgroundColor || "#667eea" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }} className={animClass}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, color: settings.textColor || "#fff" }}>{content.title}</h2>
        {content.description && <p style={{ fontSize: 18, marginBottom: 24, color: settings.textColor || "rgba(255,255,255,0.9)" }}>{content.description}</p>}
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Button type="primary" size="large" style={{ background: "#fff", color: "#667eea", borderColor: "#fff" }} href={content.buttonUrl}>
            {content.buttonText}
          </Button>
          {content.secondaryButtonText && (
            <Button size="large" ghost style={{ borderColor: "#fff", color: "#fff" }} href={content.secondaryButtonUrl}>
              {content.secondaryButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ STATS BLOCKS ============
const StatsBlock: React.FC<{ block: StatsBlockData }> = ({ block }) => {
  const { content, settings } = block;
  const animClass = getAnimationClass(settings.animation);

  return (
    <div style={{ ...getBlockStyle(settings), background: settings.backgroundColor || "#1a1a2e" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 48, textAlign: "center", color: settings.textColor || "#fff" }} className={animClass}>
            {content.title}
          </h2>
        )}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(content.items.length, 4)}, 1fr)`, gap: 32, textAlign: "center" }}>
          {content.items.map((item, index) => (
            <div key={index} className={`${animClass} animate-delay-${index === 0 ? "none" : index === 1 ? "short" : "medium"}`}>
              {item.icon && (
                <div style={{ marginBottom: 12, color: settings.textColor || "#fff" }}>
                  {renderDynamicIcon(item.icon, { fontSize: 40 })}
                </div>
              )}
              <div style={{ fontSize: 48, fontWeight: 700, color: settings.textColor || "#fff" }}>
                {item.prefix}{item.value}{item.suffix}
              </div>
              <div style={{ fontSize: 16, color: settings.textColor || "rgba(255,255,255,0.7)", marginTop: 8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ GALLERY BLOCKS ============
const GalleryBlock: React.FC<{ block: GalleryBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center" }} className={animClass}>
            {content.title}
          </h2>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: variant === "masonry" ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {content.images.map((image, index) => (
            <div
              key={index}
              className={`${animClass} img-effect-zoom`}
              style={{
                overflow: "hidden",
                borderRadius: 8,
                gridRow: variant === "masonry" && index % 3 === 0 ? "span 2" : undefined,
              }}
            >
              <img
                src={image.url}
                alt={image.alt || ""}
                style={{
                  width: "100%",
                  height: variant === "masonry" && index % 3 === 0 ? "100%" : 200,
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ FAQ BLOCKS ============
const FAQBlock: React.FC<{ block: FAQBlockData }> = ({ block }) => {
  const { content, settings } = block;
  const animClass = getAnimationClass(settings.animation);

  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {content.title && (
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, textAlign: "center" }} className={animClass}>
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p style={{ fontSize: 18, color: "#666", marginBottom: 32, textAlign: "center" }}>{content.subtitle}</p>
        )}
        <Collapse
          className={animClass}
          accordion
          items={content.items.map((item, index) => ({
            key: index.toString(),
            label: <span style={{ fontSize: 16, fontWeight: 500 }}>{item.question}</span>,
            children: <p style={{ lineHeight: 1.6 }}>{item.answer}</p>,
          }))}
        />
      </div>
    </div>
  );
};

// ============ CONTACT BLOCKS ============
const ContactBlock: React.FC<{ block: ContactBlockData }> = ({ block }) => {
  const { content, settings, variant } = block;
  const animClass = getAnimationClass(settings.animation);

  return (
    <div style={getBlockStyle(settings)}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {content.title && (
          <div style={{ textAlign: "center", marginBottom: 48 }} className={animClass}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{content.title}</h2>
            {content.subtitle && <p style={{ fontSize: 18, color: "#666" }}>{content.subtitle}</p>}
          </div>
        )}
        <Row gutter={[48, 48]}>
          <Col xs={24} md={variant === "split" ? 12 : 24}>
            <div className={animClass}>
              {content.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <MailOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                  <span>{content.email}</span>
                </div>
              )}
              {content.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <PhoneOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                  <span>{content.phone}</span>
                </div>
              )}
              {content.address && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                  <span>{content.address}</span>
                </div>
              )}
              {content.socialLinks && (
                <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                  {content.socialLinks.facebook && <a href={content.socialLinks.facebook}><FacebookOutlined style={{ fontSize: 24 }} /></a>}
                  {content.socialLinks.twitter && <a href={content.socialLinks.twitter}><TwitterOutlined style={{ fontSize: 24 }} /></a>}
                  {content.socialLinks.instagram && <a href={content.socialLinks.instagram}><InstagramOutlined style={{ fontSize: 24 }} /></a>}
                  {content.socialLinks.linkedin && <a href={content.socialLinks.linkedin}><LinkedinOutlined style={{ fontSize: 24 }} /></a>}
                </div>
              )}
            </div>
          </Col>
          {variant === "split" && content.formFields && (
            <Col xs={24} md={12}>
              <Card className={`${animClass} animate-delay-short`}>
                {content.formFields.map((field, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
                      {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <Input.TextArea rows={4} placeholder={field.label} />
                    ) : (
                      <Input type={field.type} placeholder={field.label} />
                    )}
                  </div>
                ))}
                <Button type="primary" block size="large">Gửi liên hệ</Button>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

// ============ FOOTER BLOCKS ============
const FooterBlock: React.FC<{ block: FooterBlockData }> = ({ block }) => {
  const { content, settings } = block;

  return (
    <div style={{ ...getBlockStyle(settings), padding: "64px 24px 24px", background: settings.backgroundColor || "#1a1a2e" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={[48, 32]}>
          <Col xs={24} md={8}>
            {content.logo && <div style={{ fontSize: 24, fontWeight: 700, color: settings.textColor || "#fff", marginBottom: 16 }}>{content.logo}</div>}
            {content.description && <p style={{ color: settings.textColor || "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{content.description}</p>}
            {content.socialLinks && (
              <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                {content.socialLinks.facebook && <a href={content.socialLinks.facebook} style={{ color: settings.textColor || "#fff" }}><FacebookOutlined style={{ fontSize: 20 }} /></a>}
                {content.socialLinks.twitter && <a href={content.socialLinks.twitter} style={{ color: settings.textColor || "#fff" }}><TwitterOutlined style={{ fontSize: 20 }} /></a>}
                {content.socialLinks.instagram && <a href={content.socialLinks.instagram} style={{ color: settings.textColor || "#fff" }}><InstagramOutlined style={{ fontSize: 20 }} /></a>}
                {content.socialLinks.linkedin && <a href={content.socialLinks.linkedin} style={{ color: settings.textColor || "#fff" }}><LinkedinOutlined style={{ fontSize: 20 }} /></a>}
                {content.socialLinks.youtube && <a href={content.socialLinks.youtube} style={{ color: settings.textColor || "#fff" }}><YoutubeOutlined style={{ fontSize: 20 }} /></a>}
              </div>
            )}
          </Col>
          {content.columns?.map((column, index) => (
            <Col xs={12} md={4} key={index}>
              <h4 style={{ color: settings.textColor || "#fff", fontWeight: 600, marginBottom: 16 }}>{column.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {column.links.map((link, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>
                    <a href={link.url} style={{ color: settings.textColor || "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>
        {content.copyright && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 48, paddingTop: 24, textAlign: "center", color: settings.textColor || "rgba(255,255,255,0.5)" }}>
            {content.copyright}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN PREVIEW COMPONENT ============
export default function BlockPreview({ blocks }: BlockPreviewProps) {
  if (blocks.length === 0) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "#999" }}>
        <p>Chưa có section nào. Thêm section để xem preview.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff" }}>
      {blocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroBlock key={block.id} block={block as HeroBlockData} />;
          case "features":
            return <FeaturesBlock key={block.id} block={block as FeaturesBlockData} />;
          case "content":
            return <ContentBlock key={block.id} block={block as ContentBlockData} />;
          case "testimonial":
            return <TestimonialBlock key={block.id} block={block as TestimonialBlockData} />;
          case "pricing":
            return <PricingBlock key={block.id} block={block as PricingBlockData} />;
          case "cta":
            return <CTABlock key={block.id} block={block as CTABlockData} />;
          case "stats":
            return <StatsBlock key={block.id} block={block as StatsBlockData} />;
          case "gallery":
            return <GalleryBlock key={block.id} block={block as GalleryBlockData} />;
          case "faq":
            return <FAQBlock key={block.id} block={block as FAQBlockData} />;
          case "contact":
            return <ContactBlock key={block.id} block={block as ContactBlockData} />;
          case "footer":
            return <FooterBlock key={block.id} block={block as FooterBlockData} />;
          default:
            return (
              <div key={block.id} style={{ padding: 24, background: "#f5f5f5", textAlign: "center" }}>
                Block type không được hỗ trợ: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
}
