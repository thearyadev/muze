'use client'
import type React from 'react'

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="h-screen w-full text-white">{children}</div>
    </>
  )
}
