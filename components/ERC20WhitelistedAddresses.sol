// SPDX-License-Identifier: MIT
// Creator: andreitoma8
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract ERC20WhitelistedAddresses is ERC20 {
    
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {

        _mint(msg.sender, 1000000000000000000000000000000000 * 10 ** 18);
    }
    // isso é um teste
    //Mapping para determinar se o endereço em questão pertence a um grupo seleteo de endereços que podem manusear o token.
    mapping(address => bool) public isAllowed;

    function setIsAllowed(address _address, bool _bool) public onlyOwner {
        isAllowed[_address] = _bool;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(isAllowed[to] == true, "Address 'to' not allowed to manage tokens");
        address owner = _msgSender();
        _transfer(owner, owner, amount);
        return false;
    }
    // isso é um teste
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(isAllowed[to] == true, "Address 'to' not allowed to manage tokens");
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }


}
