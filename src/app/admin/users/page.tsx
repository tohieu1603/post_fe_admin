import { userApi } from "@/lib/api";
import UsersClient from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  let users: any[] = [];
  let error = null;

  try {
    users = await userApi.getAll();
  } catch (e) {
    error = e instanceof Error ? e.message : "Không thể tải users";
  }

  return <UsersClient initialUsers={users} initialError={error} />;
}
