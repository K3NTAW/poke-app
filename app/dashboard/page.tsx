import { Heading, Text } from '@radix-ui/themes'

export default function Dashboard() {
  return (
    <div>
      <Heading size="8" className="mb-4">
        Welcome to PokéTourneys
      </Heading>
      <Text as="p" size="4" className="text-gray-600">
        Manage your tournaments and track your Pokémon TCG journey.
      </Text>
    </div>
  )
} 