'use client';

import {
  Home,
  BlocksIcon,
  Receipt,
  FileBoxIcon,
  Copyright,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Label } from '../ui/label';
import { Typography } from '../ui/typography';

import { FaucetDialogButton } from './faucet-dialog-button';
import Image from 'next/image';
import { useCheckDarkMode } from '@/hooks/use-check-dark-mode';
import { usePathname } from 'next/navigation';

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Blocks',
    url: '/block',
    icon: BlocksIcon,
  },
  {
    title: 'Mempool',
    url: '/mempool',
    icon: Receipt,
  },
];

export type AppSidebarProps = {
  year: number;
};
export function AppSidebar({ year }: AppSidebarProps) {
  const isDarkMode = useCheckDarkMode();
  const pathname = usePathname();

  const isSamePath = (url: string) => {
    const pathWithoutPrefix = pathname.replace(/^\//, '');
    const urlWithoutPrefix = url.replace(/^\//, '');

    return !!pathWithoutPrefix && !!urlWithoutPrefix
      ? pathWithoutPrefix.startsWith(urlWithoutPrefix) ||
          (pathWithoutPrefix.startsWith('transaction') &&
            urlWithoutPrefix === 'block')
      : pathWithoutPrefix === urlWithoutPrefix;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-14" asChild>
              <Link href="/">
                <div className="flex flex-row gap-2 items-center">
                  {isDarkMode !== null && (
                    <Image
                      src={isDarkMode ? '/icon-dark.png' : '/icon-light.png'}
                      height={48}
                      width={48}
                      alt="logo"
                    />
                  )}
                  <div className="flex flex-col">
                    <Typography as="large">FiliXChain</Typography>
                    <Typography as="muted" className="text-xs">
                      v1.0.0
                    </Typography>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isDisabled = item.url === pathname;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSamePath(item.url)}
                      disabled={isDisabled}
                    >
                      <Link
                        href={item.url}
                        className={
                          isDisabled ? 'pointer-events-none' : undefined
                        }
                      >
                        <item.icon />
                        <Label className="cursor-pointer">{item.title}</Label>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <FaucetDialogButton />
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileBoxIcon />
                  <Label>Smart Contract (Not available)</Label>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Typography as="muted" className="text-xs">
                <Copyright /> {year} FiliXChain All rights reserved
              </Typography>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
