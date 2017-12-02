pragma solidity ^0.4.4;

import "./InvestmentFund.sol";

contract InvestmentFundFakeTime is InvestmentFund {
    uint private fakeClockTime;

    function InvestmentFundFakeTime(uint8 _availableDaysForWithdrawal) InvestmentFund(_availableDaysForWithdrawal) public {
    }

    function getTime() internal constant returns (uint) {
        return fakeClockTime != 0 ? fakeClockTime : now;
    }

    function setCurrentTime(uint time) public {
        fakeClockTime = time;
    }
}