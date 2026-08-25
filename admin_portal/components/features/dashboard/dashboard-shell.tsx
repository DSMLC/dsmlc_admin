import type React from "react";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { SidebarNav } from "@/components/features/dashboard/sidebar-nav";
import { MobileNav } from "@/components/features/dashboard/mobile-nav";
import { AccountFooter } from "@/components/features/dashboard/navbar-footer";
import { getCurrentAdmin } from "@/lib/queries/admin-profile";
import { TopBarTitle } from "@/components/features/dashboard/header";
import { PageTransition } from "@/components/motion/page-transition";

interface DashboardShellProps {
  children: React.ReactNode;
}

export async function DashboardShell({ children }: DashboardShellProps) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col justify-between border-r border-[#1e1e1e] bg-[#0a0a0a] p-5 md:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg">
              <Image
                src="/dsmlc_square_light_gradient_logo_transparent.png"
                alt="Club logo"
                width={26}
                height={26}
                className="h-[26px] w-[26px] object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-[#f2f2f2]">
                {siteConfig.name}
              </p>
              <p className="text-xs font-light leading-tight text-[#8a8a8a]">
                {siteConfig.orgSubtitle}
              </p>
            </div>
          </div>

          <SidebarNav instanceId="desktop" />
        </div>

        <AccountFooter
          firstName={admin?.firstName ?? null}
          lastName={admin?.lastName ?? null}
          email={admin?.email ?? ""}
        />
      </aside>

      <div className="sticky top-0 z-20 border-b border-[#1e1e1e] bg-[#0a0a0a] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Image
                src="/dsmlc_square_dark_transparent.png"
                alt="Club logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <p className="text-sm font-semibold text-[#f2f2f2]">
              {siteConfig.name}
            </p>
          </div>
          <MobileNav admin={admin} />
        </div>

        <div className="border-t border-[#1e1e1e] px-4 py-3">
          <TopBarTitle />
        </div>
      </div>

      <div className="overflow-x-hidden md:pl-[220px]">
        <div className="hidden items-center border-b border-[#1a1a1a] px-8 py-4 md:flex">
          <TopBarTitle />
        </div>

        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
