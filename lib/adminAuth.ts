import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextApiRequest, NextApiResponse } from "next";
import { forbidden } from "./response";

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return false;
  if ((session.user as any).role !== "ADMIN") {
    forbidden(res, "Admin access required");
    return false;
  }
  return true;
}

export function getAdminFromSession(session: any): string {
  return session?.user?.id || "";
}
