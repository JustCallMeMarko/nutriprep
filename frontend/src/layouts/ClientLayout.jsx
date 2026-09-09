import React from 'react'
import { Outlet } from 'react-router-dom'
import {UserButton} from "@clerk/react";

export default function ClientLayout() {
  return (
    <div>
      <UserButton />
      <Outlet />
    </div>
  )
}
