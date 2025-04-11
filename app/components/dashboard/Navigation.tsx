import { Button } from '@radix-ui/themes'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

export function Navigation() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-red-600 hover:text-red-500"
          >
            PokéTourneys
          </Link>
          <div className="hidden space-x-4 sm:flex">
            <Link
              href="/dashboard/tournaments"
              className="text-gray-600 hover:text-gray-900"
            >
              Tournaments
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </Link>
          </div>
        </div>
        <Button variant="soft" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  )
} 