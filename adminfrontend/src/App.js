import './App.css';
import { Routes, Route,  Navigate} from "react-router-dom";

import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
     <Routes>

         <Route path ='/' element={<Sidebar/>}/>
     </Routes>
    </div>
  );
}

export default App;
