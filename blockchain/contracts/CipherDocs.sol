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

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(
        bytes32 indexed certificateId,
        address indexed user,
        address indexed issuer
    );

    event CertificateRevoked(bytes32 indexed certificateId);

    function issueCertificate(
        bytes32 _certificateId,
        bytes32 _documentHash,
        string memory _ipfsCID,
        address _user,
        uint256 _expiry
    ) public {

        require(_user != address(0), "Invalid user address");
        require(certificates[_certificateId].issuer == address(0), "Certificate already exists");

        certificates[_certificateId] = Certificate({
            documentHash: _documentHash,
            ipfsCID: _ipfsCID,
            user: _user,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            expiry: _expiry,
            revoked: false
        });

        emit CertificateIssued(_certificateId, _user, msg.sender);
    }

    function revokeCertificate(bytes32 _certificateId) public {

        Certificate storage cert = certificates[_certificateId];

        require(cert.issuer == msg.sender, "Only issuer can revoke");
        require(!cert.revoked, "Already revoked");

        cert.revoked = true;

        emit CertificateRevoked(_certificateId);
    }

    function getCertificate(bytes32 _certificateId)
        public
        view
        returns (Certificate memory)
    {
        return certificates[_certificateId];
    }
}
