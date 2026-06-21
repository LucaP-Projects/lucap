import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CustomizationProps } from './types';

const CustomizationSettings = ({
  settings,
  onSettingChange,
  note,
  onNoteChange,
  paperType
}: CustomizationProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{paperType} Fields</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="shipTo" className="text-sm text-gray-700">
            Ship to
          </label>
          <Switch
            id="shipTo"
            checked={settings.shipTo}
            onCheckedChange={(checked) => onSettingChange('shipTo', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="invoiceNo" className="text-sm text-gray-700">
            {paperType} no.
          </label>
          <Switch
            id="invoiceNo"
            checked={settings.invoiceNo}
            onCheckedChange={(checked) => onSettingChange('invoiceNo', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="invoiceDate" className="text-sm text-gray-700">
            {paperType} date
          </label>
          <Switch
            id="invoiceDate"
            checked={settings.invoiceDate}
            onCheckedChange={(checked) =>
              onSettingChange('invoiceDate', checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="dueDate" className="text-sm text-gray-700">
            Due date
          </label>
          <Switch
            id="dueDate"
            checked={settings.dueDate}
            onCheckedChange={(checked) => onSettingChange('dueDate', checked)}
          />
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Table content</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="tableNumber" className="text-sm text-gray-700">
            #
          </label>
          <Switch
            id="tableNumber"
            checked={settings.tableNumber}
            onCheckedChange={(checked) =>
              onSettingChange('tableNumber', checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="sku" className="text-sm text-gray-700">
            SKU
          </label>
          <Switch
            id="sku"
            checked={settings.sku}
            onCheckedChange={(checked) => onSettingChange('sku', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="text-sm text-gray-700">
            Description
          </label>
          <Switch
            id="description"
            checked={settings.description}
            onCheckedChange={(checked) =>
              onSettingChange('description', checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="quantity" className="text-sm text-gray-700">
            Qty
          </label>
          <Switch
            id="quantity"
            checked={settings.quantity}
            onCheckedChange={(checked) => onSettingChange('quantity', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="rate" className="text-sm text-gray-700">
            Rate
          </label>
          <Switch
            id="rate"
            checked={settings.rate}
            onCheckedChange={(checked) => onSettingChange('rate', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="amount" className="text-sm text-gray-700">
            Amount
          </label>
          <Switch
            id="amount"
            checked={settings.amount}
            onCheckedChange={(checked) => onSettingChange('amount', checked)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="note" className="text-sm text-gray-700">
              Note
            </label>
            <Switch
              id="note"
              checked={settings.note}
              onCheckedChange={(checked) => onSettingChange('note', checked)}
            />
          </div>
          {settings.note && (
            <Textarea
              id="noteInput"
              placeholder="Enter note"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="mt-2"
            />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CustomizationSettings;
