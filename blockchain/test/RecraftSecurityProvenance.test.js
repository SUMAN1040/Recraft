import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("RecraftSecurityProvenance Smart Contract", function () {
  let contract;
  let owner, oracle, creator, attacker;

  beforeEach(async function () {
    [owner, oracle, creator, attacker] = await ethers.getSigners();

    const RecraftSecurityProvenance = await ethers.getContractFactory("RecraftSecurityProvenance");
    contract = await RecraftSecurityProvenance.deploy(oracle.address);
    await contract.waitForDeployment();
  });

  it("Should set the correct oracle signer and initial state", async function () {
    expect(await contract.oracleSigner()).to.equal(oracle.address);
    expect(await contract.name()).to.equal("Recraft AI Provenance");
    expect(await contract.symbol()).to.equal("RECRAFT");
  });

  it("Should successfully register and mint artwork with valid AI Oracle signature", async function () {
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("<svg>sample recraft vector</svg>"));
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes("cyberpunk vector cat"));
    const stylePreset = "vector_art";
    const modelVersion = "recraft-v3-vector";
    const tokenURI = "ipfs://QmTestRecraftVectorProvenanceMetadata";

    const nonce = await contract.userNonces(creator.address);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "bytes32", "string", "string", "uint256"],
      [creator.address, imageHash, promptHash, stylePreset, modelVersion, nonce]
    );

    const oracleSignature = await oracle.signMessage(ethers.getBytes(messageHash));

    const tx = await contract.connect(creator).registerAndMintArtwork(
      creator.address,
      imageHash,
      promptHash,
      stylePreset,
      modelVersion,
      tokenURI,
      oracleSignature
    );
    await tx.wait();

    const verification = await contract.verifyProvenance(imageHash);
    expect(verification.isAuthentic).to.equal(true);
    expect(verification.creator).to.equal(creator.address);
    expect(verification.stylePreset).to.equal(stylePreset);
    expect(verification.modelVersion).to.equal(modelVersion);
    expect(verification.tokenId).to.equal(1n);
    expect(await contract.ownerOf(1)).to.equal(creator.address);
  });

  it("Should reject registration with invalid signature (e.g. forged by attacker)", async function () {
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("<svg>tampered art</svg>"));
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes("forged prompt"));
    const stylePreset = "vector_art";
    const modelVersion = "recraft-v3-vector";
    const tokenURI = "ipfs://fake";

    const nonce = await contract.userNonces(creator.address);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "bytes32", "string", "string", "uint256"],
      [creator.address, imageHash, promptHash, stylePreset, modelVersion, nonce]
    );

    const fakeSignature = await attacker.signMessage(ethers.getBytes(messageHash));

    await expect(
      contract.connect(creator).registerAndMintArtwork(
        creator.address,
        imageHash,
        promptHash,
        stylePreset,
        modelVersion,
        tokenURI,
        fakeSignature
      )
    ).to.be.revertedWith("Invalid AI Oracle cryptographic signature");
  });

  it("Should prevent duplicate registration of the same image hash", async function () {
    const imageHash = ethers.keccak256(ethers.toUtf8Bytes("<svg>unique vector</svg>"));
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes("unique prompt"));
    const stylePreset = "3d_render";
    const modelVersion = "recraft-v3-vector";
    const tokenURI = "ipfs://unique";

    let nonce = await contract.userNonces(creator.address);
    let msgHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "bytes32", "string", "string", "uint256"],
      [creator.address, imageHash, promptHash, stylePreset, modelVersion, nonce]
    );
    let sig = await oracle.signMessage(ethers.getBytes(msgHash));

    await contract.connect(creator).registerAndMintArtwork(
      creator.address,
      imageHash,
      promptHash,
      stylePreset,
      modelVersion,
      tokenURI,
      sig
    );

    // Try registering duplicate hash
    nonce = await contract.userNonces(creator.address);
    msgHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "bytes32", "string", "string", "uint256"],
      [creator.address, imageHash, promptHash, stylePreset, modelVersion, nonce]
    );
    sig = await oracle.signMessage(ethers.getBytes(msgHash));

    await expect(
      contract.connect(creator).registerAndMintArtwork(
        creator.address,
        imageHash,
        promptHash,
        stylePreset,
        modelVersion,
        tokenURI,
        sig
      )
    ).to.be.revertedWith("Artwork hash already registered");
  });

  it("Should allow raw content verification directly", async function () {
    const rawContent = "<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='red'/></svg>";
    const rawBytes = ethers.toUtf8Bytes(rawContent);
    const imageHash = ethers.keccak256(rawBytes);
    const promptHash = ethers.keccak256(ethers.toUtf8Bytes("red circle icon"));
    const stylePreset = "icon_set";
    const modelVersion = "recraft-v3-vector";

    const nonce = await contract.userNonces(creator.address);
    const msgHash = ethers.solidityPackedKeccak256(
      ["address", "bytes32", "bytes32", "string", "string", "uint256"],
      [creator.address, imageHash, promptHash, stylePreset, modelVersion, nonce]
    );
    const sig = await oracle.signMessage(ethers.getBytes(msgHash));

    await contract.connect(creator).registerAndMintArtwork(
      creator.address,
      imageHash,
      promptHash,
      stylePreset,
      modelVersion,
      "ipfs://icon",
      sig
    );

    const check = await contract.verifyContentRaw(rawBytes);
    expect(check.isAuthentic).to.equal(true);
    expect(check.creator).to.equal(creator.address);
    expect(check.stylePreset).to.equal("icon_set");

    const tamperedBytes = ethers.toUtf8Bytes(rawContent + "<!-- injected malformed content -->");
    const tamperedCheck = await contract.verifyContentRaw(tamperedBytes);
    expect(tamperedCheck.isAuthentic).to.equal(false);
  });
});
