
import React from 'react';
import { useAppStore } from './store';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import PatientView from './views/PatientView';
import DoctorConsole from './views/DoctorConsole';
import SuperAdmin from './views/SuperAdmin';

const App: React.FC = () => {
  const { currentUser } = useAppStore();

  const renderView = () => {
    if (!currentUser) return <HomeView />;

    switch (currentUser.type) {
      case 'admin':
        return <SuperAdmin />;
      case 'doctor':
        return <DoctorConsole />;
      case 'patient':
        return <PatientView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

export default App;
