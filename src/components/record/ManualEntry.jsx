import { useNavigate } from 'react-router-dom';
import RecordForm from './RecordForm.jsx';
import { useRecords } from '../../hooks/useRecords.js';
import { getLastSetId, setLastSetId } from '../../lib/lastSetId.js';

// 手动补录历史成绩。用时用分秒拨轮录入；
// 练习日期+时间可精确指定，支持一天多次练习。
export default function ManualEntry() {
  const navigate = useNavigate();
  const { add } = useRecords();

  const handleSubmit = async (fields) => {
    await add({ ...fields, source: 'manual' });
    setLastSetId(fields.setId); // 记住本次集合编号，下次预填
    navigate('/');
  };

  return (
    <RecordForm
      initial={{ setId: getLastSetId() }}
      submitLabel="保存成绩"
      onSubmit={handleSubmit}
    />
  );
}
