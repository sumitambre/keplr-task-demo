import * as React from "react";
import { cn } from "./utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type AsideProps = React.HTMLAttributes<HTMLElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const value = React.useMemo(() => ({ collapsed, setCollapsed }), [collapsed]);
  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function Sidebar({ className, style, ...props }: AsideProps) {
  const { collapsed } = useSidebar();
  const computedStyle: React.CSSProperties = {
    width: collapsed
      ? "var(--app-sidebar-collapsed-width, 4rem)"
      : "var(--app-sidebar-width, 16rem)",
    height: "100dvh",
    ...style,
  };
  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        // Width and layout
        "group/sidebar sticky top-0 z-30 flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width]",
        className,
      )}
      style={computedStyle}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("min-w-0 flex-1 overflow-auto", className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-sidebar-border p-4",
        className
      )}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("border-t border-sidebar-border p-4", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex-1 space-y-2 p-4", className)} {...props} />
  );
}

export function SidebarGroup({ className, ...props }: DivProps) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "px-2 text-xs font-medium text-sidebar-foreground/60",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: DivProps) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: DivProps) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: DivProps) {
  return <div className={cn(className)} {...props} />;
}

export function SidebarMenuButton({
  className,
  active,
  ...props
}: ButtonProps & { active?: boolean }) {
  return (
    <button
      data-active={active ? "true" : "false"}
      className={cn(
        "inline-flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarTrigger({ className, ...props }: ButtonProps) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <button
      aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      onClick={() => setCollapsed(!collapsed)}
      {...props}
    />
  );
}
