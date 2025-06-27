import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const colorPalette = [
	"#03045E", // Dark navy blue
	"#0077B6", // Medium blue
	"#00B4D8", // Cyan blue
	"#90E0EF", // Light cyan
	"#CAF0F8", // Very light cyan
	"#EBF9FC", // Almost white cyan
];

export default function WelcomePage() {
	return (
		<div className="min-h-screen bg-gray-100 relative overflow-hidden">
			{/* Color Palette - positioned at top left */}
			<div className="absolute top-8 left-8 flex gap-2">
				{colorPalette.map((color, index) => (
					<div
						key={index}
						className="w-16 h-16 rounded-sm"
						style={{ backgroundColor: color }}
					/>
				))}
			</div>

			{/* Main Content Container */}
			<div className="flex items-center justify-center min-h-screen relative">
				{/* Welcome Card - positioned left of center */}
				<div className="absolute left-16 top-1/2 transform -translate-y-1/2">
					<Card className="w-[590px] h-[360px] bg-white shadow-lg rounded-2xl border-0">
						<CardContent className="flex items-center justify-center h-full p-8">
							<div className="flex items-center gap-8">
								{/* Manta Ray Logo */}
								<div className="flex-shrink-0">
									<img
										src="/bml-side-logo.png"
										alt="Blue Manta Labs Logo"
										className="w-20 h-20 object-contain"
									/>
								</div>

								{/* Welcome Content */}
								<div className="flex flex-col items-center gap-6">
									<h1
										className="text-4xl font-semibold"
										style={{ color: "#0077B6" }}
									>
										Welcome!
									</h1>
									<Button
										className="px-12 py-3 text-white font-medium rounded-full w-36 h-12"
										style={{ backgroundColor: "#03045E" }}
										asChild
									>
										<Link to="/login">Log In</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Large Decorative Manta Ray - positioned right of center */}
				<div className="absolute right-8 top-0.5/4 transform -translate-y-1/4">
					<img
						src="/bml-logo.png"
						alt="Decorative Manta Ray"
						className="w-[500px] h-[500px] object-contain"
					/>
				</div>
				<div className="absolute right-1/4 top-2/3 transform -translate-y-1/2">
					<img
						src="/bml-side-logo.png"
						alt="Decorative Manta Ray"
						className="w-[500px] h-[500px] object-contain"
					/>
				</div>
			</div>
		</div>
	);
}
