pragma solidity ^0.4.4;

contract InvestmentFund {
    struct BalanceDetails {
        uint amount;
        uint firstDepositTime; 
        bool initialized; 
    }
    
    uint8 private availableDaysForWithdrawal;
    mapping (address => BalanceDetails) private balances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    function InvestmentFund(uint8 _availableDaysForWithdrawal) public {
         require(_availableDaysForWithdrawal >= 0);
         availableDaysForWithdrawal = _availableDaysForWithdrawal;
    }

    function getTime() internal constant returns (uint) {
        return now;
    }

    function getMyBalance() public constant returns (uint) {
       uint balance = 0;
       
       if(balances[msg.sender].initialized) {
           balance = balances[msg.sender].amount;
       }

       return balance;
    }

    function deposit (uint amount) public {
        require(amount > 0);
        
        if (balances[msg.sender].initialized) {
            balances[msg.sender].amount += amount;
        } else {
          balances[msg.sender] = BalanceDetails({
                amount: amount, 
                firstDepositTime: getTime(), 
                initialized: true
            });
        }
        
        Transfer(msg.sender, this, amount);
    }
    
    function withdraw (uint amount) public {
        require(amount > 0);
        require(balances[msg.sender].initialized);
        require(balances[msg.sender].amount >= amount);
        
        var isWithdrawalAvailable = balances[msg.sender].firstDepositTime > getTime() - availableDaysForWithdrawal * 1 days;
        require(isWithdrawalAvailable);

        balances[msg.sender].amount -= amount;
        Transfer(this, msg.sender, amount);
    }
}