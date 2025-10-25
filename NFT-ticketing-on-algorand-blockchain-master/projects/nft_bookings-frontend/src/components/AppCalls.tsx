// src/components/AppCalls.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import React, { useState, useMemo } from 'react'
import { NftBookingsFactory } from '../contracts/NftBookings'
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment
} from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

type ActionType = 'hello' | 'createEvent' | 'bookTicket' | 'getMyTickets'

const AppCalls = ({ openModal, setModalState }: AppCallsInterface) => {
  const [loading, setLoading] = useState(false)
  const [contractInput, setContractInput] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventId, setEventId] = useState('')
  const [action, setAction] = useState<ActionType>('hello')

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  // --------------------------
  // Safe Algorand client init
  // --------------------------
  const algorand = useMemo(() => {
    if (!transactionSigner || !activeAddress) return null

    const algodConfig = getAlgodConfigFromViteEnvironment()
    const indexerConfig = getIndexerConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
    client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner, activeAddress])

  const sendAppCall = async () => {
    if (!algorand || !activeAddress || !transactionSigner) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    setLoading(true)

    try {
      const appId = 123456 // Replace with your deployed app ID
      const factory = new NftBookingsFactory(algorand.algod, activeAddress, transactionSigner)
      const appClient = factory.getClient(appId)

      let response
      switch (action) {
        case 'hello':
          response = await appClient.hello(contractInput)
          enqueueSnackbar(`Response: ${response.returnValue}`, { variant: 'success' })
          break

        case 'createEvent':
          response = await appClient.createEvent(eventName, eventDate)
          enqueueSnackbar(`Event created: ID ${response.returnValue}`, { variant: 'success' })
          break

        case 'bookTicket':
          if (!eventId) {
            enqueueSnackbar('Please provide an Event ID', { variant: 'warning' })
            break
          }
          response = await appClient.bookTicket(Number(eventId))
          enqueueSnackbar(`Ticket booked: ID ${response.returnValue}`, { variant: 'success' })
          break

        case 'getMyTickets':
          response = await appClient.getMyTickets()
          const tickets = Array.isArray(response.returnValue)
            ? response.returnValue.join(', ')
            : response.returnValue
          enqueueSnackbar(`Your tickets: ${tickets}`, { variant: 'success' })
          break
      }
    } catch (e: any) {
      console.error('App call error:', e)
      enqueueSnackbar(`Error calling contract: ${e.message || e}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      id="appcalls_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
      style={{ display: openModal ? 'block' : 'none' }}
    >
      <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-bold text-lg">Interact with NFT Bookings Contract</h3>

        <select
          className="select select-bordered w-full mb-4"
          value={action}
          onChange={(e) => setAction(e.target.value as ActionType)}
        >
          <option value="hello">Say Hello</option>
          <option value="createEvent">Create Event</option>
          <option value="bookTicket">Book Ticket</option>
          <option value="getMyTickets">Get My Tickets</option>
        </select>

        {action === 'hello' && (
          <input
            type="text"
            placeholder="Input for hello"
            className="input input-bordered w-full mb-2"
            value={contractInput}
            onChange={(e) => setContractInput(e.target.value)}
          />
        )}

        {action === 'createEvent' && (
          <>
            <input
              type="text"
              placeholder="Event Name"
              className="input input-bordered w-full mb-2"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <input
              type="date"
              className="input input-bordered w-full mb-2"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </>
        )}

        {action === 'bookTicket' && (
          <input
            type="number"
            placeholder="Event ID"
            className="input input-bordered w-full mb-2"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
        )}

        <div className="modal-action grid gap-2">
          <button type="button" className="btn" onClick={() => setModalState(false)}>
            Close
          </button>
          <button
            type="button"
            className={`btn`}
            onClick={sendAppCall}
            disabled={loading || !activeAddress}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send Application Call'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default AppCalls
