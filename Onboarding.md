# Onboarding Guide for Web3 Games

Please read the [README](./contracts/README.md) for the PayPod contracts to learn in detail how the contract functions.

## Examples on how to use contract methods

### Spend

`function spend(address _recipient, uint256 _amount) external onlyController whenNotPaused whenNotExpired`

Native token spend function for controllers to transfer specified amount of token to recipient

```javascript
// Spend native tokens held within player's pod
const paypodContract = new web3.eth.Contract(PayPodContract.abi, paypodAddress);

const receipt = await paypodContract.methods.spend(recipient, amount);
```

### SpendERC20

`function spendERC20( address _tokenAddress, address _recipient, uint256 _amount ) external onlyController whenNotPaused whenNotExpired`

ERC20 token spend function for controllers to transfer specified amount of token to recipient

```javascript
// Spend ERC20 tokens held within player's pod
const paypodContract = new web3.eth.Contract(PayPodContract.abi, paypodAddress);

const receipt = await paypodContract.methods.spendERC20(
  pizzaTokenContractAddress,
  recipient,
  amount
);
```

### Execute Contract Call / Deploy contract

`function call(uint256 operation, address to, uint256 value, bytes memory data ) public payable virtual onlyOwner whenNotPaused whenNotExpired returns (bytes memory result)`

Function to execute arbitrary `CALL` or `CREATE` where operation = 0 is `CALL` and operation = 1 is `CREATE`

```javascript
// Initialize payload for game contract method
const myGameContract = new web3.eth.Contract(MyGameContract.abi, gameAddress);

const killAndGainXPPayload = await myGameContract.methods
        .killAndGainXP()
        .encodeABI();

// Execute call method on paypodContract with payload
const paypodContract = new web3.eth.Contract(PayPodContract.abi, paypodAddress);

const receipt = await paypodContract.methods
        .call(0, gameAddress, 0 killAndGainXPPayload)
        .send({ from: address });
```
