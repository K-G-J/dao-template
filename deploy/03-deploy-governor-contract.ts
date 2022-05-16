import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from '../helper-functions';
import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY
} from '../helper-hardhat.config';

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  // get other contracts for params
  const governanceToken = await get('GovernanceToken');
  const timeLock = await get('TimeLock');

  log('----------------------------------------------------');
  log('Deploying GovernorContract and waiting for confirmations...');
  const governorContract = await deploy('GovernorContract', {
    from: deployer,
    args: [
      governanceToken.address,
      timeLock.address,
      VOTING_DELAY,
      VOTING_PERIOD,
      QUORUM_PERCENTAGE
    ],
    log: true,
    // wait if on live network to verify properly
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1
  });
  log(`GovernorContract at ${governorContract.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(governorContract.address, []);
  }
};

export default deployGovernorContract;
deployGovernorContract.tags = ['all', 'governor']; // sets up a tag so you can execute the script on its own (and its dependencies).
