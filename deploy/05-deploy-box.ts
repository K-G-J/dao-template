import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from '../helper-functions';
import { networkConfig, developmentChains } from '../helper-hardhat.config';
import { ethers } from 'hardhat';

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log('----------------------------------------------------');
  log('Deploying Box and waiting for confirmations...');
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1
  })
  log(`Box at ${box.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY)
  {
    await verify(box.address, [])
  }
  // give box ownership to timeLock
  const timeLock = await ethers.getContract("TimeLock");
  const boxContract = await ethers.getContractAt("Box", box.address);
  const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
  await transferOwnerTx.wait(1);
}

export default deployBox;
deployBox.tags = ['all', 'box']; // sets up a tag so you can execute the script on its own (and its dependencies).
