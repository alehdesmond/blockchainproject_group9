// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract G9Token is ERC20 {
    address[3] public signers;
    uint256 public constant TOKEN_PRICE = 1000;

    // Withdrawal (multi-sig)
    mapping(address => bool) public withdrawalApprovals;
    uint256 public approvalCount;
    uint256 public withdrawalAmount;
    address public withdrawalRecipient;

    // Minting (multi-sig)
    struct MintProposal {
        address recipient;
        uint256 amount;
        mapping(address => bool) approvals;
        uint256 approvalCount;
        bool executed;
    }
    
    mapping(bytes32 => MintProposal) public mintProposals;
    bytes32 public activeMintProposalId;

    // Events
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensMinted(address indexed minter, address indexed recipient, uint256 amount);
    event WithdrawalProposed(address indexed proposer, uint256 amount, address recipient);
    event WithdrawalApproved(address indexed approver);
    event WithdrawalExecuted(uint256 amount, address recipient);
    event MintProposed(address indexed proposer, address recipient, uint256 amount, bytes32 proposalId);
    event MintApproved(address indexed approver, bytes32 proposalId);
    event MintExecuted(address recipient, uint256 amount, bytes32 proposalId);

    constructor(address[3] memory _signers) ERC20("Group9 Token", "G9TK") {
        signers = _signers;
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    receive() external payable {
        uint256 tokens = msg.value * TOKEN_PRICE;
        _mint(msg.sender, tokens);
        emit TokensPurchased(msg.sender, msg.value, tokens);
    }

    function buyTokens() external payable {
        uint256 tokens = msg.value * TOKEN_PRICE;
        _mint(msg.sender, tokens);
        emit TokensPurchased(msg.sender, msg.value, tokens);
    }

    function mint(address to, uint256 amount) external onlySigner {
        _mint(to, amount);
        emit TokensMinted(msg.sender, to, amount);
    }

    function proposeWithdrawal(uint256 amount, address recipient) external onlySigner {
        require(address(this).balance >= amount, "Insufficient balance");
        withdrawalAmount = amount;
        withdrawalRecipient = recipient;

        for (uint i = 0; i < 3; i++) {
            withdrawalApprovals[signers[i]] = false;
        }
        approvalCount = 0;

        emit WithdrawalProposed(msg.sender, amount, recipient);
    }

    function approveWithdrawal() external onlySigner {
        require(withdrawalRecipient != address(0), "No withdrawal proposed");
        require(!withdrawalApprovals[msg.sender], "Already approved");

        withdrawalApprovals[msg.sender] = true;
        approvalCount++;
        emit WithdrawalApproved(msg.sender);
    }

    function executeWithdrawal() external onlySigner {
        require(approvalCount >= 2, "At least 2 approvals required");
        require(withdrawalRecipient != address(0), "No withdrawal proposed");

        uint256 amount = withdrawalAmount;
        address recipient = withdrawalRecipient;

        withdrawalAmount = 0;
        withdrawalRecipient = address(0);
        approvalCount = 0;

        payable(recipient).transfer(amount);
        emit WithdrawalExecuted(amount, recipient);
    }

    function proposeMint(address recipient, uint256 amount) external onlySigner returns (bytes32) {
        bytes32 proposalId = keccak256(abi.encodePacked(recipient, amount, block.timestamp, msg.sender));
        
        MintProposal storage newProposal = mintProposals[proposalId];
        newProposal.recipient = recipient;
        newProposal.amount = amount;
        newProposal.approvalCount = 0;
        newProposal.executed = false;
        
        for (uint i = 0; i < 3; i++) {
            newProposal.approvals[signers[i]] = false;
        }
        
        activeMintProposalId = proposalId;
        emit MintProposed(msg.sender, recipient, amount, proposalId);
        return proposalId;
    }

    function approveMint(bytes32 proposalId) external onlySigner {
        require(activeMintProposalId == proposalId, "Invalid proposal ID");
        MintProposal storage proposal = mintProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        emit MintApproved(msg.sender, proposalId);
    }

    function executeMint(bytes32 proposalId) external onlySigner {
        require(activeMintProposalId == proposalId, "Invalid proposal ID");
        MintProposal storage proposal = mintProposals[proposalId];
        
        require(proposal.recipient != address(0), "Invalid proposal");
        require(!proposal.executed, "Already executed");
        require(proposal.approvalCount >= 2, "Insufficient approvals");

        proposal.executed = true;
        _mint(proposal.recipient, proposal.amount);
        activeMintProposalId = 0;

        emit MintExecuted(proposal.recipient, proposal.amount, proposalId);
    }

    function isSigner(address addr) public view returns (bool) {
        for (uint i = 0; i < 3; i++) {
            if (signers[i] == addr) return true;
        }
        return false;
    }

    modifier onlySigner() {
        require(isSigner(msg.sender), "Not authorized signer");
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    // Helper view function
    function getProposalApprovalCount(bytes32 proposalId) public view returns (uint256) {
        return mintProposals[proposalId].approvalCount;
    }
}