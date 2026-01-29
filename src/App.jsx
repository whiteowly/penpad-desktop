import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./AuthContext";
import SplashScreen from './Components/SplashScreen';
import Login from './Components/Login';
import NewUser from './Components/NewUser';
import ExistingUser from './Components/ExistingUser';
import Dashboard from './Components/dashboard';
import Journal from './Components/Journal';
import PeriodTracker from './Components/PeriodTracker';
import ToDoList from './Components/ToDoList';
import BudgetTracker from './Components/BudgetTracker';
import Schedule from './Components/Schedule';
import Summary from './Components/Summary';
import SleepTracker from './Components/SleepTracker';
import CreateYourList from './Components/CreateYourList';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/new-user" element={<NewUser />} />
          <Route path="/existing-user" element={<ExistingUser />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/period-tracker" element={<PeriodTracker />} />
          <Route path="/to-do-list" element={<ToDoList />} />
          <Route path="/budget-tracker" element={<BudgetTracker />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/sleep-tracker" element={<SleepTracker />} />
          <Route path="/create-your-list" element={<CreateYourList />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
