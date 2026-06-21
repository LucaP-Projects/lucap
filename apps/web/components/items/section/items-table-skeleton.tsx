import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';

export function ItemsTableSkeleton() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!isDesktop) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <Skeleton className="mb-1 h-4 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div>
                  <Skeleton className="mb-1 h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="mb-1 h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton className="h-5 w-20" />
              </th>
              <th className="px-4 py-3 text-right">
                <Skeleton className="ml-auto h-5 w-16" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-24" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
