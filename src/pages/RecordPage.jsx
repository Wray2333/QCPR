import { useState } from 'react';
import { Timer, PencilLine } from 'lucide-react';
import Tabs from '../components/common/Tabs.jsx';
import TimerPractice from '../components/record/TimerPractice.jsx';
import ManualEntry from '../components/record/ManualEntry.jsx';

const TABS = [
  { key: 'timer', label: '一键计时', icon: Timer },
  { key: 'manual', label: '手动补录', icon: PencilLine },
];

export default function RecordPage() {
  const [tab, setTab] = useState('timer');

  return (
    <div className="space-y-5">
      <Tabs items={TABS} value={tab} onChange={setTab} className="mx-auto max-w-md" />
      {tab === 'timer' ? <TimerPractice /> : <ManualEntry />}
    </div>
  );
}
