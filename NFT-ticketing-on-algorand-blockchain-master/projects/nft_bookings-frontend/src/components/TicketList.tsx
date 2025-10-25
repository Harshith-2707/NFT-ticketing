import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { NftBookingsFactory } from '../contracts/NftBookings'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface Ticket {
  id: number
  eventName?: string
  date?: string
}

const APP_ID = 123456 // replace with your deployed app ID

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const indexerConfig = getIndexerConfigFromViteEnvironment()
    return AlgorandClient.fromConfig({ algodConfig, indexerConfig })
  }, [])

  const appFactory = useMemo(() => {
    if (!activeAddress || !transactionSigner) return null
    algorand.setDefaultSigner(transactionSigner)
    return new NftBookingsFactory(algorand, activeAddress, transactionSigner)
  }, [algorand, activeAddress, transactionSigner])

  const getAppClient = useCallback(() => {
    if (!appFactory) throw new Error('Wallet not connected or factory not initialized')
    return appFactory.getClient(APP_ID)
  }, [appFactory])

  const fetchTickets = useCallback(async () => {
    if (!activeAddress || !transactionSigner) return
    setLoadingTickets(true)

    try {
      const appClient = getAppClient()



      const response = await appClient.getMyTickets()

      const ticketIds: number[] = Array.isArray(response.returnValue)
        ? (response.returnValue as number[])
        : []

      const formattedTickets: Ticket[] = ticketIds.map((id) => ({
        id,
        eventName: `Event #${id}`, // optional fallback
        date: new Date().toLocaleDateString() // optional placeholder
      }))
      setTickets(formattedTickets)
    } catch (error: any) {
      console.error('Failed to fetch tickets', error)
      enqueueSnackbar(`Error fetching tickets: ${error.message || error}`, { variant: 'error' })
    } finally {
      setLoadingTickets(false)
    }
  }, [activeAddress, transactionSigner, enqueueSnackbar, getAppClient])



  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">My Tickets</h2>

      <div className="flex justify-center mb-6">
        <button className="btn btn-secondary" onClick={fetchTickets} disabled={loadingTickets}>
          {loadingTickets ? 'Loading...' : 'Refresh Tickets'}
        </button>
      </div>

      {tickets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="card bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="card-body p-4">
                <h3 className="card-title text-xl font-semibold mb-2">Ticket ID: {ticket.id}</h3>
                <p className="text-gray-600">Event: {ticket.eventName || 'Unknown Event'}</p>
                <p className="text-gray-600">Date: {ticket.date || 'TBA'}</p>
                <p className="mt-2 text-sm text-gray-500">This is your verified NFT ticket on Algorand.</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loadingTickets && <p className="text-center text-gray-500 mt-6">No tickets found. Buy one from events!</p>
      )}
    </div>
  )
}

export default TicketList
