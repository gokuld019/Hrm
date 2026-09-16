import Link from "next/link";
import Image from "next/image";
import { ArrowRight, UserPlus, LogIn, Sparkles } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function Home() {
  return (
    <div
      className={`${jakarta.className} min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-4 relative overflow-hidden`}
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(249,115,22,0.2)] p-8 sm:p-10">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-100 tracking-wide">
              <Sparkles size={12} />
              Welcome
            </span>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            {/* Mindcarve Logo */}
            <div className="mx-auto mb-6 flex items-center justify-center">
              <Image
                src="/mindcarve1.png"
                alt="Mindcarve Logo"
                width={200}
                height={100}
                className="w-40 h-auto object-contain"
                priority
              />
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Manage your workforce, tasks & projects — all in one place.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/signup" className="block">
              <button className="group w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl px-5 py-3.5 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <UserPlus size={16} />
                Get Started — Sign Up
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </Link>

            <Link href="/auth/Employeelogin" className="block">
              <button className="group w-full flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-semibold text-sm rounded-xl px-5 py-3.5 border border-gray-200 hover:border-orange-200 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <LogIn size={16} />
                Employee Login
              </button>
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-gray-400 mt-8">
            © {new Date().getFullYear()} Mindcarve. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}