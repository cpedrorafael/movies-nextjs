import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.string().transform((val) => parseInt(val, 10)),
  director: z.string().min(1, 'Director is required'),
  plot: z.string().optional(),
  posterUrl: z.string().url().optional().or(z.literal('')),
  imdbRating: z.string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .optional(),
  rottenTomatoesRating: z.string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .optional(),
  actors: z.string().transform((val) => val.split(',').map((s) => s.trim())),
  genres: z.string().transform((val) => val.split(',').map((s) => s.trim())),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface AddMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MovieFormData) => void;
}

export function AddMovieDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddMovieDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
  });

  const onSubmitForm = (data: MovieFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Movie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Input
              placeholder="Title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Year"
              type="number"
              {...register('year')}
              className={errors.year ? 'border-red-500' : ''}
            />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Director"
              {...register('director')}
              className={errors.director ? 'border-red-500' : ''}
            />
            {errors.director && (
              <p className="text-red-500 text-sm mt-1">
                {errors.director.message}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Plot"
              {...register('plot')}
              className={errors.plot ? 'border-red-500' : ''}
            />
            {errors.plot && (
              <p className="text-red-500 text-sm mt-1">{errors.plot.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Poster URL"
              {...register('posterUrl')}
              className={errors.posterUrl ? 'border-red-500' : ''}
            />
            {errors.posterUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.posterUrl.message}
              </p>
            )}
          </div>

          <div>
            <Input
              placeholder="IMDb Rating (0-10)"
              type="number"
              step="0.1"
              {...register('imdbRating')}
              className={errors.imdbRating ? 'border-red-500' : ''}
            />
            {errors.imdbRating && (
              <p className="text-red-500 text-sm mt-1">
                {errors.imdbRating.message}
              </p>
            )}
          </div>

          <div>
            <Input
              placeholder="Rotten Tomatoes Rating (0-100)"
              type="number"
              {...register('rottenTomatoesRating')}
              className={errors.rottenTomatoesRating ? 'border-red-500' : ''}
            />
            {errors.rottenTomatoesRating && (
              <p className="text-red-500 text-sm mt-1">
                {errors.rottenTomatoesRating.message}
              </p>
            )}
          </div>

          <div>
            <Input
              placeholder="Actors (comma-separated)"
              {...register('actors')}
              className={errors.actors ? 'border-red-500' : ''}
            />
            {errors.actors && (
              <p className="text-red-500 text-sm mt-1">
                {errors.actors.message}
              </p>
            )}
          </div>

          <div>
            <Input
              placeholder="Genres (comma-separated)"
              {...register('genres')}
              className={errors.genres ? 'border-red-500' : ''}
            />
            {errors.genres && (
              <p className="text-red-500 text-sm mt-1">{errors.genres.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Movie</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
