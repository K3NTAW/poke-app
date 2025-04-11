import { Container, Heading, Text } from '@radix-ui/themes'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch public tournaments
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: true })
    .limit(5)

  return (
    <Container size="4" className="py-8">
      <div className="space-y-8">
        <section>
          <Heading size="7" className="mb-4">Welcome to Poke Tournaments</Heading>
          <Text size="4" className="mb-6">
            Find and join Pokémon tournaments near you. Browse upcoming events or create your own tournament.
          </Text>
          <div className="flex gap-4">
            <Link href="/tournaments" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
              Browse Tournaments
            </Link>
            <Link href="/auth/sign-up" className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50">
              Create Tournament
            </Link>
          </div>
        </section>

        <section>
          <Heading size="5" className="mb-4">Upcoming Tournaments</Heading>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments?.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="p-4 border rounded-lg hover:border-red-500 transition-colors"
              >
                <Heading size="4">{tournament.title}</Heading>
                <Text className="text-gray-600">
                  {new Date(tournament.date).toLocaleDateString()} at {tournament.location}
                </Text>
                <Text className="mt-2">{tournament.description}</Text>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Container>
  )
} 