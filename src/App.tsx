import { HashRouter, Routes, Route } from 'react-router-dom';
import { Editor } from './pages/Editor';
import { Viewer } from './pages/Viewer';
import { FpsLogger } from './components/FpsLogger';
import './App.css';

function App() {
    return (
        <HashRouter>
            <FpsLogger />
            <Routes>
                <Route path="/" element={<Viewer />} />
                <Route path="/editor" element={<Editor />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
