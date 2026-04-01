import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Editor } from './pages/Editor';
import { Viewer } from './pages/Viewer';
import { FpsLogger } from './components/FpsLogger';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            {import.meta.env.DEV && <FpsLogger />}
            <Routes>
                <Route path="/" element={<Viewer />} />
                <Route path="/editor" element={<Editor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
