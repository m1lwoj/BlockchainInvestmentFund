var ConvertLib = artifacts.require("./ConvertLib.sol");
var InvestmentFund = artifacts.require("./InvestmentFund.sol");

async function deploy(deployer) {
  const DAYS_FOR_WITHDRAWAL = 14;

  await deployer.deploy(
    InvestmentFund,
    DAYS_FOR_WITHDRAWAL
  );
}

module.exports = function (deployer) {
  deployer.then(() => deploy(deployer));
};
