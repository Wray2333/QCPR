import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import RecordPage from './pages/RecordPage.jsx';
import EditRecordPage from './pages/EditRecordPage.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/record/:id/edit" element={<EditRecordPage />} />
      </Routes>
    </AppLayout>
  );
}
