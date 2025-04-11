import { Container, Grid } from '@radix-ui/themes'
import { TournamentCard } from './TournamentCard'
import { Database } from '../../types/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface TournamentListProps {
  tournaments: Tournament[]
}

export function TournamentList({ tournaments }: TournamentListProps) {
  return (
    <Container>
      <Grid
        columns={{ initial: '1', sm: '2', md: '3' }}
        gap="4"
        className="py-8"
      >
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </Grid>
    </Container>
  )
} 