import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-purple-200 mt-16 py-5 bg-gradient-to-r from-gray-700 via-purple-700 to-gray-700 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row justify-between items-center">
					<div className="flex items-center gap-3 mb-4 md:mb-0">
						<img className="w-10 h-10" src="/0xgallery.png" alt="0xgallery" />

						<span className="text-xl font-bold bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent">
							0xGallery
						</span>
					</div>

					<div className="flex gap-6">
						<Link
							href="https://github.com/TheRanomial"
							className="text-white hover:text-purple-600 transition-colors font-medium"
						>
							Contact Developer
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
