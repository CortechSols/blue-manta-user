import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
	children: ReactNode;
	title: string;
	subtitle?: string;
	showSearch?: boolean;
	showCustomerSelect?: boolean;
	customerName?: string;
}

export function Layout({
	children,
	title,
	subtitle,
	showSearch = true,
	showCustomerSelect = true,
	customerName = "Customer List",
}: LayoutProps) {
	return (
		<div className="flex h-screen bg-white">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header
					title={title}
					subtitle={subtitle}
					showSearch={showSearch}
					showCustomerSelect={showCustomerSelect}
					customerName={customerName}
				/>
				<main className="flex-1 overflow-auto p-4">{children}</main>
			</div>
		</div>
	);
}
