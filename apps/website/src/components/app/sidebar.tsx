'use client';

import { Home, BlocksIcon, Receipt, FileBoxIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
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

export function AppSidebar() {
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
                  <Typography as="large">FiliXChain</Typography>
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
    </Sidebar>
  );
}
