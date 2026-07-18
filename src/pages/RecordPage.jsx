import { useState } from 'react';
import { Timer, PencilLine } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TimerPractice from '../components/record/TimerPractice.jsx';
import ManualEntry from '../components/record/ManualEntry.jsx';

export default function RecordPage() {
  const [tab, setTab] = useState('timer');

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-5">
      <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="timer" className="gap-1.5">
          <Timer size={16} strokeWidth={2} aria-hidden />
          一键计时
        </TabsTrigger>
        <TabsTrigger value="manual" className="gap-1.5">
          <PencilLine size={16} strokeWidth={2} aria-hidden />
          手动补录
        </TabsTrigger>
      </TabsList>
      <TabsContent value="timer">
        <TimerPractice />
      </TabsContent>
      <TabsContent value="manual">
        <ManualEntry />
      </TabsContent>
    </Tabs>
  );
}
