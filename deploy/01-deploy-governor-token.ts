import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat.config"
import { ethers } from 'hardhat';

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log('----------------------------------------------------');
  log('Deploying GovernanceToken and waiting for confirmations...');
  const governanceToken = await deploy('GovernanceToken', {
    from: deployer,
    args: [],
    log: true,
    // wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1
  });
  log(`Deployed governance token to address ${governanceToken.address}`);
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY)
  {
    await verify(governanceToken.address, []);
  }
  await delegate(governanceToken.address, deployer);
  log("Delegated!")
};

const delegate = async (governanceTokenAdress: string, delegatedAccount: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAdress);
  const tx = await governanceToken.delegate(delegatedAccount);
  await tx.wait(1);
  console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}

export default deployGovernanceToken;
deployGovernanceToken.tags = ['all', 'governor']; // sets up a tag so you can execute the script on its own (and its dependencies).
