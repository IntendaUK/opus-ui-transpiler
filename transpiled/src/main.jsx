import React from 'react';
import { createRoot } from 'react-dom/client';
import Opus from '@intenda/opus-ui';
import StartupDashboardNameHere from './dashboard/appDashboard.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <Opus startupComponent={<StartupDashboardNameHere />} />
);
