import { useState,useContext } from 'react'
import './App.css'
import Home from './components/Home/Home';
import NavBar from './components/Navbar/Navbar';
import Footer from './components/Footer';
import UserContext from './context/UserContext';
import { Routes, Route } from 'react-router-dom';
import BookingComponent from './components/BookingComponent/BookingComponent';


function App() {
  const [count, setCount] = useState(0);
  const user = useContext(UserContext);

  return (
    <>
      <div className="app-container">
        
          <NavBar />
        <h6>Welcome to Showy(bookmyshow clone)</h6>
        <input type="text" placeholder='Search for movies, events, plays, sports and activities' className='search-bar'/>
        <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/booking/:id' element={<BookingComponent movie={null} onBack={() => {}} />} />
        </Routes>
        
      </div>  
      <Footer />
    </>
  )
}

export default App
