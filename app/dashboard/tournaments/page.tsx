import { Container, Heading } from '@radix-ui/themes'
import { TournamentList } from '../../components/tournaments/TournamentList'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '../../types/supabase'

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get the current user's role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session?.user.id)
    .single()

  // Build the query
  let query = supabase
    .from('tournaments')
    .select('*')
    .order('date', { ascending: true })

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.shop) {
    query = query.eq('shop_id', searchParams.shop)
  }

  if (searchParams.tags) {
    const tags = Array.isArray(searchParams.tags)
      ? searchParams.tags
      : [searchParams.tags]
    query = query.contains('tags', tags)
  }

  const { data: tournaments } = await query

  return (
    <div>
      <Container>
        <div className="py-8">
          <Heading size="8" className="mb-4">
            Tournaments
          </Heading>
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search tournaments..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          {tournaments && <TournamentList tournaments={tournaments} />}
        </div>
      </Container>
    </div>
  )
} 