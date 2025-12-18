import { settingsApi } from "@/lib/api";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let siteSettings: any = {};
  let emailSettings: any = {};
  let apiKeySettings: any = {};
  let error = null;

  try {
    const [site, email, apiKeys] = await Promise.all([
      settingsApi.getSiteSettings(),
      settingsApi.getEmailSettings(),
      settingsApi.getApiKeySettings(),
    ]);
    siteSettings = site;
    emailSettings = email;
    apiKeySettings = apiKeys;
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải settings";
  }

  return (
    <SettingsClient
      initialSiteSettings={siteSettings}
      initialEmailSettings={emailSettings}
      initialApiKeySettings={apiKeySettings}
      initialError={error}
    />
  );
}
