'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Caarya Live
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Welcome to Caarya Live! This page should redirect authenticated users to the dashboard.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you're seeing this page, you'll be redirected to login or dashboard automatically.
        </p>
      </div>
    </div>
  );
}
