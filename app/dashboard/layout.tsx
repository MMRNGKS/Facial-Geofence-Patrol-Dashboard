'use client'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/firebase/config'; // Import auth object from config.js

const SideNavigation = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
      router.push('/'); // Redirect to home page or login page
    } catch (error: any) { // Specify type of error as 'any' or 'Error'
      console.error((error as Error).message);
    }
  };

  return (
    <nav className="bg-gray-800 w-64 min-h-screen flex flex-col justify-between">
  <div>
    <div className="flex justify-center py-4">
      <span className="text-white text-lg font-semibold">Dashboard</span>
    </div>
    <ul className="text-white">
      <li className="px-4 py-2 hover:bg-gray-700">
        <Link href="/dashboard">Attendance Logs</Link>
      </li>
      <li className="px-4 py-2 hover:bg-gray-700">
        <Link href="/dashboard/accounts">Accounts</Link>
      </li>
      <li className="px-4 py-2 hover:bg-gray-700">
        <Link href="/dashboard/geofences">Geofences</Link>
      </li>
    </ul>
  </div>
  <ul className="text-white my-4 font-bold">
    <li className="px-4 py-2 hover:bg-gray-700 mt-auto"> {/* mt-auto pushes this item to the bottom */}
      <a href="#" onClick={handleLogout}>Logout</a> {/* Use handleLogout function */}
    </li>
  </ul>
</nav>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <SideNavigation />
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}