import { Container } from '@radix-ui/themes'
import { Navigation } from '@/app/components/dashboard/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Container className="py-8">{children}</Container>
    </div>
  )
} 