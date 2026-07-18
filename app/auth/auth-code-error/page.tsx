export default function AuthCodeError() {
  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center text-zinc-400">
      <h1 className="text-2xl font-bold text-white mb-4">Sign-in link expired</h1>
      <p className="text-sm">
        This link is invalid or has expired. Please try signing in again.
      </p>
    </div>
  );
}
