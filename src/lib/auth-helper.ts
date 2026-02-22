import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return null;
        }
        return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            avatar: session.user.avatar,
            role: session.user.role
        }
    }
    catch {
        return null;
    }
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

export function getClientIp(request: Request): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") || "unknown"
    );
}