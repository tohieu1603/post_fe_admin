"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
import { mediaApi, MediaListResponse } from "@/lib/api";
import MediaClient from "./media-client";

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaListResponse>({
    data: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await mediaApi.getAll({ page: 1, limit: 20 });
        setMediaList(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tải media");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return <MediaClient initialMedia={mediaList} initialError={error} />;
}
