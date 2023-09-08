import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const buyMeCoffee_ABI = require("../../../utils/BuyMeACoffee.json");

export default function Week2Component() {

    // Contract Address & ABI
    const contractAddress = "0x0CF68B2171832d0410501cB8D00BF3864b48a3DF";
    const contractABI = buyMeCoffee_ABI.abi;

    const [isMounted, setIsMounted] = useState(false);
    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const network = useSwitchNetwork({
        chainId: 5,
    })
    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState("");
    const [currentChain, setcurrentChain] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [memos, setMemos] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [isWithdrawing, setisWithdrawing] = useState(false);
    const [isSettingNewRecipient, setisSettingNewRecipient] = useState(false);
    const [errorMessage, seterrorMessage] = useState(null);
    const [coffeeSize, setcoffeeSize] = useState("S");
    const [recipient, setrecipient] = useState("");
    const [contractBalance, setcontractBalance] = useState(0);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        isWalletConnected();
    }, [address]);

    useEffect(() => {
        if (signer) {
            // fetchRecipient();
            fetchContractBalance();
            fetchMessage();
        }
    }, [signer]);

    const onNameChange = (event) => {
        setName(event.target.value);
    }

    const onMessageChange = (event) => {
        setMessage(event.target.value);
    }

    // Wallet connection logic
    const isWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                setCurrentAccount(address);
            } else {
                setCurrentAccount(null);
            }
            console.log(currentAccount);
        } catch (error) {
            console.log("error: ", error);
        }
    }

    const ensureOnNetwork = async () => {
        try {
            if (currentChain != 5) {

            }
        } catch (error) {
            console.log("error: ", error);
        }
    }

    const buyCoffee = async () => {

        setisLoading(true);
        seterrorMessage(null);

        const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
        console.log("buy Me Coffee Contract", buyMeCofeeContract);

        const amount = coffeeSize === "S" ? ethers.utils.parseEther("0.001") : ethers.utils.parseEther("0.003");

        try {
            const coffeeTx = await buyMeCofeeContract.buyCoffee(
                name ? name : "anon",
                message ? message : "Enjoy your coffee!",
                { value: amount },
            );

            await coffeeTx.wait();
            console.log(coffeeTx);

            console.log("mined ", coffeeTx.hash);

            console.log("coffee purchased!");

            await fetchMessage();
            await fetchContractBalance();
            // Clear the form fields.
            setName("");
            setMessage("");
        } catch (error) {
            console.error(error);
            seterrorMessage(error.message);
        } finally {
            setisLoading(false);
        }
    };

    const withdraw = async () => {
        setisWithdrawing(true);

        try {

            const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
            const withdrawTx = await buyMeCofeeContract.withdraw();

            await withdrawTx.wait();
            console.log(withdrawTx);

            await fetchContractBalance();

        } catch (error) {
            console.error(error);
            seterrorMessage(error.message);
        } finally {
            setisWithdrawing(false);
        }
    }

    const changeCoffeeSize = (size) => {
        setcoffeeSize(size);
    }

    const fetchContractBalance = async () => {
        try {
            const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
            const balance = await signer.getBalance(buyMeCofeeContract.address);

            setcontractBalance(ethers.utils.formatEther(balance));
        } catch (error) {
            console.error(error);
            seterrorMessage(error.message);
        }
    }

    // Function to fetch all memos stored on-chain.
    const fetchMessage = async () => {
        const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
        try {
            const memos = await buyMeCofeeContract.getMemos();
            console.log("fetched!");
            setMemos(memos);
        } catch (error) {
            console.log(error);
        }
    };

    const loadingIcon = () => (
        <svg
            className="animate-spin -mt-1 h-6 w-6 text-white inline-block"
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
                <title>Road to Web3 - Week 2</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-yellow-900">Road to Web3 - Week2 [Goerli]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-yellow-700">
                    This is a practice project to learn Web3.js and solidity. Second week is to develop a &quot;Buy Me a
                    Coffee&quot; smart contract.
                    <br />
                    <a
                        href="https://docs.alchemy.com/alchemy/road-to-web3/weekly-learning-challenges/2.-how-to-build-buy-me-a-coffee-defi-dapp"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-yellow-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-yellow-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                <div className="flex w-full justify-center items-center">
                    {!isDisconnected ? (
                        <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
                            <form>
                                <div>
                                    <ul className="flex justify-center items-center">
                                        <li
                                            onClick={() => changeCoffeeSize("S")}
                                            className={`text-3xl w-16 h-16 flex justify-center items-center cursor-pointer rounded-md m-2 ${coffeeSize === "S" ? "bg-yellow-800 ring-4 ring-yellow-600" : "bg-yellow-300"
                                                }`}
                                        >
                                            ☕️
                                        </li>
                                        <li
                                            onClick={() => changeCoffeeSize("L")}
                                            className={`text-5xl w-16 h-16 flex justify-center items-center cursor-pointer rounded-md m-2 ${coffeeSize === "L" ? "bg-yellow-800 ring-4 ring-yellow-600" : "bg-yellow-300"
                                                }`}
                                        >
                                            ☕️
                                        </li>
                                    </ul>
                                    <h5 className="text-center p-2 text-xl italic text-yellow-700 mt-6">Price</h5>
                                    <div className="text-center text-3xl text-yellow-800">
                                        {coffeeSize === "S" ? "0.001" : "0.003"} ETH
                                    </div>
                                    <label className="text-center p-2 text-xl italic text-yellow-700 mt-6">
                                        Name
                                    </label>
                                    <br />

                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="anon"
                                        onChange={onNameChange}
                                        className="w-full bg-white border-yellow-400 p-2 rounded-md mt-2"
                                    />
                                </div>
                                <br />
                                <div>
                                    <label className="text-center p-2 text-xl italic text-yellow-700 mt-6">
                                        Send a message
                                    </label>
                                    <br />

                                    <textarea
                                        rows={3}
                                        placeholder="Enjoy your coffee!"
                                        id="message"
                                        onChange={onMessageChange}
                                        className="w-full bg-white border-yellow-400 p-2 rounded-md mt-2"
                                        required
                                    >
                                    </textarea>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <button
                                        type="button"
                                        onClick={buyCoffee}
                                        className="py-2 px-5 mt-3 mb-2 pb-3 bg-yellow-900 hover:bg-yellow-800 shadow rounded text-white"
                                    >
                                        Send 1 Coffee for 0.001 ETH
                                    </button>
                                    <button
                                        type="button"
                                        onClick={buyCoffee}
                                        className="py-2 px-5 mt-3 mb-2 pb-3 bg-yellow-900 hover:bg-yellow-800 shadow rounded text-white"
                                    >
                                        Send 1 Large Coffee for 0.003 ETH
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center mt-12">
                            <h3 className="text-white text-xl">
                                Connect Your Wallet
                            </h3>
                        </div>
                    )}
                    <div className="w-full mt-6 md:mt-3 md:w-1/2 md:m-3 bg-yellow-100 rounded-xl overflow-hidden">
                        <h4 className="text-2xl text-center bg-yellow-700 p-2 text-white">Messages</h4>
                        <div className="p-4">
                            {(memos.map((memo, idx) => {
                                return (
                                    <div key={idx} className="bg-white p-4 rounded mb-2">
                                        <p className="text-gray-600">{memo.message}</p>
                                        <p className="text-yellow-600">
                                            {memo.name} at {memo.timestamp.toString()}
                                        </p>
                                    </div>
                                )
                            }))}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}