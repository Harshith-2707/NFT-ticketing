from algopy import ARC4Contract, String, UInt64, Global
from algopy.arc4 import abimethod, List


class NftBookings(ARC4Contract):
    @abimethod()
    def hello(self, name: String) -> String:
        return "Hello, " + name

    @abimethod()
    def createEvent(self, name: String, date: String) -> UInt64:
        # Create an NFT for the event
        # In a real implementation, this would mint an NFT
        # For simplicity, return a mock event ID
        eventId = Global.round  # Use round as a simple ID
        return eventId

    @abimethod()
    def bookTicket(self, eventId: UInt64) -> UInt64:
        # Book a ticket by minting an NFT to the caller
        # In a real implementation, this would mint an NFT
        # For simplicity, return a mock ticket ID
        ticketId = Global.round + eventId  # Simple ID generation
        return ticketId

    @abimethod()
    def getMyTickets(self) -> List[UInt64]:
        # Return a list of ticket IDs owned by the caller
        # In a real implementation, this would query owned NFTs
        # For simplicity, return an empty list or mock data
        tickets = List[UInt64]()
        # Mock: assume some tickets
        tickets.append(1)
        tickets.append(2)
        return tickets
