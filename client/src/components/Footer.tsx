import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 space-y-2 sm:space-y-0">
          <div>
            &copy; 2025 VibeStrat. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-gray-700 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}