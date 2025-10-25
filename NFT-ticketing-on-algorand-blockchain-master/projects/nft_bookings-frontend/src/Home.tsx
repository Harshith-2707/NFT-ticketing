// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import EventList from './components/EventList'
import TicketList from './components/TicketList'
import BuyTicketModal from './components/BuyTicketModal'

const Home: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openBuyTicketModal, setOpenBuyTicketModal] = useState(false)
  const [activeView, setActiveView] = useState<'events' | 'tickets' | null>(null)

  const { activeAddress } = useWallet()

  const toggleWalletModal = () => setOpenWalletModal(prev => !prev)
  const toggleBuyTicketModal = () => setOpenBuyTicketModal(prev => !prev)
  const showEvents = () => setActiveView('events')
  const showTickets = () => setActiveView('tickets')

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-400 to-teal-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-teal-800 mb-2">
            AlgoTicket 🎫
          </h1>
          <p className="text-teal-700 text-lg">
            NFT-based ticketing on Algorand. Buy, verify, and manage your tickets securely.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            className="btn btn-outline btn-teal"
            onClick={toggleWalletModal}
          >
            {activeAddress ? 'Switch Wallet' : 'Connect Wallet'}
          </button>

          {activeAddress && (
            <>
              <button className="btn btn-primary" onClick={showEvents}>
                View Events
              </button>

              <button className="btn btn-secondary" onClick={showTickets}>
                My Tickets
              </button>

              {activeView === 'events' && (
                <button className="btn btn-success" onClick={toggleBuyTicketModal}>
                  Buy Ticket
                </button>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeView === 'events' && <EventList />}
          {activeView === 'tickets' && <TicketList />}
        </div>

        {/* Modals */}
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        <BuyTicketModal openModal={openBuyTicketModal} closeModal={toggleBuyTicketModal} />
      </div>
    </div>
  )
}

export default Home
