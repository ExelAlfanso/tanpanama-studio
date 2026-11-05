import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ThemeSync } from "@/components/theme-sync";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <>
      <ThemeSync />
      <AdminDashboard />
    </>
  );
}
