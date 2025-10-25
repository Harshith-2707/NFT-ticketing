import React, { useState, useMemo } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { NftBookingsFactory } from '../contracts/NftBookings'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface Event {
  id: number
  name: string
  date: string
}

const APP_ID = 123456 // replace with your actual app ID

const EventList: React.FC = () => {
  const [events] = useState<Event[]>([
    { id: 1, name: 'Concert A', date: '2023-12-01' },
    { id: 2, name: 'Festival B', date: '2023-12-15' },
  ])
  const [loadingEventId, setLoadingEventId] = useState<number | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  // Memoizing the Algorand client to avoid recreating it on every render
  const algorand = useMemo(() => {
    const algodConfig = getAlgodConfigFromViteEnvironment()
    const indexerConfig = getIndexerConfigFromViteEnvironment()
    return AlgorandClient.fromConfig({ algodConfig, indexerConfig })
  }, [])

  // Memoizing the appFactory, to avoid recreating it unnecessarily
  const appFactory = useMemo(() => {
    if (!activeAddress) return null
    return new NftBookingsFactory(algorand.algod, activeAddress, transactionSigner)
  }, [algorand.algod, activeAddress, transactionSigner])

  const getAppClient = () => {
    if (!appFactory) throw new Error('Wallet not connected or factory not initialized')
    return appFactory.getClient(APP_ID)
  }

  const bookTicket = async (eventId: number) => {
    if (!activeAddress || !transactionSigner) {
      enqueueSnackbar('Wallet not connected', { variant: 'warning' })
      return
    }

    setLoadingEventId(eventId)
    try {
      const appClient = getAppClient()

      const response = await appClient.bookTicket(eventId)

      // Display success notification
      enqueueSnackbar(`Ticket booked with ID: ${response.returnValue}`, { variant: 'success' })
    } catch (error: any) {
      console.error(error)
      enqueueSnackbar(`Error booking ticket: ${error?.message || 'Unknown error'}`, { variant: 'error' })
    } finally {
      setLoadingEventId(null)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Available Events</h2>
      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">{event.name}</h3>
              <p>Date: {event.date}</p>
              <div className="card-actions justify-end">
                <button
                  className={`btn btn-primary ${loadingEventId === event.id ? 'loading' : ''}`}
                  onClick={() => bookTicket(event.id)}
                  disabled={loadingEventId === event.id}
                >
                  {loadingEventId === event.id ? 'Processing...' : 'Book Ticket'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList
