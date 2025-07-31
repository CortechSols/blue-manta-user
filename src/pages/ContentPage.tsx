import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Info,
	Briefcase,
	MapPin,
	User,
	FileText,
	MessageCircle,
	Globe,
	ClipboardList,
	Image,
} from "lucide-react";

export default function ContentPage() {
	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Content Generator"
			activePath="/content"
		>
			<div className="mb-6 text-gray-700">
				Create custom blog posts and local content in seconds to boost your
				visibility and SEO
			</div>
			<Card className="mb-6 shadow-md">
				<CardContent className="pt-6 pb-2">
					<form className="grid gap-4">
						{/* First Row */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<Briefcase className="w-4 h-4" /> Industry
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<div className="relative">
									<select className="w-full border rounded px-3 py-2 text-sm">
										<option>Dropdown</option>
									</select>
								</div>
							</div>
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<MapPin className="w-4 h-4" /> Service Area
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<input
									className="w-full border rounded px-3 py-2 text-sm"
									placeholder="Eg. your text here"
								/>
							</div>
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<User className="w-4 h-4" /> Tone
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<select className="w-full border rounded px-3 py-2 text-sm">
									<option>Dropdown</option>
								</select>
							</div>
						</div>
						{/* Second Row */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<FileText className="w-4 h-4" /> Content Type
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<div className="relative">
									<input
										className="w-full border rounded px-3 py-2 text-sm"
										placeholder="Eg. your text here"
									/>
								</div>
							</div>
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<MessageCircle className="w-4 h-4" /> Topic Focus
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<input
									className="w-full border rounded px-3 py-2 text-sm"
									placeholder="Eg. your text here"
								/>
							</div>
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<Globe className="w-4 h-4" /> Language
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<input
									className="w-full border rounded px-3 py-2 text-sm"
									placeholder="Eg. your text here"
								/>
							</div>
						</div>
						{/* Third Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<ClipboardList className="w-4 h-4" /> Call-to-Action Type
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<select className="w-full border rounded px-3 py-2 text-sm">
									<option>Dropdown</option>
								</select>
							</div>
							<div>
								<Label className="flex items-center gap-1 text-xs mb-1">
									<Image className="w-4 h-4" /> Other Prompt Information
									<Info className="w-3 h-3 text-gray-400" />
								</Label>
								<input
									className="w-full border rounded px-3 py-2 text-sm"
									placeholder="Eg. your text here"
								/>
							</div>
						</div>
						<div className="flex justify-center mt-2">
							<Button className="w-full max-w-xs bg-blue-600 text-white rounded-full py-2 text-base shadow-md hover:bg-blue-700">
								Generate Content
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
			{/* Content Output Card */}
			<Card className="shadow-md">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-lg text-[#0096C7]">Content</CardTitle>
					<div className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
						View Past Content
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m-5 4h18"
							/>
						</svg>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-2">
						<textarea
							className="w-full h-32 border rounded p-2 text-sm resize-none bg-gray-50"
							placeholder="Content output is placed here"
							readOnly
							value={"Generating..."}
						/>
					</div>
					<div className="flex flex-wrap gap-3 mt-2">
						<Button className="bg-cyan-500 text-white rounded-full px-6 py-2 flex-1 max-w-xs hover:bg-cyan-600">
							Copy to Clipboard
						</Button>
						<Button className="bg-cyan-500 text-white rounded-full px-6 py-2 flex-1 max-w-xs hover:bg-cyan-600">
							Download
						</Button>
						<Button className="bg-cyan-500 text-white rounded-full px-6 py-2 flex-1 max-w-xs hover:bg-cyan-600">
							Regenerate
						</Button>
						<Button
							variant="outline"
							className="rounded-full px-6 py-2 flex-1 max-w-xs border-cyan-500 text-cyan-700"
						>
							Clear All
						</Button>
					</div>
				</CardContent>
			</Card>
		</DashboardLayout>
	);
}
