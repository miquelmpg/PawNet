import { Routes, Route } from 'react-router';
import { useState } from 'react';
import { Navbar } from './components/ui';
import { HomePage, UserPageActivity, RegisterPage, LoginPage, UserAccount } from './pages';
import { Toaster } from 'sileo';
import socialLogo from './assets/icons/socialNetwork-logo.png';
import { useSocket } from './hooks/use-socket';

function App() {
  const [toggle, setToggle] = useState(false);
  const [numPage, setNumPage] = useState(1);

  useSocket();
  
  return (
    <div className='d-flex flex-column gap-3 p-3' style={{backgroundColor: '#CFCFCF', backgroundImage: `url(${socialLogo})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      <Navbar toggle={toggle} setNumPage={setNumPage}/>
      <Toaster position="bottom-center" options={{fill: "#171717", styles: { description: "text-white text-center"},}}/>
      <Routes>
        <Route path='/' element={<HomePage toggle={toggle} setToggle={setToggle} numPage={numPage} setNumPage={setNumPage}/>} />
        <Route path='/users/:id' element={<UserPageActivity toggle={toggle} setToggle={setToggle} />} />
        <Route path='/account/:id' element={<UserAccount />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
