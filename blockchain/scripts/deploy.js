import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying RecraftSecurityProvenance with account:", deployer.address);

  const oracleAddress = process.env.ORACLE_PUBLIC_ADDRESS || deployer.address;
  console.log("Initial Oracle Signer Address:", oracleAddress);

  const RecraftSecurityProvenance = await hre.ethers.getContractFactory("RecraftSecurityProvenance");
  const contract = await RecraftSecurityProvenance.deploy(oracleAddress);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("RecraftSecurityProvenance deployed to:", contractAddress);

  const contractArtifact = await hre.artifacts.readArtifact("RecraftSecurityProvenance");

  const contractData = {
    address: contractAddress,
    network: hre.network.name,
    oracleSigner: oracleAddress,
    abi: contractArtifact.abi,
  };

  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendContractsDir, "RecraftSecurityProvenance.json"),
    JSON.stringify(contractData, null, 2)
  );

  const backendContractsDir = path.join(__dirname, "../../backend/security_provenance/contract_abi");
  if (!fs.existsSync(backendContractsDir)) {
    fs.mkdirSync(backendContractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(backendContractsDir, "RecraftSecurityProvenance.json"),
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract artifacts successfully synchronized to frontend and backend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
