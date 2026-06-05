import { HomeLayout } from "@/modules/home/ui/layouts/home-layout";
import { trpc } from "@/trpc/server";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  // 1. Fetch the user
  const user = await trpc.users.getOne();
  return (
    <HomeLayout role={user?.role ?? undefined}>
      {children}
    </HomeLayout>
  );
};

export default Layout;