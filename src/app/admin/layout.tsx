import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Check admin access
    const role = (session.user as any).role;
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-surface-50">
                <Sidebar />
                <div className="lg:pl-64">
                    <main className="pt-16 lg:pt-0 min-h-screen">
                        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
