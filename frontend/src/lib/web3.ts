import { ethers } from "ethers";
import contractArtifact from "@/contracts/RecraftSecurityProvenance.json";

export interface ProvenanceVerificationResult {
  isAuthentic: boolean;
  creator: string;
  stylePreset: string;
  modelVersion: string;
  generatedAt: number;
  tokenId: number;
}

export const CONTRACT_ADDRESS = contractArtifact.address || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = contractArtifact.abi;

export async function getWeb3Provider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    return provider;
  }
  return null;
}

export async function connectWallet(): Promise<{ address: string; signer: ethers.Signer } | null> {
  const provider = await getWeb3Provider();
  if (!provider) {
    alert("Please install MetaMask or another Web3 browser wallet to connect!");
    return null;
  }
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { address, signer };
}

export async function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  if (!signerOrProvider) {
    const provider = await getWeb3Provider();
    if (!provider) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

export async function mintArtworkProvenanceOnChain(
  creatorAddress: string,
  imageHash: string,
  promptHash: string,
  stylePreset: string,
  modelVersion: string,
  tokenURI: string,
  oracleSignature: string
) {
  const wallet = await connectWallet();
  if (!wallet) throw new Error("Wallet not connected");

  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet.signer);

  const tx = await contract.registerAndMintArtwork(
    creatorAddress,
    imageHash,
    promptHash,
    stylePreset,
    modelVersion,
    tokenURI,
    oracleSignature
  );

  const receipt = await tx.wait();
  return {
    transactionHash: receipt.hash,
    status: receipt.status === 1,
  };
}

export async function verifyProvenanceOnChain(imageHash: string): Promise<ProvenanceVerificationResult> {
  try {
    const provider = await getWeb3Provider();
    const contract = provider
      ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      : null;

    if (!contract) {
      return {
        isAuthentic: false,
        creator: "",
        stylePreset: "",
        modelVersion: "",
        generatedAt: 0,
        tokenId: 0,
      };
    }

    const res = await contract.verifyProvenance(imageHash);
    return {
      isAuthentic: res[0],
      creator: res[1],
      stylePreset: res[2],
      modelVersion: res[3],
      generatedAt: Number(res[4]),
      tokenId: Number(res[5]),
    };
  } catch (err) {
    console.warn("On-chain check fallback:", err);
    return {
      isAuthentic: false,
      creator: "",
      stylePreset: "",
      modelVersion: "",
      generatedAt: 0,
      tokenId: 0,
    };
  }
}

export function computeKeccak256(content: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(content));
}
