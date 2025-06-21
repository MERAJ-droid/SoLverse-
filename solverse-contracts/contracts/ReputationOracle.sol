// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationOracle
 * @dev Handles peer verifications, trust scores, and AVAX rewards.
 */
contract ReputationOracle is Ownable(msg.sender) {
    struct Verification {
        address subject;
        address verifier;
        string reason;
        uint256 timestamp;
        string contributionId; // UUID from Supabase
    }

    Verification[] public verifications;
    mapping(address => uint256) public trustScores;
    mapping(string => uint256) public contributionBalances; 
    mapping(string => mapping(address => uint256)) public verifierStakes; 
    address public daoTreasury;
    uint256 public daoFeeBps = 500; // 5% (500 basis points)

    event Verified(address indexed subject, address indexed verifier, string reason, string contributionId);
    event RewardClaimed(string contributionId, address indexed contributor, uint256 amount, uint256 daoFee);
    event VerifierSlashed(string contributionId, address verifier, uint256 amount);

    constructor() {
        daoTreasury = 0xBDdbB7b866e2549066E0BFD27c409900156d1470;
    }

    /**
     * @dev Submit a peer verification.
     * @param subject The address being verified.
     * @param reason The reason for verification.
     * @param contributionId The UUID of the contribution.
     */
    function submitVerification(address subject, string memory reason, string memory contributionId) external payable {
        require(subject != address(0), "Invalid subject");
        require(subject != msg.sender, "Cannot verify self");
        require(msg.value >= 0.01 ether, "Insufficient AVAX sent");
        verifications.push(Verification(subject, msg.sender, reason, block.timestamp, contributionId));
        trustScores[subject] += 10; // 1.0
        trustScores[msg.sender] += 5; // 0.5
        contributionBalances[contributionId] += msg.value;
        verifierStakes[contributionId][msg.sender] += msg.value;
        emit Verified(subject, msg.sender, reason, contributionId);
    }

    /**
     * @dev Claim AVAX reward for a contribution (admin only, after SBT mint).
     * @param contributionId The UUID of the contribution.
     * @param contributor The address to receive the reward.
     */
    function claimReward(string memory contributionId, address contributor) external onlyOwner {
        uint256 balance = contributionBalances[contributionId];
        require(balance > 0, "No reward to claim");
        uint256 daoFee = (balance * daoFeeBps) / 10000;
        uint256 payout = balance - daoFee;
        contributionBalances[contributionId] = 0;
        (bool sent1, ) = contributor.call{value: payout}("");
        require(sent1, "Failed to send AVAX to contributor");
        (bool sent2, ) = daoTreasury.call{value: daoFee}("");
        require(sent2, "Failed to send AVAX to DAO");
        emit RewardClaimed(contributionId, contributor, payout, daoFee);
    }

    function getVerificationCount() external view returns (uint256) {
        return verifications.length;
    }

    function getTrustScore(address user) external view returns (uint256) {
        return trustScores[user];
    }

    // (Optional) Admin can update DAO treasury address
    function setDaoTreasury(address newTreasury) external onlyOwner {
        daoTreasury = newTreasury;
    }

    // (Optional) Admin can update DAO fee
    function setDaoFeeBps(uint256 newBps) external onlyOwner {
        require(newBps <= 1000, "Fee too high"); // Max 10%
        daoFeeBps = newBps;
    }

    function slashVerifier(string memory contributionId, address verifier) external onlyOwner {
        uint256 stake = verifierStakes[contributionId][verifier];
        require(stake > 0, "No stake to slash");
        verifierStakes[contributionId][verifier] = 0;
        contributionBalances[contributionId] -= stake;
        (bool sent, ) = daoTreasury.call{value: stake}("");
        require(sent, "Failed to send slashed AVAX to DAO");
        emit VerifierSlashed(contributionId, verifier, stake);
    }
}