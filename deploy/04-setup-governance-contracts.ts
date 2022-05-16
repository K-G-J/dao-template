import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from '../helper-functions';
import { ADDRESS_ZERO } from '../helper-hardhat.config';
import { ethers } from 'hardhat';

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // could use multicall contract here
  // const targets = [timeLock.address, timeLock.address];
  // const encodedFunctions = [
  //   await timeLock.getDataGrantProposerRole(governor.address),
  //   await timeLock.getDataGrantExecutorRole(governor.address),
  // ];
  // await timeLock.grant(
  //   await timeLock.TIMELOCK_ADMIN_ROLE(),
  //   roleMultiCall.address);

  // const multiCallResult = await roleMultiCall.multiCall(
  //   targets,
  //   encodedFunctions,
  // );
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executoreRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.ADMIN_ROLE();

  const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executoreRole, ADDRESS_ZERO) // once proposal has gone through anybody can execute it
  await executorTx.wait(1);
  // after decentralized access given, revoke admin role so all timelock actions must go through governance 
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
}

export default setupContracts;
setupContracts.tags = ['all', 'setup']; // sets up a tag so you can execute the script on its own (and its dependencies).