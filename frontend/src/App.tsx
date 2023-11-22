import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './auth/Login'
import { Container } from './Container'
import { Header } from './header/Header'
import { useAppSelector } from './hooks'
import InformationsCenter from './pages/informations-center'
import { MyProfile } from './pages/my-profile'
import TraderPage from './pages/trader'
import TradersList from './pages/traders-list'

function App() {
  document.body.style.backgroundColor = 'rgb(226 232 240)'

  const accessToken = useAppSelector((state) => state.user.access_token)

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Container>
          <Routes>
            {accessToken && [
              <Route path="/" element={<InformationsCenter />} />,
              <Route path="/traders" element={<TradersList />} />,
              <Route path="/trader/:id" element={<TraderPage />} />,
              <Route path="/my-profile" element={<MyProfile />} />
            ]}
            <Route path="/login" element={<Login />} />,
            <Route path={'*'} element={<Navigate replace to={'/login'} />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </div>
  )
}

export default App
