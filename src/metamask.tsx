import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Insurance from './abi/Insurance.json';

// Contract details
const CONTRACT_ADDRESS = '0x81193f978ecd647b6e923bcfa5429728cc49baf8';
const CONTRACT_ABI = Insurance;

interface MetaMaskProps {
  account: string | null;
  setAccount: (account: string | null) => void;
  balance: string;
  setBalance: (balance: string) => void;
  policyDetails: {
    policyId: string;
    coverageAmount: string;
    validTill: string;
    active: boolean;
  } | null;
  setPolicyDetails: (details: any) => void;
  servicesCovered: string[];
  setServicesCovered: (services: string[]) => void;
}

export default function MetaMask({
  account,
  setAccount,
  balance,
  setBalance,
  policyDetails,
  setPolicyDetails,
  servicesCovered,
  setServicesCovered
}: MetaMaskProps) {
  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const getPolicyDetails = async (nullifier: bigint) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const policy = await contract.getPolicy(nullifier);

      setPolicyDetails({
        policyId: policy[0].toString(),
        coverageAmount: ethers.formatEther(policy[1]),
        validTill: new Date(Number(policy[2]) * 1000).toLocaleString(),
        active: policy[3]
      });

      // Get services covered
      const services = await contract.getServicesCovered(nullifier, policy[0]);
      setServicesCovered(services);

    } catch (error) {
      console.error('Error getting policy details:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(accounts[0]);
      await getBalance(accounts[0]);

      // Example nullifier - replace with actual nullifier from your application
      const exampleNullifier = BigInt('4793501817505575538924048611279876850818716643952814274999744302146285513718');
      await getPolicyDetails(exampleNullifier);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          getBalance(accounts[0]);

          // Example nullifier - replace with actual nullifier from your application
          const exampleNullifier = BigInt('4793501817505575538924048611279876850818716643952814274999744302146285513718');
          getPolicyDetails(exampleNullifier);
        }
      });

    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      setAccount(accounts[0] || null);
      if (accounts[0]) {
        getBalance(accounts[0]);

        // Example nullifier - replace with actual nullifier from your application
        const exampleNullifier = BigInt('4793501817505575538924048611279876850818716643952814274999744302146285513718');
        getPolicyDetails(exampleNullifier);
      }
      else {
        setBalance('0');
        setPolicyDetails(null);
        setServicesCovered([]);
      }
    });
  }, []);

  return (
    <div>
      {/* {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p>Balance: {balance} ETH</p>
          {policyDetails && (
            <>
              <h3>Policy Details:</h3>
              <p>Policy ID: {policyDetails.policyId}</p>
              <p>Coverage Amount: {policyDetails.coverageAmount} ETH</p>
              <p>Valid Till: {policyDetails.validTill}</p>
              <p>Active: {policyDetails.active.toString()}</p>
              <h4>Services Covered:</h4>
              <ul>
                {servicesCovered.map((service, index) => (
                  <li key={index}>{service}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )} */}
    </div>
  );
}
