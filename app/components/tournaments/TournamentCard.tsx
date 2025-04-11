import { Card, Heading, Text } from '@radix-ui/themes'
import { format } from 'date-fns'
import Link from 'next/link'
import { Database } from '../../types/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const accessibilityDetails = tournament.accessibility_details as {
    wheelchair_accessible?: boolean
  } | null

  return (
    <Link href={`/dashboard/tournaments/${tournament.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Heading size="4">{tournament.title}</Heading>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
              {tournament.status}
            </span>
          </div>
          
          <Text as="p" size="2" className="text-gray-600 mb-2">
            {format(new Date(tournament.date), 'PPP p')}
          </Text>
          
          <Text as="p" size="2" className="text-gray-600 mb-2">
            {tournament.location}
          </Text>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {tournament.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Text as="p" size="2" className="text-gray-600">
              {tournament.seat_limit} seats
            </Text>
            <Text as="p" size="2" className="text-gray-600">
              {accessibilityDetails?.wheelchair_accessible ? '♿' : ''}
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  )
} 