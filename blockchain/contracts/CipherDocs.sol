// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CipherDocs {

    struct Certificate {
        bytes32 documentHash;
        string ipfsCID;
        address user;
        address issuer;
        uint256 issuedAt;
        uint256 expiry;
        bool revoked;
    }

    uint256 public certificateCounter;

    mapping(uint256 => Certificate) public certificates;

    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed user,
        address indexed issuer
    );

    event CertificateRevoked(uint256 indexed certificateId);

    function issueCertificate(
        bytes32 _documentHash,
        string memory _ipfsCID,
        address _user,
        uint256 _expiry
    ) public {

        require(_user != address(0), "Invalid user address");

        certificateCounter++;

        certificates[certificateCounter] = Certificate({
            documentHash: _documentHash,
            ipfsCID: _ipfsCID,
            user: _user,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiry: _expiry,
            revoked: false
        });

        emit CertificateIssued(certificateCounter, _user, msg.sender);
    }

    function revokeCertificate(uint256 _certificateId) public {

        Certificate storage cert = certificates[_certificateId];

        require(cert.issuer == msg.sender, "Only issuer can revoke");
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;

        emit CertificateRevoked(_certificateId);
    }

    function getCertificate(uint256 _certificateId)
        public
        view
        returns (Certificate memory)
    {
        return certificates[_certificateId];
    }
}
