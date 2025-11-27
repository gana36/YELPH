import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardHome } from './pages/dashboard/Home'
import { CreatePoll } from './pages/dashboard/CreatePoll'
import { VoteSession } from './pages/participant/VoteSession'
import { PollResult } from './pages/poll/Result'

// Placeholder components for routes
const ActivePolls = () => <div className="text-2xl font-bold">Active Polls</div>

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="create" element={<CreatePoll />} />
                    <Route path="polls" element={<ActivePolls />} />
                </Route>
                <Route path="/poll/:id" element={<VoteSession />} />
                <Route path="/poll/:id/result" element={<PollResult />} />
            </Routes>
        </Router>
    )
}

export default App
