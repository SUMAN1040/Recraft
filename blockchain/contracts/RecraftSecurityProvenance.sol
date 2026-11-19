// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RecraftSecurityProvenance
 * @dev Cryptographic Security & Provenance Registry for Recraft AI Artworks & Vector Assets.
 * Ensures authenticity, copyright protection, tamper-proofing, and ownership via on-chain proof.
 */
contract RecraftSecurityProvenance is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 private _nextTokenId;

    // Trusted backend oracle address that validates legitimate AI generation runs
    address public oracleSigner;

    struct ArtworkProvenance {
        uint256 tokenId;
        address creator;
        bytes32 imageHash;         // Keccak-256 hash of the SVG/raster binary content
        bytes32 promptHash;        // Keccak-256 hash of the generation prompt
        string stylePreset;        // e.g., "vector_art", "3d_render", "digital_illustration"
        string modelVersion;       // e.g., "recraft-v3-vector"
        uint256 generatedAt;       // Timestamp when generated
        bool isCommercialLicensed; // Commercial licensing flag
    }

    // Mapping from imageHash to ArtworkProvenance record
    mapping(bytes32 => ArtworkProvenance) public provenanceRecords;

    // Mapping to prevent registering duplicate image hashes
    mapping(bytes32 => bool) public isHashRegistered;

    // Mapping from tokenId to imageHash
    mapping(uint256 => bytes32) public tokenToImageHash;

    // Nonce tracking for signature replay attack prevention
    mapping(address => uint256) public userNonces;

    // Events
    event ArtworkRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 indexed imageHash,
        string stylePreset,
        uint256 timestamp
    );
    event OracleSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event CommercialLicenseGranted(bytes32 indexed imageHash, address indexed licensee);

    constructor(address _initialOracleSigner)
        ERC721("Recraft AI Provenance", "RECRAFT")
        Ownable(msg.sender)
    {
        require(_initialOracleSigner != address(0), "Invalid oracle address");
        oracleSigner = _initialOracleSigner;
        _nextTokenId = 1;
    }

    /**
     * @notice Update trusted oracle signer
     */
    function setOracleSigner(address _newOracleSigner) external onlyOwner {
        require(_newOracleSigner != address(0), "Invalid oracle signer");
        address oldSigner = oracleSigner;
        oracleSigner = _newOracleSigner;
        emit OracleSignerUpdated(oldSigner, _newOracleSigner);
    }

    /**
     * @notice Registers and mints an authentic AI artwork with cryptographic oracle verification
     * @param to Recipient address (creator)
     * @param imageHash Keccak-256 hash of the generated asset
     * @param promptHash Keccak-256 hash of the prompt used
     * @param stylePreset Recraft style preset (e.g. vector_art, 3d_render)
     * @param modelVersion AI model version string
     * @param tokenURI Metadata URI (IPFS / Arweave / API metadata)
     * @param oracleSignature Signature from Recraft AI backend oracle proving genuine generation
     */
    function registerAndMintArtwork(
        address to,
        bytes32 imageHash,
        bytes32 promptHash,
        string calldata stylePreset,
        string calldata modelVersion,
        string calldata tokenURI,
        bytes calldata oracleSignature
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), "Recipient is zero address");
        require(!isHashRegistered[imageHash], "Artwork hash already registered");

        // Verify Oracle Signature to prevent forgery & unauthorized minting
        bytes32 messageHash = keccak256(
            abi.encodePacked(to, imageHash, promptHash, stylePreset, modelVersion, userNonces[to])
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(oracleSignature);
        require(recoveredSigner == oracleSigner, "Invalid AI Oracle cryptographic signature");

        // Increment nonce for security against replay attacks
        userNonces[to]++;

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        provenanceRecords[imageHash] = ArtworkProvenance({
            tokenId: tokenId,
            creator: to,
            imageHash: imageHash,
            promptHash: promptHash,
            stylePreset: stylePreset,
            modelVersion: modelVersion,
            generatedAt: block.timestamp,
            isCommercialLicensed: true
        });

        isHashRegistered[imageHash] = true;
        tokenToImageHash[tokenId] = imageHash;

        emit ArtworkRegistered(tokenId, to, imageHash, stylePreset, block.timestamp);
        return tokenId;
    }

    /**
     * @notice Public verification function for anti-tamper security
     * @param imageHash Hash of the asset to verify
     */
    function verifyProvenance(bytes32 imageHash)
        external
        view
        returns (
            bool isAuthentic,
            address creator,
            string memory stylePreset,
            string memory modelVersion,
            uint256 generatedAt,
            uint256 tokenId
        )
    {
        if (!isHashRegistered[imageHash]) {
            return (false, address(0), "", "", 0, 0);
        }

        ArtworkProvenance memory record = provenanceRecords[imageHash];
        return (
            true,
            record.creator,
            record.stylePreset,
            record.modelVersion,
            record.generatedAt,
            record.tokenId
        );
    }

    /**
     * @notice Verify raw content directly against the registry
     * @param rawContent The full binary / SVG text bytes of the artwork
     */
    function verifyContentRaw(bytes calldata rawContent)
        external
        view
        returns (
            bool isAuthentic,
            address creator,
            string memory stylePreset,
            uint256 generatedAt
        )
    {
        bytes32 computedHash = keccak256(rawContent);
        if (!isHashRegistered[computedHash]) {
            return (false, address(0), "", 0);
        }
        ArtworkProvenance memory record = provenanceRecords[computedHash];
        return (true, record.creator, record.stylePreset, record.generatedAt);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
