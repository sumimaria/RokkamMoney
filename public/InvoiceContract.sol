// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RokkamMoney {
    
    enum State { Financed, Paid }

    struct Invoice {
        string offChainId;   // Reference to the ID used in the App (e.g., "INV-2024-001")
        address payable seller;
        address buyer;
        uint256 fullAmount;  // The amount Buyer owes (e.g., 100)
        uint256 financedAmount; // The amount Investor paid (e.g., 98)
        address payable investor;
        State state;
    }

    // We track invoices by a simple counter for storage, but reference the string ID
    uint256 public invoiceCount = 0;
    mapping(uint256 => Invoice) public invoices;

    // Events
    event InvoiceFinanced(uint256 indexed chainId, string offChainId, address seller, address investor, uint256 amountPaid);
    event InvoiceRepaid(uint256 indexed chainId, address buyer, address investor, uint256 fullAmount);

    // --- FUNCTIONS ---

    // 1. Finance Invoice (Atomic Transaction)
    // This function is called ONLY after the Seller and Investor have agreed off-chain.
    // The Investor calls this function sending the agreed ETH amount.
    // It records the invoice on-chain and transfers funds to the Seller immediately.
    function financeInvoice(
        string memory _offChainId, 
        address payable _seller, 
        address _buyer, 
        uint256 _fullAmount
    ) external payable {
        require(msg.value < _fullAmount, "Financed amount must be less than full amount (Profit margin required)");

        invoiceCount++;
        
        invoices[invoiceCount] = Invoice(
            _offChainId,
            _seller,
            _buyer,
            _fullAmount,
            msg.value,
            payable(msg.sender), // The Investor is the one sending the transaction
            State.Financed
        );

        // INSTANT SETTLEMENT: Transfer funds from Investor (msg.sender) to Seller
        _seller.transfer(msg.value);

        emit InvoiceFinanced(invoiceCount, _offChainId, _seller, msg.sender, msg.value);
    }

    // 2. Repay Invoice
    // Buyer pays the full amount to the contract, which forwards it to the Investor.
    function repayInvoice(uint256 _chainId) external payable {
        Invoice storage inv = invoices[_chainId];
        require(inv.state == State.Financed, "Invoice already paid or not active");
        require(msg.value == inv.fullAmount, "Must pay exact full invoice amount");

        inv.state = State.Paid;

        // SETTLEMENT: Transfer full amount to Investor
        inv.investor.transfer(msg.value);

        emit InvoiceRepaid(_chainId, msg.sender, inv.investor, msg.value);
    }
}
