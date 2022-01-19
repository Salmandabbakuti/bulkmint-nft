// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract MyCollectible is ERC1155 {
    
    string public name;
    string public symbol;
    address public owner;
    uint256 public currentTokenId;

    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") {       
        name = "MyCollectible";
        symbol = "MYC";
        owner  = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
        return(_tokenURIs[tokenId]);
    }

    function createToken(uint _amount, string memory _uri) public onlyOwner {
        _mint(msg.sender, currentTokenId, _amount, "");
        _tokenURIs[currentTokenId] = _uri;
        currentTokenId++;
    }

    function mintBatchTokens(uint256[] memory _ids, uint256[] memory _amounts, string[] memory _uris) public onlyOwner {
        _mintBatch(msg.sender, _ids, _amounts, "");
        currentTokenId += _ids.length;
        for (uint i = 0; i < _ids.length; i++) {
            _tokenURIs[_ids[i]] = _uris[i];
        }
    }
}