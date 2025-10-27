// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState, useEffect } from 'react'
import ConnectWallet from './components/ConnectWallet'
import EventList from './components/EventList'
import TicketList from './components/TicketList'
import BuyTicketModal from './components/BuyTicketModal'

const Home: React.FC = () => {
  const { activeAddress } = useWallet()
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openBuyTicketModal, setOpenBuyTicketModal] = useState(false)
  const [activeView, setActiveView] = useState<'events' | 'tickets' | null>(null)
  const [typedText, setTypedText] = useState('')
  const fullText = 'NFT-based ticketing on Algorand — securely buy, manage, and verify your tickets.'

  const toggleWalletModal = () => setOpenWalletModal(prev => !prev)
  const toggleBuyTicketModal = () => setOpenBuyTicketModal(prev => !prev)
  const showEvents = () => setActiveView('events')
  const showTickets = () => setActiveView('tickets')

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index))
      index++
      if (index > fullText.length) clearInterval(timer)
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400 flex flex-col items-center justify-start py-12 px-6 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce opacity-20">🎟️</div>
        <div className="absolute top-40 right-20 animate-pulse opacity-30">🎫</div>
        <div className="absolute bottom-40 left-20 animate-spin opacity-25">🎪</div>
        <div className="absolute bottom-20 right-10 animate-bounce opacity-20">🎭</div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 text-center mb-16 bg-black bg-opacity-20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
        <h1 className="text-7xl font-extrabold text-white drop-shadow-2xl mb-4 animate-fadeIn bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
          🎟️ AlgoTicket
        </h1>
        <p className="text-xl text-indigo-100 max-w-2xl mx-auto animate-fadeIn delay-200 font-medium">
          {typedText}<span className="animate-pulse">|</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-6 mb-12 relative z-10">
        <button
          className="btn bg-white text-indigo-600 font-bold shadow-2xl hover:shadow-white hover:shadow-lg hover:scale-110 transform transition-all duration-500 rounded-full px-8 py-4 border-4 border-transparent hover:border-white hover:bg-gradient-to-r hover:from-white hover:to-gray-100"
          onClick={toggleWalletModal}
        >
          {activeAddress ? '🔄 Switch Wallet' : '🔗 Connect Wallet'}
        </button>

        {activeAddress && (
          <>
            <button
              className="btn btn-outline text-white border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-500 rounded-full px-8 py-4 hover:shadow-lg hover:scale-110 transform hover:border-indigo-300"
              onClick={showEvents}
            >
              📅 View Events
            </button>

            <button
              className="btn btn-outline text-white border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-500 rounded-full px-8 py-4 hover:shadow-lg hover:scale-110 transform hover:border-indigo-300"
              onClick={showTickets}
            >
              🎫 My Tickets
            </button>

            {activeView === 'events' && (
              <button
                className="btn bg-gradient-to-r from-yellow-400 to-orange-500 text-indigo-900 font-bold shadow-2xl hover:shadow-yellow-300 hover:shadow-lg hover:scale-110 transform transition-all duration-500 rounded-full px-8 py-4 border-4 border-transparent hover:border-yellow-300"
                onClick={toggleBuyTicketModal}
              >
                🛒 Buy Ticket
              </button>
            )}
          </>
        )}
      </div>

      {/* Content Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        {activeView === 'events' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white border-opacity-20">
            <EventList />
          </div>
        )}
        {activeView === 'tickets' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white border-opacity-20">
            <TicketList />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-indigo-200 relative z-10">
        <p className="text-sm">Powered by Algorand Blockchain © 2023 AlgoTicket</p>
      </footer>

      {/* Modals */}
      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      <BuyTicketModal openModal={openBuyTicketModal} closeModal={toggleBuyTicketModal} />
    </div>
  )
}

export default Home
