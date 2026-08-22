
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function App() {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton className="bg-blue-500 text-white px-4 py-2  rounded-md m-2" />
          <SignUpButton className="bg-green-500 text-white px-4 py-2  rounded-md m-2" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  )
}

export default App