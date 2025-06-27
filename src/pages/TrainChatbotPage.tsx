import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";

const promptText = `You are PoolProBot, the friendly virtual assistant for **SparkleBlue Pool Services**!

1. Brand & Tone
– Speak in a relaxed, helpful tone—think of a seasoned pool technician who's also your laid-back neighbor.
– Use clear, reassuring language and sprinkle in up to two water-themed emojis (e.g., "🌊" for water balance, "💧" for solar heating).

2. Company Overview
– We provide residential and commercial pool maintenance, repairs, and installations across the Phoenix metro area.
– Our specialties: weekly cleanings, equipment repairs, leak detection, and solar-heated pool system installs.

3. Frequently Asked Questions
– **Q:** How often should I shock my pool?
– **A:** We recommend shocking once a week during heavy use season and after heavy rain to keep water crystal clear.
– **Q:** My pump is making a loud noise—what do I do?
– **A:** Turn off the pump at the breaker, then book a repair slot below. We'll diagnose and fix it ASAP.

4. Knowledge Base & Documents
"Uploaded Files" Includes:
• Pool_Maintenance_Checklist.pdf (step-by-step homeowner care guide)
• Equipment_Warranty_Info.docx
– When users ask for detailed instructions, quote directly from these files.`;

export default function TrainChatbotPage() {
	return (
		<DashboardLayout
			title="SparkleBlue Pool Services"
			subtitle="Train Chatbot"
			activePath="/train-chatbot"
		>
			{/* Save Button */}
			<div className="mb-6 flex justify-end">
				<Button className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 rounded-full">
					Save
				</Button>
			</div>

			{/* Blue Border Container */}
			<div className="border-2 border-[#0077B6] rounded-lg bg-white">
				<div className="p-8 space-y-8">
					{/* Chatbot Configuration */}
					<div className="bg-gray-50 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-[#0077B6] mb-6">
							Chatbot Configuration
						</h3>

						<div className="space-y-4">
							<Label className="text-sm font-medium text-gray-700">
								Manta Bot Prompt
							</Label>

							<div className="relative">
								<textarea
									value={promptText}
									readOnly
									className="w-full h-80 p-4 border border-gray-300 rounded-lg bg-white text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6]"
								/>
								{/* Green checkmark indicator */}
								<div className="absolute top-3 right-3">
									<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								</div>
							</div>

							<div className="flex justify-start pt-4">
								<Button className="bg-[#0077B6] hover:bg-[#005A8A] text-white px-8 rounded-full">
									Re-train Chatbot
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Previous Versions - Outside the gray container but inside blue border */}
				<div className="px-8 pb-8">
					<div className="space-y-4">
						<h4 className="text-sm font-medium text-gray-600">
							Previous Versions
						</h4>

						<div className="bg-white border border-gray-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="text-sm text-gray-700">
										Chatbot Prompt v34
									</span>
								</div>
								<div className="flex items-center gap-6">
									<span className="text-sm text-gray-500">Uploaded</span>
									<span className="text-sm text-gray-400">3 mins ago</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
