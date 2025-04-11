import { Button, TextArea } from '@radix-ui/themes'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Database } from '../../types/supabase'

const tournamentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(1, 'Location is required'),
  seat_limit: z.number().min(1, 'Seat limit must be at least 1'),
  tags: z.array(z.string()),
  accessibility_details: z.object({
    wheelchair_accessible: z.boolean().optional(),
    parking: z.string().optional(),
    public_transport: z.string().optional(),
  }).optional(),
})

type TournamentFormData = z.infer<typeof tournamentSchema>

interface TournamentFormProps {
  tournament?: Database['public']['Tables']['tournaments']['Row']
  onSuccess?: () => void
}

export function TournamentForm({ tournament, onSuccess }: TournamentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: tournament
      ? {
          title: tournament.title,
          description: tournament.description,
          date: new Date(tournament.date).toISOString().split('T')[0],
          location: tournament.location,
          seat_limit: tournament.seat_limit,
          tags: tournament.tags,
          accessibility_details: tournament.accessibility_details as {
            wheelchair_accessible?: boolean
            parking?: string
            public_transport?: string
          } || undefined,
        }
      : undefined,
  })

  const onSubmit: SubmitHandler<TournamentFormData> = async (data) => {
    try {
      setIsLoading(true)
      setError(null)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) throw new Error('Not authenticated')

      if (tournament) {
        // Update existing tournament
        const { error } = await supabase
          .from('tournaments')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tournament.id)

        if (error) throw error
      } else {
        // Create new tournament
        const { error } = await supabase.from('tournaments').insert({
          ...data,
          shop_id: session.user.id,
          status: 'draft',
        })

        if (error) throw error
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <TextArea
          {...register('description')}
          className="w-full rounded-md border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          {...register('date')}
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          {...register('location')}
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seat Limit
        </label>
        <input
          {...register('seat_limit', { valueAsNumber: true })}
          type="number"
          min="1"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.seat_limit && (
          <p className="mt-1 text-sm text-red-500">{errors.seat_limit.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <input
          {...register('tags', {
            setValueAs: (value: string) =>
              value.split(',').map((tag) => tag.trim()),
          })}
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        {errors.tags && (
          <p className="mt-1 text-sm text-red-500">{errors.tags.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Accessibility Details
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('accessibility_details.wheelchair_accessible')}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Wheelchair Accessible
            </span>
          </label>
          <input
            {...register('accessibility_details.parking')}
            type="text"
            placeholder="Parking information"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <input
            {...register('accessibility_details.public_transport')}
            type="text"
            placeholder="Public transport information"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading
          ? 'Saving...'
          : tournament
          ? 'Update Tournament'
          : 'Create Tournament'}
      </Button>
    </form>
  )
} 