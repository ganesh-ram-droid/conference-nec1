import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { useLocation, Outlet } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dates from './Dates.jsx'

import Committee from './Committee.jsx'
import Speakers from './Speakers.jsx'
import Schedule from './Schedule.jsx'
import { Registration } from './Registration.jsx'
import Admin from './Admin.jsx'
import Reviewer from './Reviewer.jsx'
import PasswordChange from './PasswordChange.jsx'
import ResourceNotFound from './ResourceNotFound.jsx'
import Auth from './Auth.jsx'
import { AuthProvider } from './AuthContext.jsx'
import ReviewerDashboard from './ReviewerDashboard.jsx'
import PaperStatus from './PaperStatus.jsx'
import  RegistrationTable from './Fees.jsx'
import ResearchTracks from './ResearchTracks.jsx'
import ProgramCommittee from './ProgramCommitte.jsx'
import Layout from './Layout.jsx'

// Root component that includes ScrollToTop
function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <ResourceNotFound />,
      children: [
        { index: true, element: <App /> },
        { path: 'auth', element: <Auth /> },
              { path: 'dates', element: <Dates /> },
        { path: 'tracks', element: <ResearchTracks />  },
        { path: 'committee', element: <Committee /> },
        { path: 'program-committee', element: <ProgramCommittee /> },
        { path: 'speakers', element: <Speakers /> },
        { path: 'schedule', element: <Schedule /> },
        { path: 'registration', element: <Registration /> },
        { path: 'admin', element: <Admin /> },
        { path: 'reviewer', element: <Reviewer /> },
        { path: 'reviewer-dashboard', element: <ReviewerDashboard /> },
        { path: 'paper-status', element: <PaperStatus /> },
        { path: 'change-password', element: <PasswordChange /> },
        { path: 'fees', element: <RegistrationTable /> }
      ]









      
    }
  ],
  {
    basename: '/ICoDSES/'
  }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
)
