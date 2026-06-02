import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Objects from "./pages/Objects";
import Processes from "./pages/Processes";
import FormsPage from "./pages/FormsPage";
import Intake from "./pages/Intake";
import CurationQueue from "./pages/CurationQueue";
import Records from "./pages/Records";
import Automations from "./pages/Automations";
import IntegrationsPage from "./pages/IntegrationsPage";
import Insights from "./pages/Insights";
import AccessGovernance from "./pages/AccessGovernance";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="objects" element={<Objects />} />
          <Route path="processes" element={<Processes />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="intake" element={<Intake />} />
          <Route path="curation" element={<CurationQueue />} />
          <Route path="records" element={<Records />} />
          <Route path="automations" element={<Automations />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="insights" element={<Insights />} />
          <Route path="access" element={<AccessGovernance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
