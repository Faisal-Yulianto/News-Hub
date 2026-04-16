import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan",
  description: "Maaf, halaman yang Anda cari tidak dapat ditemukan di NewsHub.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="mt-4 text-lg">
          Maaf, halaman yang Anda cari tidak ditemukan.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
