'use client';

import React from 'react';
import { 
  X, 
  CircleHelp, 
  Plus, 
  Trash2, 
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface CustomizeReportSettings {
  filters: { type: 'account' | 'customer'; value: string }[];
  divideBy1000: boolean;
  showCurrency: boolean;
  negativeNumbers: '-100' | '(100)';
  showRed: boolean;
  decimals: number;
  showRows: 'active' | 'all' | 'non-zero';
  showColumns: 'active' | 'all' | 'non-zero';
  sectionTitles: Record<string, string>;
  header: {
    logo: boolean;
    period: boolean;
    name: boolean;
    alignment: 'left' | 'center' | 'right';
    layout: 'name-first' | 'title-first';
  };
  footer: {
    date: boolean;
    time: boolean;
    basis: boolean;
    alignment: 'left' | 'center' | 'right';
  };
  bandedRows: boolean;
  showTotal: boolean;
  emptyCellDisplay: 'dash' | 'blank';
  borders: 'default' | 'none' | 'compact';
}

interface FilterOption {
  id: string;
  label: string;
}

export interface CustomizeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CustomizeReportSettings) => void;
  initialSettings: CustomizeReportSettings;
  filterOptions: { accounts: FilterOption[], customers: FilterOption[] };
}

export function CustomizeReportModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialSettings,
  filterOptions
}: CustomizeReportModalProps) {
  const [settings, setSettings] = React.useState<CustomizeReportSettings>(initialSettings);

  const prevIsOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setSettings(initialSettings);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialSettings]);

  const addFilter = (type: 'account' | 'customer') => {
    setSettings(prev => ({
      ...prev,
      filters: [...prev.filters, { type, value: '' }]
    }));
  };

  const removeFilter = (index: number) => {
    setSettings(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const updateFilterValue = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      filters: prev.filters.map((f, i) => i === index ? { ...f, value } : f)
    }));
  };

  const updateSectionTitle = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      sectionTitles: {
        ...prev.sectionTitles,
        [key]: value
      }
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 overflow-hidden flex flex-col h-full border-l shadow-xl">
        <SheetHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-lg font-medium text-gray-700">Customize</SheetTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-0">
              <TabsTrigger 
                value="data" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 h-full text-xs font-semibold"
              >
                Data
              </TabsTrigger>
              <TabsTrigger 
                value="visual" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent px-6 h-full text-xs font-semibold flex items-center gap-1.5"
              >
                Visual <div className="w-1.5 h-1.5 rounded-full bg-pink-600" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="p-0 m-0">
              <Accordion type="multiple" defaultValue={['filters']} className="w-full">
                {/* Filters Accordion */}
                <AccordionItem value="filters" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                       Filters <CircleHelp className="h-4 w-4 text-gray-400" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">Select how you want to filter your data.</p>
                        <button 
                          className="text-xs font-semibold text-green-700 hover:underline"
                          onClick={() => setSettings(prev => ({ ...prev, filters: [] }))}
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        {settings.filters.map((filter, index) => (
                          <div key={index} className="space-y-1">
                            <label className="text-xs text-gray-500 capitalize">{filter.type}</label>
                            <div className="flex gap-2 items-center">
                              <Select 
                                value={filter.value} 
                                onValueChange={(val) => updateFilterValue(index, val)}
                              >
                                <SelectTrigger className="text-xs h-9">
                                  <SelectValue placeholder={`Select ${filter.type}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {filter.type === 'account' ? (
                                    filterOptions.accounts.map(a => (
                                      <SelectItem key={a.id} value={a.id} className="text-xs">
                                        {a.label}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    filterOptions.customers.map(c => (
                                      <SelectItem key={c.id} value={c.id} className="text-xs">
                                        {c.label}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => removeFilter(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 gap-1"
                            onClick={() => addFilter('account')}
                          >
                            <Plus className="h-3 w-3" /> Add Account
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 gap-1"
                            onClick={() => addFilter('customer')}
                          >
                            <Plus className="h-3 w-3" /> Add Customer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Number Format Accordion */}
                <AccordionItem value="number-format" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                    Number format
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="divide-1000" 
                        checked={settings.divideBy1000}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, divideBy1000: !!checked }))}
                      />
                      <label htmlFor="divide-1000" className="text-xs text-gray-700">Divide by 1000</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="no-currency" 
                        checked={!settings.showCurrency}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showCurrency: !checked }))}
                      />
                      <label htmlFor="no-currency" className="text-xs text-gray-700">Don&apos;t show currency symbol</label>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Negative numbers</label>
                          <Select 
                            value={settings.negativeNumbers}
                            onValueChange={(val: any) => setSettings(prev => ({ ...prev, negativeNumbers: val }))}
                          >
                            <SelectTrigger className="text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="-100">-100</SelectItem>
                              <SelectItem value="(100)">(100)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox 
                            id="show-red" 
                            checked={settings.showRed}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showRed: !!checked }))}
                          />
                          <label htmlFor="show-red" className="text-xs text-gray-700">Show in red</label>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Decimals</label>
                        <RadioGroup 
                          value={settings.decimals === 0 ? 'whole' : 'decimals'}
                          onValueChange={(val) => setSettings(prev => ({ ...prev, decimals: val === 'whole' ? 0 : 2 }))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="whole" id="whole" />
                            <label htmlFor="whole" className="text-xs text-gray-700">Round to the nearest whole number</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="decimals" id="decimals" />
                            <div className="flex items-center gap-2">
                              <label htmlFor="decimals" className="text-xs text-gray-700">Show decimals up to</label>
                              <Select 
                                value={settings.decimals.toString()}
                                onValueChange={(val) => setSettings(prev => ({ ...prev, decimals: parseInt(val) }))}
                              >
                                <SelectTrigger className="w-14 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0</SelectItem>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-xs text-gray-700">places</span>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Non-zero or Active Accordion */}
                <AccordionItem value="non-zero" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                    Show non-zero or active
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Show rows</label>
                      <RadioGroup 
                        value={settings.showRows} 
                        onValueChange={(val: any) => setSettings(prev => ({ ...prev, showRows: val }))}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="active" id="rows-active" />
                          <label htmlFor="rows-active" className="text-xs text-gray-700">Active</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="rows-all" />
                          <label htmlFor="rows-all" className="text-xs text-gray-700">All</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non-zero" id="rows-non-zero" />
                          <label htmlFor="rows-non-zero" className="text-xs text-gray-700">Non-zero</label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Show columns</label>
                      <RadioGroup 
                        value={settings.showColumns} 
                        onValueChange={(val: any) => setSettings(prev => ({ ...prev, showColumns: val }))}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="active" id="cols-active" />
                          <label htmlFor="cols-active" className="text-xs text-gray-700">Active</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="cols-all" />
                          <label htmlFor="cols-all" className="text-xs text-gray-700">All</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="non-zero" id="cols-non-zero" />
                          <label htmlFor="cols-non-zero" className="text-xs text-gray-700">Non-zero</label>
                        </div>
                      </RadioGroup>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Calculated Fields Accordion */}
                <AccordionItem value="calculated-fields" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                       Calculated fields <CircleHelp className="h-4 w-4 text-gray-400" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">Add, remove, or edit custom calculated fields in this report.</p>
                      <button className="text-xs font-semibold text-green-700 hover:underline">Clear All</button>
                    </div>
                    <Button variant="outline" className="text-xs border-green-600 text-green-700 hover:bg-green-50 h-8 font-bold">
                       <Plus className="h-4 w-4 mr-1" /> Add calculated fields
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Edit Section Titles Accordion */}
                <AccordionItem value="section-titles" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700 data-[state=open]:border-2 data-[state=open]:border-blue-400 data-[state=open]:rounded-sm">
                    Edit section titles
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4 pt-4">
                    <p className="text-xs text-gray-600 font-medium">Enter custom titles for report sections.</p>
                    <div className="space-y-4 pt-2">
                      {Object.entries(settings.sectionTitles).map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[140px,1fr] items-center gap-4">
                          <label className="text-[13px] text-gray-700">{label}</label>
                          <Input 
                            value={value} 
                            onChange={(e) => updateSectionTitle(label, e.target.value)}
                            className="h-9 text-xs border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600" 
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="visual" className="p-0 m-0">
               <Accordion type="multiple" defaultValue={['header']} className="w-full">
                  {/* Header Accordion */}
                  <AccordionItem value="header" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      Header
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-6 pt-2">
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="header-logo" 
                            checked={settings.header.logo}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, header: { ...prev.header, logo: !!checked } }))}
                          />
                          <label htmlFor="header-logo" className="text-xs text-gray-700">Company logo</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="header-period" 
                            checked={settings.header.period}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, header: { ...prev.header, period: !!checked } }))}
                          />
                          <label htmlFor="header-period" className="text-xs text-gray-700">Report period</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="header-name" 
                            checked={settings.header.name}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, header: { ...prev.header, name: !!checked } }))}
                          />
                          <label htmlFor="header-name" className="text-xs text-gray-700">Company name</label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Header alignment</label>
                        <Select 
                          value={settings.header.alignment}
                          onValueChange={(val: any) => setSettings(prev => ({ ...prev, header: { ...prev.header, alignment: val } }))}
                        >
                          <SelectTrigger className="w-[180px] h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Header layout</label>
                        <RadioGroup 
                          value={settings.header.layout}
                          onValueChange={(val: any) => setSettings(prev => ({ ...prev, header: { ...prev.header, layout: val } }))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="name-first" id="name-first" />
                            <label htmlFor="name-first" className="text-xs text-gray-700">Company name first</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="title-first" id="title-first" />
                            <label htmlFor="title-first" className="text-xs text-gray-700">Report title first</label>
                          </div>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Footer Accordion */}
                  <AccordionItem value="footer" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      Footer
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-6 pt-2">
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="footer-date" 
                            checked={settings.footer.date}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, date: !!checked } }))}
                          />
                          <label htmlFor="footer-date" className="text-xs text-gray-700">Date prepared</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="footer-time" 
                            checked={settings.footer.time}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, time: !!checked } }))}
                          />
                          <label htmlFor="footer-time" className="text-xs text-gray-700">Time prepared</label>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2">
                          <Checkbox 
                            id="footer-basis" 
                            checked={settings.footer.basis}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, basis: !!checked } }))}
                          />
                          <label htmlFor="footer-basis" className="text-xs text-gray-700">Report basis (cash vs. accrual)</label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Footer alignment</label>
                        <Select 
                          value={settings.footer.alignment}
                          onValueChange={(val: any) => setSettings(prev => ({ ...prev, footer: { ...prev.footer, alignment: val } }))}
                        >
                          <SelectTrigger className="w-[180px] h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Row Settings Accordion */}
                  <AccordionItem value="row-settings" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      Row settings
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-700">Banded row color</span>
                         <button 
                           onClick={() => setSettings(prev => ({ ...prev, bandedRows: !prev.bandedRows }))}
                           className={cn(
                             "w-6 h-6 border rounded relative overflow-hidden transition-colors",
                             settings.bandedRows ? "bg-blue-50 border-blue-200" : "bg-white"
                           )}
                         >
                           {!settings.bandedRows && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-red-500 rotate-45" />}
                           {settings.bandedRows && <div className="w-full h-full bg-blue-500/10" />}
                         </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Column Settings Accordion */}
                  <AccordionItem value="column-settings" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      Column settings
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-700">Total</span>
                         <button 
                           onClick={() => setSettings(prev => ({ ...prev, showTotal: !prev.showTotal }))}
                           className={cn(
                             "w-6 h-6 border rounded relative overflow-hidden transition-colors",
                             settings.showTotal ? "bg-blue-50 border-blue-200" : "bg-white"
                           )}
                         >
                           {!settings.showTotal && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-red-500 rotate-45" />}
                           {settings.showTotal && <div className="w-full h-full bg-blue-500" />}
                         </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cell Settings Accordion */}
                  <AccordionItem value="cell-settings" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        Cell settings <Badge className="bg-pink-600 hover:bg-pink-700 text-[10px] h-4 px-1 rounded-sm uppercase font-bold">New</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-4 space-y-3">
                      <label className="text-xs font-bold text-gray-500">Show empty cells as</label>
                      <RadioGroup 
                        value={settings.emptyCellDisplay}
                        onValueChange={(val: any) => setSettings(prev => ({ ...prev, emptyCellDisplay: val }))}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dash" id="empty-dash" />
                          <label htmlFor="empty-dash" className="text-xs text-gray-700">Dash</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blank" id="empty-blank" />
                          <label htmlFor="empty-blank" className="text-xs text-gray-700">Blank</label>
                        </div>
                      </RadioGroup>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Gridlines Accordion */}
                  <AccordionItem value="gridlines" className="border-b border-b-transparent">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 text-[13px] font-bold text-gray-700">
                      Gridlines
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3 pt-2">
                      <label className="text-xs text-gray-500 px-0.5">Report borders</label>
                      <Select 
                        value={settings.borders}
                        onValueChange={(val: any) => setSettings(prev => ({ ...prev, borders: val }))}
                      >
                        <SelectTrigger className="w-full h-10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>
               </Accordion>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="px-4 py-4 bg-gray-50 border-t flex flex-row items-center justify-between space-y-0 sm:justify-between mt-auto">
          <Button variant="ghost" onClick={onClose} className="text-green-700 font-bold hover:bg-transparent hover:text-green-800 text-sm p-0 h-auto">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSave(settings);
              onClose();
            }} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold h-10 px-8 rounded shadow-sm"
          >
            Run report
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
