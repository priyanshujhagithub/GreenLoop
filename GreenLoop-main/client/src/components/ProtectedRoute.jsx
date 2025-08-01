"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext)
  // const token = localStorage.getItem("token") // Remove this line

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
