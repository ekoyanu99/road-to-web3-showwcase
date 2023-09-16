import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const STAKE_ABI = require("../../../utils/Stake.json");
const TREASURY_ABI = require("../../../utils/Treasury.json");
import Image from "next/image";
import { Network, Alchemy } from "alchemy-sdk";

export default function Week6Component() {

    // Contract Address & ABI Stake
    const contractAddress = "0x506dD23Eac80C5D724286D1fE461976f7Ed12FDD";
    const contractABI = STAKE_ABI;

    // CA & ABI Treasury
    const treasuryAddress = "0x9b8998fC4854bEcf4Dae29Df80C6CA5A6e578Cfc";
    const treasuryABI = TREASURY_ABI;

    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    const settings = {
        apiKey: process.env.ALCHEMY_GOERLI_API_KEY,
        network: Network.ETH_GOERLI,
    };
    const alchemy = new Alchemy(settings);
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [currentChain, setcurrentChain] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [isDepositing, setisDepositing] = useState(false);
    const [isWithdrawing, setisWithdrawing] = useState(false);
    const [isStaking, setisStaking] = useState(false);
    const [isUnstaking, setisUnstaking] = useState(false);

    const [errorDeposit, seterrorDeposit] = useState(null);
    const [errorWithdraw, seterrorWithdraw] = useState(null);
    const [errorStake, seterrorStake] = useState(null);
    const [errorUnstake, seterrorUnstake] = useState(null);

    const [appBalance, setappBalance] = useState(0);
    const [depositAmount, setdepositAmount] = useState(0);
    const [walletBalance, setwalletBalance] = useState(0);
    const [currentGas, setcurrentGas] = useState(0);

    const [walletBalanceBigNumber, setWalletBalanceBigNumber] = useState(null);
    const [availableBalanceForDeposit, setAvailableBalanceForDeposit] = useState(0);

    // Stake
    const [stakedBalance, setstakedBalance] = useState(0);
    const [stakeAmount, setstakeAmount] = useState(0);
    const [stakeTime, setstakeTime] = useState(null);
    const [stakeInterestRate, setstakeInterestRate] = useState(1);

    // Treasury
    const [treasuryBalance, settreasuryBalance] = useState(0);
    const [treasuryStakers, settreasuryStakers] = useState(0);
    const [treasuryMinStakeSeconds, settreasuryMinStakeSeconds] = useState(0);
    const [treasuryMaxStakeSeconds, settreasuryMaxStakeSeconds] = useState(0);
    const [treasuryWithdrawalEndSeconds, settreasuryWithdrawalEndSeconds] = useState(0);


    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    useEffect(() => {
        if (signer) {
            fetchWalletBalance();
            fetchAppBalance();
            fetchStakedBalance();
            fetchTreasuryInfo();
        }
    }, [signer]);

    useEffect(() => {
        if (walletBalanceBigNumber) {
            fetchDepositGas();
        }
    }, [walletBalanceBigNumber])

    const checkIfWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                setCurrentAccount(address);
            } else {
                setCurrentAccount(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchWalletBalance = async () => {
        try {
            if (chain.name === "Goerli") {
                const balance = await alchemy.core.getBalance(currentAccount, "latest");

                setWalletBalanceBigNumber(balance);

                let remainder = balance.mod(1e14);
                let balanceInEth = ethers.utils.formatEther(balance.sub(remainder));

                setwalletBalance(+balanceInEth);
            } else {
                console.log("Please change to goerli network");
                switchNetwork(5);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchAppBalance = async () => {
        try {

            const stakerContract = new Contract(contractAddress, contractABI, signer);
            const balance = await stakerContract.getBalance(currentAccount);
            let remainder = balance.mod(1e14);
            let balanceInEth = ethers.utils.formatEther(balance.sub(remainder));

            setappBalance(+balanceInEth);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStakedBalance = async () => {
        try {
            const stakerContract = new Contract(contractAddress, contractABI, signer);
            const balance = await stakerContract.getStake(currentAccount);
            let remainder = balance.mod(1e14);
            let balanceInEth = ethers.utils.formatEther(balance.sub(remainder));

            setstakedBalance(+balanceInEth);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDepositGas = async () => {
        try {

            const gasPrice = await alchemy.core.getGasPrice();

            const depositGas = gasPrice.mul(210000000000 * 3);

            const depositFees = parseFloat(ethers.utils.formatEther(depositGas));

            const availableBalance = walletBalanceBigNumber.sub(depositGas);

            let remainder = availableBalance.mod(1e14);

            const availableBalanceInEth = parseFloat(ethers.utils.formatEther(availableBalance.sub(remainder))) - depositFees;

            setAvailableBalanceForDeposit(availableBalanceInEth);
        } catch (err) {
            console.error("error fetch deposit gas", err);
        }
    };


    const deposit = async () => {
        if (!depositAmount) {
            seterrorDeposit("Please enter an amount");
            return;
        }

        setisDepositing(true);
        seterrorDeposit(null);

        try {
            const tx = await signer.sendTransaction({
                from: currentAccount,
                to: contractAddress,
                value: ethers.utils.parseEther(depositAmount),
            });

            await tx.wait();

            await fetchWalletBalance();
            await fetchAppBalance();

            setdepositAmount(0);
        } catch (err) {
            console.error(err);
            seterrorDeposit(err.message);
        } finally {
            setisDepositing(false);
        }
    };

    const withdraw = async () => {
        setisWithdrawing(true);

        try {
            const stakerContract = new Contract(contractAddress, contractABI, signer);

            const tx = await stakerContract.withdraw();

            await tx.wait();

            await fetchWalletBalance();
            await fetchAppBalance();
        } catch (err) {
            console.error(err);
        } finally {
            setisWithdrawing(false);
        }
    };

    const stake = async () => {
        if (!stakeAmount) {
            seterrorStake("Please enter an amount");
            return;
        }

        if (stakeAmount > appBalance) {
            seterrorStake("Cannot stake more than you have");
            return;
        }

        setisStaking(true);
        seterrorStake(null);

        try {
            const stakerContract = new Contract(contractAddress, contractABI, signer);

            const tx = await stakerContract.stake(ethers.utils.parseEther(stakeAmount));

            await tx.wait();

            await fetchAppBalance();
            await fetchStakedBalance();
            await fetchTreasuryInfo();

            setstakeAmount(0);
        } catch (err) {
            console.error(err);
            seterrorStake(err.message);
        } finally {
            setisStaking(false);
        }
    };

    const fetchTreasuryInfo = async () => {
        try {
            const stakerContract = new Contract(contractAddress, contractABI, signer);
            const treasuryContract = new Contract(treasuryAddress, treasuryABI, signer);

            const [
                _treasuryBalance,
                _stakers,
                _stakeTime,
                _minStakeSeconds,
                _maxStakeSeconds,
                _withdrawalPeriodEndsSeconds,
            ] = await Promise.all([
                await alchemy.core.getBalance(treasuryAddress,  "latest"),
                await treasuryContract.stakers(),
                await stakerContract.getStakeTime(currentAccount),
                await stakerContract.minStakeSeconds(),
                await stakerContract.maxStakeSeconds(),
                await stakerContract.withdrawalPeriodEndsSeconds(),
            ]);

            settreasuryBalance(ethers.utils.formatEther(_treasuryBalance));
            settreasuryStakers(_stakers.toNumber());
            setstakeTime(_stakeTime.toNumber() ? _stakeTime.toNumber() * 1000 : null);
            settreasuryMinStakeSeconds(_minStakeSeconds.toNumber());
            settreasuryMaxStakeSeconds(_maxStakeSeconds.toNumber());
            settreasuryWithdrawalEndSeconds(_withdrawalPeriodEndsSeconds.toNumber());

            console.log("Minimum stake in ",_minStakeSeconds.toNumber(), "seconds");
        } catch (err) {
            console.error(err);
        }
    };

    const canUnstake = () => {
        if (stakeTime) {
            const now = new Date();
            const exceededMinStake = stakeTime + treasuryMinStakeSeconds * 1000 - now < 0;
            const exceededWithdrawal = stakeTime + treasuryWithdrawalEndSeconds * 1000 - now < 0;

            return exceededMinStake && !exceededWithdrawal;
        }

        return false;
    };

    const unstake = async () => {
        setisUnstaking(true);
        seterrorUnstake(null);

        try {
            const stakerContract = new Contract(contractAddress, contractABI, signer);
            const tx = await stakerContract.unstake();
            await tx.wait();

            await fetchAppBalance();
            await fetchStakedBalance();
            await fetchTreasuryInfo();
        } catch (err) {
            console.error(err);
            seterrorUnstake(err.message);
        } finally {
            setisUnstaking(false);
        }
    };

    const setMaxDepositAmount = () => {
        if (availableBalanceForDeposit) {
            setdepositAmount(availableBalanceForDeposit.toString());
        }
    };

    const setMaxStakeAmount = () => {
        if (appBalance) {
            setstakeAmount(appBalance.toString());
        }
    };

    const loadingIcon = (color = "text-white") => (
        <svg
            className={`animate-spin mt-1 h-6 w-6 ${color} inline-block`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    return (
        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 6</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-indigo-800">Road to Web3 - Week 6 [Goerli]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-gray-700">
                    This is a practice project to learn ethers.js and solidity. The sixth week is to build a {" "}
                    <span className="bg-gray-200 font-mono inline-block px-1 rounded ring-1 ring-indigo-600">
                        Staking App
                    </span>
                    .
                    <br />
                    <a
                        href="https://docs.alchemy.com/docs/how-to-build-a-staking-dapp"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-indigo-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-indigo-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>
                <br />

                {isDisconnected ? (
                    <div className="text-center mt-12">
                        <h3 className="text-indigo-800 text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                ) : (
                    <div className="flex flex-wrap lg:flex-nowrap">
                        <div className="self-start w-full lg:w-1/3 mb-8 lg:mb-0 lg:m-3">
                            <div className="self-start w-full bg-white rounded-xl overflow-hidden">
                                <h4 className="text-2xl text-center bg-indigo-700 p-2 text-white">Your Balance in this App</h4>
                                <div className="p-4">
                                    <h5 className="text-center p-2 text-xl italic text-gray-400">Balance</h5>
                                    <div className="text-center text-3xl text-gray-700">
                                        <span className="block mb-1 text-indigo-700">{appBalance} ETH</span>
                                        <button
                                            className="bg-slate-300 hover:bg-slate-400 hover:text-slate-100 inline-block text-lg rounded-full text-slate-500 px-3 py-px disabled:bg-slate-100 disabled:text-slate-300"
                                            disabled={appBalance === 0 || isWithdrawing}
                                            onClick={withdraw}
                                        >
                                            {isWithdrawing ? loadingIcon("text-slate-500") : "Withdraw"}
                                        </button>
                                    </div>
                                    <div className="relative mt-8">
                                        <p className="text-right text-slate-400 -mb-1">Available Balance: {walletBalance} ETH</p>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                onInput={(e) => setdepositAmount(e.target.value)}
                                                value={depositAmount}
                                                className="w-full bg-white border outline-none border-indigo-300 focus:border-indigo-500 py-3 px-4 rounded-lg mt-2 rounded-bl-none rounded-br-none"
                                                placeholder="Enter Amount"
                                                disabled={isStaking}
                                            />
                                            <span
                                                className="absolute text-xl inline-block bg-gray-100 rounded px-5 py-2 text-gray-600"
                                                style={{ top: "11px", right: "3px" }}
                                            >
                                                ETH
                                            </span>

                                            <span
                                                className="absolute text-md hover:bg-slate-400 cursor-pointer inline-block bg-slate-300 rounded px-2 text-gray-600"
                                                style={{ top: "21px", right: "96px" }}
                                                onClick={setMaxDepositAmount}
                                            >
                                                MAX
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={deposit}
                                        disabled={isDepositing}
                                        className="py-1 px-2 mb-2 pb-3 w-full disabled:bg-indigo-300 bg-indigo-600 hover:bg-indigo-700 shadow rounded-lg text-white text-xl rounded-tl-none rounded-tr-none"
                                    >
                                        {isDepositing ? (
                                            loadingIcon()
                                        ) : (
                                            <>
                                                Deposit <span className="text-3xl relative top-1 left-1">💵</span>
                                            </>
                                        )}
                                    </button>
                                    {errorDeposit && <p className="px-2 py-2 text-red-600">{errorDeposit}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="self-start w-full lg:w-1/3 mb-8 lg:mb-0 lg:m-3">
                            <div className="self-start w-full bg-white rounded-xl overflow-hidden">
                                <h4 className="text-2xl text-center bg-indigo-700 bg- p-2 text-white">Stake Contract</h4>
                                <div className="p-4">
                                    <div className="flex w-full">
                                        <div className="flex-1">
                                            <h5 className="text-center p-2 text-xl italic text-gray-400">Status</h5>
                                            <div className="text-center text-3xl text-indigo-700">
                                                {stakedBalance > 0 ? `Staked ${stakedBalance} ETH` : "Not Staked"}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-center p-2 text-xl italic text-gray-400">Interest Rate</h5>
                                            <div className="text-center text-3xl text-indigo-700">{stakeInterestRate}%</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 mb-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                onInput={(e) => setstakeAmount(e.target.value)}
                                                value={stakeAmount}
                                                className="w-full bg-white border outline-none border-indigo-300 focus:border-indigo-500 py-3 px-4 rounded-lg mt-2 rounded-bl-none rounded-br-none"
                                                placeholder="Enter Amount"
                                                disabled={isStaking}
                                            />
                                            <span
                                                className="absolute text-xl inline-block bg-gray-100 rounded px-5 py-2 text-gray-600"
                                                style={{ top: "11px", right: "3px" }}
                                            >
                                                ETH
                                            </span>
                                            <span
                                                className="absolute text-md hover:bg-slate-400 cursor-pointer inline-block bg-slate-300 rounded px-2 text-gray-600"
                                                style={{ top: "21px", right: "96px" }}
                                                onClick={setMaxStakeAmount}
                                            >
                                                MAX
                                            </span>
                                        </div>
                                        <button
                                            onClick={stake}
                                            disabled={isStaking || stakedBalance > 0 || appBalance === 0}
                                            className="py-2 px-2 mb-2 pb-3 w-full disabled:bg-indigo-300 bg-indigo-600 hover:bg-indigo-700 shadow rounded-lg text-white text-xl rounded-tl-none rounded-tr-none"
                                        >
                                            {isStaking ? (
                                                loadingIcon()
                                            ) : (
                                                <>
                                                    Stake <span className="text-3xl relative left-1">🏦</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {errorStake && <p className="px-4 py-2 text-red-600">{errorStake}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="self-start w-full mt-6 md:mt-3 lg:w-1/3 mb-8 lg:mb-0 lg:m-3 bg-white rounded-xl overflow-hidden">
                            <h4 className="text-2xl text-center bg-indigo-700 p-2 text-white">Treasury Contract</h4>
                            <div className="p-4 pb-4">
                                <div className="flex w-full">
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Contract Balance</h5>
                                        <div className="text-center text-3xl text-indigo-700">{treasuryBalance} ETH</div>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Stakers</h5>
                                        <div className="text-center text-3xl text-indigo-700">{treasuryStakers}</div>
                                    </div>
                                </div>

                                <p className="px-4 py-2 bg-gray-200 text-gray-500 rounded-md mt-10 text-center">
                                    Staked assets will be saved into this contract to demo putting in and getting out assets from the
                                    stake contract.
                                </p>

                                <div className="flex w-full mt-8">
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Your Stake Time</h5>
                                        <div className="text-center text-3xl text-indigo-700">
                                            {stakeTime
                                                ? new Date(stakeTime).toLocaleDateString() + " " + new Date(stakeTime).toLocaleTimeString()
                                                : "Not Staked"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full mt-8">
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Min. Stake Time</h5>
                                        <div className="text-center text-3xl text-indigo-700">
                                            {stakeTime
                                                ? `${new Date(stakeTime + treasuryMinStakeSeconds * 1000).toLocaleTimeString()}`
                                                : `${(treasuryMinStakeSeconds / 60).toFixed(0)} minutes`}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Max. Stake Time</h5>
                                        <div className="text-center text-3xl text-indigo-700">
                                            {stakeTime
                                                ? `${new Date(stakeTime + treasuryMaxStakeSeconds * 1000).toLocaleTimeString()}`
                                                : `${(treasuryMaxStakeSeconds / 60).toFixed(0)} minutes`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full mt-8">
                                    <div className="flex-1">
                                        <h5 className="text-center p-2 text-xl italic text-gray-400">Withdrawal Period</h5>
                                        <div className="text-center text-3xl text-indigo-700">
                                            {stakeTime &&
                                                `From ${new Date(
                                                    stakeTime + treasuryMinStakeSeconds * 1000
                                                ).toLocaleTimeString()} to ${new Date(
                                                    stakeTime + treasuryWithdrawalEndSeconds * 1000
                                                ).toLocaleTimeString()}`}

                                            {!stakeTime && (
                                                <>
                                                    Within {(treasuryMinStakeSeconds / 60).toFixed(0)} -{" "}
                                                    {(treasuryWithdrawalEndSeconds / 60).toFixed(0)} minutes after stake.
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={unstake}
                                    disabled={isUnstaking || stakedBalance === 0 || !canUnstake()}
                                    className="py-1 px-2 mb-2 mt-12 pb-3 w-full disabled:bg-indigo-300 bg-indigo-600 hover:bg-indigo-700 shadow rounded-lg text-white text-xl"
                                >
                                    {isUnstaking ? (
                                        loadingIcon()
                                    ) : (
                                        <>
                                            Unstake <span className="text-3xl relative top-1 left-1">💸</span>
                                        </>
                                    )}
                                </button>
                                {errorUnstake && <p className="px-4 py-2 text-red-600">{errorUnstake}</p>}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}