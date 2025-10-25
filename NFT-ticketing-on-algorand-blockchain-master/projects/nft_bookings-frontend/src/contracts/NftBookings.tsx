import algosdk, { ABIResult, TransactionSigner, ABIMethod } from 'algosdk'

/**
 * NftBookingsClient
 * Wraps calls to the NFT booking smart contract.
 */
export class NftBookingsClient {
  private methods: ABIMethod[]

  constructor(
    private appId: number,
    private algod: algosdk.Algodv2,
    private defaultSender?: string,
    private signer?: TransactionSigner
  ) {
    this.methods = [
      new algosdk.ABIMethod({
        name: 'hello',
        args: [{ type: 'string' }],
        returns: { type: 'string' },
      }),
      new algosdk.ABIMethod({
        name: 'createEvent',
        args: [
          { type: 'string' },
          { type: 'string' },
        ],
        returns: { type: 'uint64' },
      }),
      new algosdk.ABIMethod({
        name: 'bookTicket',
        args: [{ type: 'uint64' }],
        returns: { type: 'uint64' },
      }),
      new algosdk.ABIMethod({
        name: 'getMyTickets',
        args: [],
        returns: { type: 'uint64[]' },
      }),
    ]
  }

  private async executeMethod(methodName: string, args: any[] = []): Promise<ABIResult> {
    if (!this.defaultSender || !this.signer) {
      throw new Error('Sender address or signer not provided')
    }

    const method = this.methods.find((m) => m.name === methodName)
    if (!method) throw new Error(`Method ${methodName} not found`)

    const atc = new algosdk.AtomicTransactionComposer()
    const suggestedParams = await this.algod.getTransactionParams().do()

    atc.addMethodCall({
      appID: this.appId,
      method,
      methodArgs: args,
      sender: this.defaultSender,
      suggestedParams,
      signer: this.signer,
    })

    const result = await atc.execute(this.algod, 10)
    return result.methodResults[0]
  }

  hello(name: string) {
    return this.executeMethod('hello', [name])
  }

  createEvent(name: string, date: string) {
    return this.executeMethod('createEvent', [name, date])
  }

  bookTicket(eventId: number) {
    return this.executeMethod('bookTicket', [eventId])
  }

  getMyTickets() {
    return this.executeMethod('getMyTickets', [])
  }
}

/**
 * NftBookingsFactory
 * Handles deployment and instantiation of the contract.
 */
export class NftBookingsFactory {
  constructor(
    private algod: algosdk.Algodv2,
    private defaultSender?: string,
    private signer?: TransactionSigner
  ) {}

  getClient(appId: number) {
    return new NftBookingsClient(appId, this.algod, this.defaultSender, this.signer)
  }

  /**
   * Deploys the contract to Algorand
   * Replace placeholder logic with actual deployment
   */
  async deploy(): Promise<{ appClient: NftBookingsClient; appId: number }> {
    const appId = 123456 // Replace with actual deployment logic
    const appClient = new NftBookingsClient(appId, this.algod, this.defaultSender, this.signer)
    return { appClient, appId }
  }
}
