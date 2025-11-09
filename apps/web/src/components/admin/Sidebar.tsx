import {
    Building2,
    LogOut,
    Menu,
    type LucideIcon
} from "lucide-react";
import { cn } from "@repo/ui";
import {
    SidebarProvider,
    Sidebar as UISidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    useSidebar,
} from "@repo/ui";

interface SidebarProps {
    navItems: NavItem[];
    activePath: string;
    onNavigate: (path: string) => void;
    onLogout: () => void;
    collapsed: boolean;           // true => icon-only rail
    onToggleCollapse: () => void; // toggles collapsed/expanded
    className?: string;
}

export type NavItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    path: string;
};

function Sidebar({
    navItems,
    activePath,
    onNavigate,
    onLogout,
    collapsed,
    onToggleCollapse,
    className,
}: SidebarProps) {
    function HeaderTrigger() {
        const { collapsed: isCollapsed, setCollapsed } = useSidebar();
        return (
            <SidebarTrigger
                onClick={() => {
                    setCollapsed(!isCollapsed);
                    onToggleCollapse();
                }}
            >
                <Menu className="h-5 w-5" />
            </SidebarTrigger>
        );
    }

    function HeaderTitle() {
        const { collapsed: isCollapsed } = useSidebar();
        return (
            <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "") }>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary/10 text-sidebar-primary">
                    <Building2 className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                    <div>
                        <h1 className="text-sidebar-foreground">Admin Console</h1>
                        <p className="text-sm text-sidebar-foreground/60">Tenant Admin</p>
                    </div>
                )}
            </div>
        );
    }

    function ItemButton({ item }: { item: NavItem }) {
        const { collapsed: isCollapsed } = useSidebar();
        const Icon = item.icon;
        const isActive = activePath.startsWith(item.path);
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    active={isActive}
                    onClick={() => onNavigate(item.path)}
                    className={cn(isCollapsed ? "justify-center px-0" : "justify-start gap-3")}
                >
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    function LogoutButton() {
        const { collapsed: isCollapsed } = useSidebar();
        return (
            <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} className={cn(isCollapsed ? "justify-center px-0" : "justify-start gap-3")}>
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarProvider defaultCollapsed={collapsed}>
            <UISidebar
                className={cn("bg-sidebar shrink-0 transition-[width]", className)}
            >
                <SidebarHeader>
                    <HeaderTitle />
                    <HeaderTrigger />
                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <ItemButton key={item.id} item={item} />
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <LogoutButton />
                    </SidebarMenu>
                </SidebarFooter>
            </UISidebar>
        </SidebarProvider>
    );
}

export { Sidebar };
