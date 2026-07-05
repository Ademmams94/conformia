import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-lg font-semibold tracking-tight"
        >
          Conform<span className="text-emerald-600">IA</span>
        </Link>
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Connexion
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
