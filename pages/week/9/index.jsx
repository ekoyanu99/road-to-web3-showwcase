import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork, useSendTransaction, useWaitForTransaction } from "wagmi";
import { Contract, ethers, BigNumber, utils } from "ethers";
const ERC20_ABI = require("../../../utils/ERC20.json");
const tokenList = require("../../../utils/TokenList.json");
import styles from "../../../styles/Swap.module.css";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
    ArrowDownOutlined,
    DownOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import * as qs from 'qs';
import { Network, Alchemy } from "alchemy-sdk";

export default function Week9Component() {

    const [messageApi, contextHolder] = message.useMessage();
    const [slippage, setSlippage] = useState(2.5);
    const [tokenOneAmount, setTokenOneAmount] = useState(null);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [prices, setPrices] = useState(null);
    const [txDetails, setTxDetails] = useState({
        to: null,
        data: null,
        value: null,
    });
    const [isApproved, setisApproved] = useState(true);

    // Contract Address & ABI
    const contractABI = ERC20_ABI;

    const [isMounted, setIsMounted] = useState(false);
    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    const settings = {
        apiKey: process.env.ALCHEMY_MATIC_API_KEY,
        network: Network.MATIC_MAINNET,
    };
    const alchemy = new Alchemy(settings);
    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [errorMessage, seterrorMessage] = useState(null);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setCurrentAccount(null);
        },
    });

    const { data, sendTransaction } = useSendTransaction({
        request: {
            from: address,
            to: String(txDetails.to),
            data: String(txDetails.data),
            value: String(txDetails.value),
        }
    })

    // const { approvalData, isLoading, isSuccess, write } = useContractWrite({
    //   address: tokenOneAddress,
    //   abi: erc20ABI,
    //   functionName: 'approve',
    // });

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    useEffect(() => {
        if (signer) {
            fetchWalletBalance();
        }
    }, [signer]);

    useEffect(() => {
        if (tokenOne && tokenTwo) {
            fetchPrices(tokenOne.address, tokenTwo.address);
            fetchWalletBalance();
        }
    }, [tokenOne, tokenTwo]);

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

    const [walletBalance, setwalletBalance] = useState(0);
    const API_KEY = process.env.NEXT_PUBLIC_API_EXCHANGE;

    const fetchWalletBalance = async () => {
        try {
            const oneAddress = tokenOne.address;
            const oneTicker = tokenOne.ticker;
            if (chain.name === "Polygon") {
                const isNativeToken = tokenOne.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

                if (!isNativeToken) {
                    const balanceOne = await alchemy.core.getTokenBalances(currentAccount, [oneAddress]);
                    const balance = balanceOne.tokenBalances[0].tokenBalance;
                    const bigNumber = BigNumber.from(balance);
                    const etherValue = utils.formatEther(bigNumber);
    
                    setwalletBalance(+etherValue);
                } else {
                    const balanceOne = await alchemy.core.getBalance(currentAccount, "latest");
                    const bigNumber = BigNumber.from(balanceOne);
                    const etherValue = utils.formatEther(bigNumber);
    
                    setwalletBalance(+etherValue);
                }
            } else {
                console.log("Please change to matic network");
                switchNetwork(137);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const setMaxSwapAmount = () => {
        if (walletBalance) {
            setTokenOneAmount(walletBalance);
        }
    }

    function handleSlippageChange(e) {
        setSlippage(e.target.value);
    }

    function changeAmount(e) {
        setTokenOneAmount(e.target.value);

        const ratio = prices.buyAmount / 10 ** tokenTwo.decimals;

        if (e.target.value && prices) {
            setTokenTwoAmount((e.target.value * ratio).toFixed(8))
        } else {
            setTokenTwoAmount(null);
        }
    }

    const switchTokens = async () => {
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one);
    }

    function openModal(asset) {
        setChangeToken(asset);
        setIsOpen(true);
    }

    const modifyToken = async (i) => {
        try {
            setPrices(null);
            setTokenOneAmount(null);
            setTokenTwoAmount(null);

            if (changeToken === 1) {
                setTokenOne(tokenList[i]);
            } else {
                setTokenTwo(tokenList[i]);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Error modifying token:', error);
        }
    };

    async function fetchPrices() {
        console.log("Getting Price, Terimakasih!");

        const params = {
            sellToken: tokenOne.address,
            buyToken: tokenTwo.address,
            sellAmount: 1 * 10 ** tokenOne.decimals,
        };

        const apiUrl = `https://polygon.api.0x.org/swap/v1/price?` + new URLSearchParams(params);

        const headers = {
            '0x-api-key': API_KEY,
        };

        const res = await fetch(apiUrl, {
            headers: headers,
        });

        const data = await res.json();

        setPrices(data);
    }

    

    async function fetchQuote(account) {

        let amount = tokenOneAmount * 10 ** tokenOne.decimals;

        const paramQuotes = {
            sellToken: tokenOne.address,
            buyToken: tokenTwo.address,
            sellAmount: amount,
            takerAddress: account,
        };

        const headers = {
            '0x-api-key': API_KEY,
        };

        const response = await fetch(`https://polygon.api.0x.org/swap/v1/quote?${qs.stringify(paramQuotes)}`, {
            headers: headers,
        });

        let swapQuoteJSON = await response.json();
        return swapQuoteJSON;
    }

    // Function to check and update allowance if needed
    async function checkAndUpdateAllowance(account) {
        // reference 0x exchange proxy address here https://docs.0xprotocol.org/en/latest/basics/addresses.html
        const spenderAddress = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
        const tokenOneAddress = tokenOne.address;

        const isNativeToken = tokenOne.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

        if (!isNativeToken) {
            const erc20Contract = new Contract(tokenOneAddress, contractABI, signer);

            const tokenAllowance = await erc20Contract.allowance(account, spenderAddress);

            let amount = tokenOneAmount * 10 ** tokenOne.decimals;

            if (tokenAllowance.lt(amount)) {
                const approveTx = await erc20Contract.approve(spenderAddress, amount);
                await approveTx.wait();
            }
        }
    }

    async function fetchDexSwap() {
        try {
            // let accounts = await window.ethereum.request({ method: "eth_accounts" });
            let accounts = address;
    
            let takerAddress = accounts;
    
            // Check and update allowance
            setisApproved(false);
            await checkAndUpdateAllowance(takerAddress);
            setisApproved(true);
    
            const swapQuoteJSON = await fetchQuote(takerAddress);
    
            // Perform the swap
            await setTxDetails(swapQuoteJSON);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {

        fetchPrices(tokenList[0].address, tokenList[1].address)

    }, [])

    useEffect(() => {

        if (txDetails.to && !isDisconnected) {
            sendTransaction();
        }
    }, [txDetails])

    useEffect(() => {

        messageApi.destroy();

        if (isLoading) {
            messageApi.open({
                type: 'loading',
                content: 'Transaction is Pending...',
                duration: 0,
            })
        }

    }, [isLoading])

    useEffect(() => {
        messageApi.destroy();
        if (isSuccess) {
            messageApi.open({
                type: 'success',
                content: 'Transaction Successful',
                duration: 1.5,
            })
        } else if (txDetails.to) {
            messageApi.open({
                type: 'error',
                content: 'Transaction Failed',
                duration: 1.50,
            })
        }


    }, [isSuccess])

    const settingsSlippage = (
        <>
            <div>Slippage Tolerance</div>
            <div>
                <Radio.Group value={slippage} onChange={handleSlippageChange}>
                    <Radio.Button value={0.5}>0.5%</Radio.Button>
                    <Radio.Button value={2.5}>2.5%</Radio.Button>
                    <Radio.Button value={5}>5.0%</Radio.Button>
                </Radio.Group>
            </div>
        </>
    );

    return (
        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 9</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-cyan-900">Road to Web3 - Week 9 [Polygon]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-cyan-700">
                    This is a practice project to learn ethers.js and solidity. The ninth week is to build a &quot;Token Swap dApp&quot;.
                    <br />
                    <a
                        href="https://docs.alchemy.com/docs/how-to-build-a-token-swap-dapp-with-0x-api"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-cyan-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-cyan-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                {isDisconnected ? (
                    <div className="text-center mt-12">
                        <h3 className="text-white text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center mt-12">
                        {contextHolder}
                        <Modal
                            open={isOpen}
                            footer={null}
                            onCancel={() => setIsOpen(false)}
                            title="Select a token"
                        >
                            <div className={styles.modalContent}>
                                {tokenList?.map((e, i) => {
                                    if (e.address === tokenOne.address) {
                                        return null; // Skip rendering the selected token
                                    }
                                    return (
                                        <div
                                            className={styles.tokenChoice}
                                            key={i}
                                            onClick={() => modifyToken(i)}
                                        >
                                            <img src={e.img} alt={e.ticker} className={styles.tokenLogo} />
                                            <div className={styles.tokenChoiceNames}>
                                                <div className={styles.tokenName}>{e.name}</div>
                                                <div className={styles.tokenTicker}>{e.ticker}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Modal>
                        <div className={styles.tradeBox}>
                            <br />
                            <div className={styles.tradeBoxHeader}>
                                <h4 className="text-white">Swap</h4>
                                <Popover
                                    content={settingsSlippage}
                                    title="Settings"
                                    trigger="click"
                                    placement="bottomRight"
                                >
                                    <SettingOutlined className={styles.cog} />
                                </Popover>
                            </div>
                            <br />
                            <div className={styles.inputs}>
                                <Input
                                    placeholder="0"
                                    value={tokenOneAmount}
                                    onChange={changeAmount}
                                    disabled={!prices}
                                />
                                <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
                                <div className={styles.switchButton} onClick={switchTokens}>
                                    <ArrowDownOutlined className={styles.switchArrow} />
                                </div>
                                {/* <span
                                    className="text-md hover:bg-slate-400 cursor-pointer inline-block bg-slate-300 rounded px-2 text-gray-600"
                                    style={{ top: "21px", right: "96px" }}
                                    onClick={setMaxSwapAmount}
                                >
                                    Max
                                </span>     */}
                                <div className={styles.assetOne} onClick={() => openModal(1)}>
                                    <div className={styles.assetOneToken}> {/* Use flex to arrange items in a row */}
                                        <img src={tokenOne.img} alt="assetOneLogo" className={styles.assetLogo} />
                                        <span className="ml-2">{tokenOne.ticker}</span>
                                        <DownOutlined className="ml-2" />
                                    </div>
                                    <div className="text-sm text-cyan-700">
                                        Saldo: {walletBalance.toFixed(4)}
                                    </div>
                                </div>
                                <div className={styles.assetTwo} onClick={() => openModal(2)}>
                                    <img src={tokenTwo.img} alt="assetOneLogo" className={styles.assetLogo} />
                                    {tokenTwo.ticker}
                                    <DownOutlined />
                                </div>
                            </div>
                            {
                                isApproved ? (
                                    <div className={styles.swapButton} disabled={!tokenOneAmount} onClick={fetchDexSwap}>Swap</div>
                                ) : (
                                    <div className={styles.swapButton} disabled={!tokenOneAmount} onClick={fetchDexSwap}>Approve</div>
                                )
                            }

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}