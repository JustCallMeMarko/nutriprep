import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from "@/components/Navbar";

export default function ClientLayout() {
  return (
    <div style={{ fontFamily: "Montserrat, sans-serif" }}>
      <Navbar />
      <Outlet />
    </div>
  )
}