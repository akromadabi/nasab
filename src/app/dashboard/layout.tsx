import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthProvider from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-surface-50">
                <Sidebar />
                {/* Main Content */}
                <div className="lg:pl-64">
                    <main className="min-h-screen pb-20 lg:pb-0">
                        <div className="p-3 sm:p-4 lg:p-8">{children}</div>
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
