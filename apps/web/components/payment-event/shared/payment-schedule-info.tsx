import { Calendar, CreditCard } from 'lucide-react';
import { getBaseScheduleInfo } from '@/app/(app)/[company-slug]/(dashboards)/payments/[id]/utils';

export default function ScheduleInfoDisplay({
  baseSchedule
}: {
  baseSchedule: any;
}) {
  const scheduleInfo = getBaseScheduleInfo(baseSchedule);

  // Separate fee-related information and main schedule information
  const feeInfo = scheduleInfo.filter((info) =>
    info.toLowerCase().includes('initial fee')
  );
  const mainScheduleInfo = scheduleInfo.filter(
    (info) => !info.toLowerCase().includes('initial fee')
  );

  return (
    <div className="space-y-4">
      {/* Main Schedule Information */}
      <div>
        <h4 className="text-muted-foreground mb-2 text-sm font-medium">
          Installments
        </h4>
        <div className="grid gap-2">
          {mainScheduleInfo.map((info, index) => (
            <div
              key={index}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{info}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Information */}
      {feeInfo.length > 0 && (
        <div>
          <h4 className="text-muted-foreground mb-2 text-sm font-medium">
            Fee Details
          </h4>
          <div className="grid gap-2">
            {feeInfo.map((info, index) => {
              const isFeeAmount = info.includes('Initial fee:');
              return (
                <div
                  key={index}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  {isFeeAmount ? (
                    <CreditCard className="h-4 w-4 shrink-0" />
                  ) : (
                    <Calendar className="h-4 w-4 shrink-0" />
                  )}
                  <span>{info}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
