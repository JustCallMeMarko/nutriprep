import { Routes, Route, Outlet } from 'react-router'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import Home from './components/Home.jsx'

function Layout() {
  return (
    <>
      <header className="flex items-center gap-2 border-b px-4 py-2">
        <Show when="signed-out">
          <SignInButton className="bg-blue-500 text-white px-4 py-2 rounded-md m-2" />
          <SignUpButton className="bg-green-500 text-white px-4 py-2 rounded-md m-2" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
      <Outlet />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
