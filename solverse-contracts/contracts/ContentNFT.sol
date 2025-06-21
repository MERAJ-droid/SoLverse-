// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContentNFT
 * @dev NFT for user-generated content, metadata on IPFS.
 */
contract ContentNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    event Minted(address indexed to, uint256 indexed tokenId, string ipfsHash);

    constructor() ERC721("Solverse Content NFT", "SVNFT") Ownable(msg.sender) {}

    function mint(address to, string memory ipfsHash) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        emit Minted(to, tokenId, ipfsHash);
    }

    // ===== Required overrides for Solidity multiple inheritance (OZ v5.x) =====

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }


    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}