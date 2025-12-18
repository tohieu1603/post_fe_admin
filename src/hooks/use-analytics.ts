"use client";

import { useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5445/api";

type EventType =
  | "page_view"
  | "post_view"
  | "category_view"
  | "faq_click"
  | "toc_click"
  | "link_click"
  | "share_facebook"
  | "share_twitter"
  | "share_copy_link"
  | "tag_click"
  | "related_post_click"
  | "category_link_click";

type EntityType = "post" | "category" | "page" | "faq" | "toc" | "link" | "tag";

interface TrackEventParams {
  eventType: EventType;
  entityType: EntityType;
  entityId?: string;
  entitySlug?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics tracking hook for public pages
 * Tracks: page views, post views, category views, FAQ clicks, TOC clicks
 */
export function useAnalytics() {
  // Track which events have been sent to avoid duplicates in same session
  const trackedEvents = useRef<Set<string>>(new Set());

  const track = useCallback(async (params: TrackEventParams) => {
    try {
      // Create unique key for deduplication
      const eventKey = `${params.eventType}-${params.entityType}-${params.entityId || params.entitySlug || "none"}`;

      // Skip if already tracked in this session (for views)
      if (["post_view", "category_view", "page_view"].includes(params.eventType)) {
        if (trackedEvents.current.has(eventKey)) {
          return;
        }
        trackedEvents.current.add(eventKey);
      }

      // Send to backend (fire and forget)
      fetch(`${API_URL}/public/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }).catch(() => {
        // Silently fail - analytics should not break the app
      });
    } catch {
      // Silently fail
    }
  }, []);

  // Convenience methods
  const trackPostView = useCallback(
    (postId: string, slug: string) => {
      track({ eventType: "post_view", entityType: "post", entityId: postId, entitySlug: slug });
    },
    [track]
  );

  const trackCategoryView = useCallback(
    (categoryId: string, slug: string) => {
      track({ eventType: "category_view", entityType: "category", entityId: categoryId, entitySlug: slug });
    },
    [track]
  );

  const trackFaqClick = useCallback(
    (postId: string, faqQuestion: string) => {
      track({
        eventType: "faq_click",
        entityType: "faq",
        entityId: postId,
        metadata: { question: faqQuestion },
      });
    },
    [track]
  );

  const trackTocClick = useCallback(
    (postId: string, heading: string, anchor: string) => {
      track({
        eventType: "toc_click",
        entityType: "toc",
        entityId: postId,
        metadata: { heading, anchor },
      });
    },
    [track]
  );

  const trackLinkClick = useCallback(
    (url: string, linkText?: string) => {
      track({
        eventType: "link_click",
        entityType: "link",
        metadata: { url, text: linkText },
      });
    },
    [track]
  );

  // Share tracking
  const trackShareFacebook = useCallback(
    (postId: string, postSlug: string) => {
      track({
        eventType: "share_facebook",
        entityType: "post",
        entityId: postId,
        entitySlug: postSlug,
      });
    },
    [track]
  );

  const trackShareTwitter = useCallback(
    (postId: string, postSlug: string) => {
      track({
        eventType: "share_twitter",
        entityType: "post",
        entityId: postId,
        entitySlug: postSlug,
      });
    },
    [track]
  );

  const trackShareCopyLink = useCallback(
    (postId: string, postSlug: string) => {
      track({
        eventType: "share_copy_link",
        entityType: "post",
        entityId: postId,
        entitySlug: postSlug,
      });
    },
    [track]
  );

  // Tag click tracking
  const trackTagClick = useCallback(
    (postId: string, tagSlug: string, tagName: string) => {
      track({
        eventType: "tag_click",
        entityType: "tag",
        entityId: postId,
        entitySlug: tagSlug,
        metadata: { tagName },
      });
    },
    [track]
  );

  // Related post click tracking
  const trackRelatedPostClick = useCallback(
    (fromPostId: string, toPostId: string, toPostSlug: string) => {
      track({
        eventType: "related_post_click",
        entityType: "post",
        entityId: toPostId,
        entitySlug: toPostSlug,
        metadata: { fromPostId },
      });
    },
    [track]
  );

  // Category link click tracking
  const trackCategoryLinkClick = useCallback(
    (postId: string, categorySlug: string, categoryName: string) => {
      track({
        eventType: "category_link_click",
        entityType: "category",
        entitySlug: categorySlug,
        metadata: { postId, categoryName },
      });
    },
    [track]
  );

  return {
    track,
    trackPostView,
    trackCategoryView,
    trackFaqClick,
    trackTocClick,
    trackLinkClick,
    trackShareFacebook,
    trackShareTwitter,
    trackShareCopyLink,
    trackTagClick,
    trackRelatedPostClick,
    trackCategoryLinkClick,
  };
}
