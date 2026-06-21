import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';


interface TableConfigProps {
  columns: string[];
  setColumns: (columns: string[]) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  includeInactive: boolean;
  setIncludeInactive: (include: boolean) => void;
  includeProjects: boolean;
  setIncludeProjects: (include: boolean) => void;
}

export function TableConfigDialog({
  columns,
  setColumns,
  pageSize,
  setPageSize,
  includeInactive,
  setIncludeInactive,
  includeProjects,
  setIncludeProjects
}: TableConfigProps) {
  const columnOptions = [
    'Company name',
    'Address',
    'Phone',
    'Mobile',
    'Email',
    'Sales tax',
    'Customer type',
    'Attachments'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="sm:max-w-[425px]">
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h4 className="font-medium leading-none">Columns</h4>
            <div className="grid gap-2">
              {columnOptions.map((col) => (
                <div key={col} className="flex items-center space-x-2">
                  <Checkbox
                    id={col}
                    checked={columns.includes(col)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setColumns([...columns, col]);
                      } else {
                        setColumns(columns.filter((c) => c !== col));
                      }
                    }}
                  />
                  <Label htmlFor={col}>{col}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium leading-none">Other</h4>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inactive"
                  checked={includeInactive}
                  onCheckedChange={setIncludeInactive}
                />
                <Label htmlFor="inactive">Include inactive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="projects"
                  checked={includeProjects}
                  onCheckedChange={setIncludeProjects}
                />
                <Label htmlFor="projects">Include projects</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium leading-none">Page size</h4>
            <RadioGroup
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              {[50, 75, 100, 150, 300].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <RadioGroupItem value={size.toString()} id={`size-${size}`} />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
