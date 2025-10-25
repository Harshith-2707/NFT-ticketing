import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [useManualSigner, setUseManualSigner] = useState<boolean>(false)
  const [mnemonic, setMnemonic] = useState<string>('')

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()

  const { transactionSigner, activeAddress } = useWallet()

  const handleSubmitAlgo = async () => {
    if (receiverAddress.length !== 58) {
      enqueueSnackbar('Invalid receiver address', { variant: 'warning' })
      return
    }

    let signerToUse: any = transactionSigner
    let senderToUse: string = activeAddress?.toString() || ''

    if (useManualSigner) {
      if (!mnemonic) {
        enqueueSnackbar('Please provide a mnemonic for manual signing', { variant: 'warning' })
        return
      }
      try {
        const account = algosdk.mnemonicToSecretKey(mnemonic)
        signerToUse = algosdk.makeBasicAccountTransactionSigner(account)
        senderToUse = account.addr
      } catch (e) {
        enqueueSnackbar('Invalid mnemonic', { variant: 'error' })
        return
      }
    } else {
      if (!transactionSigner || !activeAddress) {
        enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
        return
      }
    }

    setLoading(true)
    try {
      enqueueSnackbar('Sending transaction...', { variant: 'info' })
      const result = await algorand.send.payment({
        signer: signerToUse,
        sender: senderToUse,
        receiver: receiverAddress,
        amount: algo(1),
      })

      enqueueSnackbar(`Transaction sent: ${result.txIds[0]}`, { variant: 'success' })
      setReceiverAddress('')
      if (useManualSigner) setMnemonic('')
      setModalState(false)
    } catch (e: any) {
      console.error('Transaction error', e)
      enqueueSnackbar(`Failed to send transaction: ${e.message || e}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      id="transact_modal"
      className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}
      style={{ display: openModal ? 'block' : 'none' }}
    >
      <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-bold text-lg">Send payment transaction</h3>
        <br />
        <div className="form-control">
          <label className="label">
            <span className="label-text">Signer Type</span>
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="signer"
                checked={!useManualSigner}
                onChange={() => setUseManualSigner(false)}
                className="radio radio-primary"
              />
              <span className="ml-2">Wallet</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="signer"
                checked={useManualSigner}
                onChange={() => setUseManualSigner(true)}
                className="radio radio-primary"
              />
              <span className="ml-2">Manual (Mnemonic)</span>
            </label>
          </div>
        </div>
        {useManualSigner && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Mnemonic (25 words)</span>
            </label>
            <textarea
              placeholder="Enter your 25-word mnemonic phrase"
              className="textarea textarea-bordered w-full"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Warning: Using mnemonic in frontend is insecure. This is for demo purposes only.
            </p>
          </div>
        )}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Receiver Address</span>
          </label>
          <input
            type="text"
            data-test-id="receiver-address"
            placeholder="Provide wallet address"
            className="input input-bordered w-full"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
        </div>
        <div className="modal-action grid gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => setModalState(false)}
          >
            Close
          </button>
          <button
            type="button"
            data-test-id="send-algo"
            className={`btn ${receiverAddress.length === 58 ? '' : 'btn-disabled'}`}
            disabled={loading || receiverAddress.length !== 58}
            onClick={handleSubmitAlgo}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Send 1 Algo'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default Transact
