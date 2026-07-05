import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-lg font-semibold tracking-tight"
        >
          Conform<span className="text-emerald-600">IA</span>
        </Link>
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight">
          Créer votre compte
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Vous serez l&apos;administrateur de votre société.
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
