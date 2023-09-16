/* eslint-disable no-unused-vars */
'use client'

import WebSocketView from '@/components/WebSocketView'
import { useRef } from 'react'

export default function Home() {
  const pricingRef = useRef(null)
  const contributorsRef = useRef(null)
  const tallyFormsRef = useRef(null)

  return (
    <>
      <WebSocketView />
    </>
  )
}
