'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

export function NavMain({
  items,
  label = "Platform",
  onItemClick
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      badge?: number;
    }[];
  }[];
  label?: string;
  onItemClick?: (item: any) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const totalChildBadge =
            item.items?.reduce((sum, sub) => sum + (sub.badge ?? 0), 0) ?? 0;

          return item.items === undefined ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                onClick={(e) => {
                    // Only intercept items that need custom behavior (e.g. Assistant) —
                    // everything else must navigate normally via the anchor's href.
                    if (onItemClick && item.title === 'Assistant') {
                        e.preventDefault();
                        onItemClick(item);
                    }
                }}
              >
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    <span className="relative inline-flex shrink-0 items-center justify-center">
                      {item.icon && <item.icon />}
                      {totalChildBadge > 0 && (
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-background" />
                      )}
                    </span>
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url} className="flex w-full items-center">
                            <span>{subItem.title}</span>
                            {(subItem.badge ?? 0) > 0 && (
                              <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                                {(subItem.badge ?? 0) > 99 ? '99+' : subItem.badge}
                              </span>
                            )}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
