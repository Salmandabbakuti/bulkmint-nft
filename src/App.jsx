import { useState, useEffect } from 'react';
import papaparse from 'papaparse';
import { create } from "ipfs-http-client";
import { ethers, Contract } from 'ethers';
import './App.css';

const ipfsClient = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "string", "name": "_uri", "type": "string" }], "name": "createToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "_ids", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "_amounts", "type": "uint256[]" }, { "internalType": "string[]", "name": "_uris", "type": "string[]" }], "name": "mintBatchTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "safeBatchTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }, { "indexed": false, "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "TransferBatch", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "TransferSingle", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "value", "type": "string" }, { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "URI", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "accounts", "type": "address[]" }, { "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }], "name": "balanceOfBatch", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "currentTokenId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "uri", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }];
const address = '0xBba0da6b11371A8402aE5BCAa0Fad1Cac1128d33'

export default function App() {
  const [csvRecords, setCsvRecords] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        console.log('chainId:', chainId);
        const signer = provider.getSigner();
        if (chainId !== 4) {
          console.error('Wrong Network. Please connect to the Rinkeby testnet');
          return
        }
        const contract = new Contract(address, abi, signer);
        setContract(contract);
        console.log('contract:', contract);
        const currentTokenId = await contract.currentTokenId()
        console.log('current tokenId: ', currentTokenId.toNumber());
      }
    }
    init().catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' }).catch((err) => console.error(err));
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log(`Using account ${accounts[0]}`);
        } else {
          console.error('No accounts found');
        }
      });
      // listen for messages from metamask
      window.ethereum.on('message', (message) => console.log(message));
      // listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(`Chain changed to ${chainId}`);
        window.location.reload();
      });
      // Subscribe to provider connection
      window.ethereum.on("connect", (info) => {
        console.log('Connected to network:', info);
      });
      // Subscribe to provider disconnection
      window.ethereum.on("disconnect", (error) => {
        console.log('disconnected from network: ', error);
      });
    } else {
      console.error('No ethereum browser detected');
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      papaparse.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: ({ data }) => {
          console.log("Finished import:", data);
          setCsvRecords(data);
        }
      }
      )
    }
  };

  const prepareMintInputData = async (records) => {
    try {
      const currentTokenId = await contract.currentTokenId();
      const tokenIds = Array(records.length).fill().map((_, i) => i + currentTokenId.toNumber());
      // const tokenAmounts = Array(tokenIds.length).fill(1);
      const tokenAmounts = records.map(({ quantity }) => quantity);
      const metadatas = records.map(({ name, description, image, external_url, quantity, ...rest }) => ({ name, description, image, external_url, properties: rest }));
      const tokenURIs = await Promise.all(metadatas.map(async (metadata) => {
        const { path } = await ipfsClient.add(JSON.stringify(metadata));
        return `https://ipfs.io/ipfs/${path}`;
      }));
      return { tokenIds, tokenAmounts, tokenURIs, metadatas };
    } catch (err) {
      console.error(err.message);
      return { tokenIds: [], tokenAmounts: [], tokenURIs: [], metadatas: [] };
    }
  }

  const handleMintBatchTokens = async () => {
    try {
      const { tokenIds, tokenAmounts, tokenURIs, metadatas } = await prepareMintInputData(csvRecords);
      if (!tokenIds.length) return alert('No records to mint');
      console.log('Final mint input data:', { tokenURIs, tokenIds, tokenAmounts, metadatas });
      const tx = await contract.mintBatchTokens(tokenIds, tokenAmounts, tokenURIs);
      await tx.wait();
      console.log('Tokens minted..');
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h3 className="App-title">CSV Batch Mint NFT</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
        <button onClick={handleMintBatchTokens}>Mint Tokens</button>
      </header>
    </div>
  );
};