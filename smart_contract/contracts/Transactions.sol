//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Transactions {
    uint256 trasactionCount;
    event Transfer(address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }
    TransferStruct[] transactions;

    function addToBlockchain(address payable _receiver, uint _amount, string memory _message, string memory _keyword) public {
        trasactionCount += 1;
        transactions.push(TransferStruct(msg.sender, _receiver, _amount, _message, block.timestamp, _keyword));
        emit Transfer(msg.sender, _receiver, _amount, _message, block.timestamp, _keyword);
    }

    function getAllTransactions() public view returns(TransferStruct[] memory){
        return transactions;
    }

    function getTransactionCount() public view returns(uint256){
        return trasactionCount;
    }

}
