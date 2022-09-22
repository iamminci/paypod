# PayPod Protocol Contract

## Roles:

1. `Owner` (withdraw, setControllers, pause/unpause contract)
2. `Controllers` (spend tokens, make contract calls)

## Core functionalities:

1. Spend/SpendERC20
2. Call (`CALL` or `CREATE`)
3. Withdraw/WithdrawERC20
4. Pause/Unpause

---

## Controller Function Interface

### Spend

`function spend(address _recipient, uint256 _amount) external onlyController whenNotPaused whenNotExpired`

Native token spend function for controllers to transfer specified amount of token to recipient

### SpendERC20

`function spendERC20( address _tokenAddress, address _recipient, uint256 _amount ) external onlyController whenNotPaused whenNotExpired`

ERC20 token spend function for controllers to transfer specified amount of token to recipient

### Execute Contract Call / Deploy contract

`function call(uint256 operation, address to, uint256 value, bytes memory data ) public payable virtual onlyOwner whenNotPaused whenNotExpired returns (bytes memory result)`

Function to execute arbitrary `CALL` or `CREATE` where operation = 0 is `CALL` and operation = 1 is `CREATE`

---

## Owner Function Interface

### Withdraw

`function withdraw(uint256 _amount, bool _withdrawAll) external onlyOwner`

Withdraw function for owner to transfer specified native token balance to themselves (\_withdrawAll sends entire balance)

### WithdrawERC20

`function withdrawERC20( address _tokenAddress, uint256 _amount, bool _withdrawAll ) external onlyOwner`

Withdraw function for owner to transfer specified ERC20 token balance to themselves (\_withdrawAll sends entire balance)

### Pause

`function pause() public onlyOwner`

Pauses controller functionalities on the pod.

### Unpause

`function unpause() public onlyOwner`

Unpauses controller functionalities on the pod.
