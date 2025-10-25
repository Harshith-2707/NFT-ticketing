import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { NftBookingsFactory } from '../contracts/NftBookings'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface BuyTicketModalProps {
  openModal: boolean
  closeModal: () => void
}

const BuyTicketModal: React.FC<BuyTicketModalProps> = ({ openModal, closeModal }) => {
  const [eventId, setEventId] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()

  // Ensure that AlgorandClient is initialized with the signer.
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig
  })
  algorand.setDefaultSigner(transactionSigner)

  const handleBuyTicket = async () => {
    if (!activeAddress || !transactionSigner) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }

    if (!eventId) {
      enqueueSnackbar('Please enter an event ID', { variant: 'error' })
      return
    }

    setLoading(true)

    try {
      const appId = 123456 // Replace with your deployed app ID
      const factory = new NftBookingsFactory(algorand.algod, activeAddress, transactionSigner)
      const appClient = factory.getClient(appId)

      const response = await appClient.bookTicket(parseInt(eventId))
      enqueueSnackbar(`Ticket booked successfully with ID: ${response.returnValue}`, { variant: 'success' })
      closeModal()
    } catch (e: any) {
      console.error('Error booking ticket:', e)
      enqueueSnackbar(`Error booking ticket: ${e.message || e}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="buy_ticket_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
      <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-bold text-lg">Buy Ticket</h3>
        <br />
        <input
          type="number"
          placeholder="Event ID"
          className="input input-bordered w-full"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <div className="modal-action">
          <button type="button" className="btn" onClick={closeModal}>
            Close
          </button>
          <button
            type="button"
            className={`btn btn-primary ${loading ? 'loading' : ''}`}
            onClick={handleBuyTicket}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Buy Ticket'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default BuyTicketModal
