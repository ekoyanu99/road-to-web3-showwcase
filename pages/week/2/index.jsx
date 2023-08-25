import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const buyMeCoffee_ABI = require("../../../utils/BuyMeACoffee.json");
import styles from "../../../styles/Home.module.css";
import {
    goerli,
} from "wagmi/chains";

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

    const onNameChange = (event) => {
        setName(event.target.value);
    }

    const onMessageChange = (event) => {
        setMessage(event.target.value);
    }

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
        },
    });

    function reset() {
    }

    // Wallet connection logic
    const isWalletConnected = async () => {
        try {
            if(!isDisconnected){
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

        const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
        console.log("buy Me Coffee Contract", buyMeCofeeContract);

        try {
            const coffeeTx = await buyMeCofeeContract.buyCoffee(
                name ? name : "anon",
                message ? message : "Enjoy your coffee!",
                { value: ethers.utils.parseEther("0.001") },
            );
            console.log(coffeeTx);
            await coffeeTx.wait();

            console.log("mined ", coffeeTx.hash);

            console.log("coffee purchased!");

            // Clear the form fields.
            setName("");
            setMessage("");
        } catch (error) {
            console.log(error);
        }
    };

    const buyLargeCoffee = async () => {
        const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
        try {
            const coffeeTx = await buyMeCofeeContract.buyCoffee(
                name ? name : "anon",
                message ? message : "Enjoy your coffee!",
                { value: ethers.utils.parseEther("0.003") },
            );
            await coffeeTx.wait();

            console.log("mined ", coffeeTx.hash);

            console.log("coffee purchased!");

            // Clear the form fields.
            setName("");
            setMessage("");
        } catch (error) {
            console.log(error);
        }
    };

    // Function to fetch all memos stored on-chain.
    const getMemos = async () => {
        const buyMeCofeeContract = new Contract(contractAddress, contractABI, signer);
        try {
            const memos = await buyMeCofeeContract.getMemos();
            console.log("fetched!");
            setMemos(memos);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        let buyMeACoffee;
        isWalletConnected();
        getMemos();

        // Create an event handler function for when someone sends
        // us a new memo.
        const onNewMemo = (from, timestamp, name, message) => {
            console.log("Memo received: ", from, timestamp, name, message);
            setMemos((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message,
                    name
                }
            ]);
        };

        const { ethereum } = window;

        // Listen for new memo events.
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum, "any");
            const signer = provider.getSigner();
            buyMeACoffee = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            buyMeACoffee.on("NewMemo", onNewMemo);
        }

        return () => {
            if (buyMeACoffee) {
                buyMeACoffee.off("NewMemo", onNewMemo);
            }
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        let buyMeACoffee;
        isWalletConnected();
        getMemos();

        // Create an event handler function for when someone sends
        // us a new memo.
        const onNewMemo = (from, timestamp, name, message) => {
            console.log("Memo received: ", from, timestamp, name, message);
            setMemos((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message,
                    name
                }
            ]);
        };

        const { ethereum } = window;

        // Listen for new memo events.
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum, "any");
            const signer = provider.getSigner();
            buyMeACoffee = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            buyMeACoffee.on("NewMemo", onNewMemo);
        }

        return () => {
            if (buyMeACoffee) {
                buyMeACoffee.off("NewMemo", onNewMemo);
            }
        }
    }, []);

    return (
        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 2</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-yellow-900">Road to Web3 - Week2</h1>
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

                {!isDisconnected ? (
                    <div>
                        <form>
                            <div>
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
                                    onClick={buyLargeCoffee}
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
                <div className="self-start w-full mt-6 md:mt-3 md:w-1/2 md:m-3 bg-yellow-100 rounded-xl overflow-hidden">
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
            </main>
        </div>
    );
}