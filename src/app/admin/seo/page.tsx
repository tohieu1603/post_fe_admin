import { seoApi, settingsApi } from "@/lib/api";
import SeoClient from "./seo-client";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  let redirects: any[] = [];
  let robotsTxt = "";
  let sitemapConfig: any = { enabled: true, excludePatterns: [], changeFrequency: "weekly", priority: 0.5 };
  let seoGlobalSettings: any = {};
  let error = null;

  try {
    const [redirectsData, robotsData, sitemapData, seoSettings] = await Promise.all([
      seoApi.getAllRedirects(),
      seoApi.getRobotsTxt(),
      seoApi.getSitemapConfig(),
      settingsApi.getSeoGlobalSettings(),
    ]);
    redirects = redirectsData;
    robotsTxt = robotsData.content;
    sitemapConfig = sitemapData;
    seoGlobalSettings = seoSettings;
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải dữ liệu SEO";
  }

  return (
    <SeoClient
      initialRedirects={redirects}
      initialRobotsTxt={robotsTxt}
      initialSitemapConfig={sitemapConfig}
      initialSeoGlobalSettings={seoGlobalSettings}
      initialError={error}
    />
  );
}
