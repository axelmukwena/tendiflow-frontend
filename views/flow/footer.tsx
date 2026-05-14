import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => (
  <footer className="bg-white border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-gray-500">
          © 2025 Tendiflow. All rights reserved.
        </p>
        <p className="text-sm text-gray-500">
          Built with ❤️ by{" "}
          <Link
            className="underline"
            target="_blank"
            href="https://meyabase.com"
          >
            meyabase.com
          </Link>
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Help
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Privacy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
);
