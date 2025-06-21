// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundToken
 * @dev Non-transferable ERC721 token for DAO contributions.
 */
contract SoulboundToken is ERC721URIStorage, Ownable(msg.sender) {
    uint256 public nextTokenId;
    mapping(address => uint256) public soulboundCount; // Track how many SBTs each address has

    event Minted(address indexed to, uint256 indexed tokenId, string dao, string reason);

    constructor() ERC721("Solverse Soulbound", "SBT") {}

    /**
     * @dev Mint a new soulbound token for a user.
     * @param to The recipient address.
     * @param dao The DAO name.
     * @param reason The reason for minting.
     * @param tokenURI The metadata URI (IPFS).
     */
    function mint(address to, string memory dao, string memory reason, string memory tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        soulboundCount[to] += 1; // Increment SBT count for this address
        emit Minted(to, tokenId, dao, reason);
    }

    // Override _update to block transfers (soulbound)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId); 
        require(from == address(0) || to == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }
}