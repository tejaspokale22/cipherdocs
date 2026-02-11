"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function TestAuth() {
  const [wallet, setWallet] = useState("");
  const [nonce, setNonce] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  };

  const requestNonce = async () => {
    const res = await fetch("http://localhost:5000/api/auth/request-nonce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: wallet }),
    });

    const data = await res.json();
    setNonce(data.nonce);
    console.log("Nonce:", data.nonce);
  };

  const signAndVerify = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const message = `Login to CipherDocs: ${nonce}`;
    const signature = await signer.signMessage(message);

    const res = await fetch("http://localhost:5000/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: wallet,
        signature,
      }),
    });

    const data = await res.json();
    console.log("Verify Response:", data);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Test Web3 Auth</h2>

      <button onClick={connectWallet}>Connect Wallet</button>
      <br />
      <br />

      <button onClick={requestNonce} disabled={!wallet}>
        Request Nonce
      </button>
      <br />
      <br />

      <button onClick={signAndVerify} disabled={!nonce}>
        Sign & Verify
      </button>
    </div>
  );
}
