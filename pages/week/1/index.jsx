import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const Alchemy_ABI = require("../../../utils/Alchemy.json");
import styles from "../../../styles/Home.module.css";
import {
    goerli,
} from "wagmi/chains";
import Image from "next/image";

export default function Week1Component() {

    // Contract Address & ABI
    const contractAddress = "0xF3B59e1ce0Ce472daA264894F2372AaAAC25F411";
    const contractABI = Alchemy_ABI;

    const [isMounted, setIsMounted] = useState(false);
    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [currentChain, setcurrentChain] = useState(null);
    const [isMinting, setisMinting] = useState(false);
    const [errorMessage, seterrorMessage] = useState(null);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    const checkIfWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                if(chain.name === "Goerli") {
                    setCurrentAccount(address);
                } else {
                    switchNetwork(5);
                    setCurrentAccount(address);
                }
            } else {
                setCurrentAccount(null);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const mint = async () => {
        setisMinting(true);

        const alchemyContract = new Contract(contractAddress, contractABI, signer);

        try {

            const mintTx = await alchemyContract.safeMint(currentAccount, "https://ipfs.filebase.io/ipfs/QmT3GBmBEq5Lk5CJjinryw1nLfbsFMFxX4q9tnCx9dELL2");
            await mintTx.wait();

        } catch (error) {
            console.error(error);
            seterrorMessage(error.reason);
        } finally {
            setisMinting(false);
        }
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 1</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-yellow-900">Road to Web3 - Week 1 [Goerli]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-yellow-700">
                    This is a practice project to learn Web3.js and solidity. First week is to develop a &quot;ERC721&quot; smart contract.
                    <br />
                    <a
                        href="https://docs.alchemy.com/docs/how-to-develop-an-nft-smart-contract-erc721-with-alchemy"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-yellow-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-yellow-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                <Image
                    src="/eunha.webp"
                    alt="Road to Web3"
                    className="mt-12 w-full max-w-md block mx-auto rounded-lg ring-4 shadow-lg ring-white"
                    width={500} height={500}
                />

                {isDisconnected ? (
                    <div className="text-center mt-12">
                        <h3 className="text-white text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center mt-12">
                        <button
                            className="py-2 px-5 mt-6 mb-2 pb-3 bg-yellow-900 hover:bg-yellow-800 shadow rounded text-white text-2xl"
                            onClick={mint}
                            disabled={isMinting}
                        >
                            {isMinting ? "Minting..." : "Mint 🔥"}
                        </button>
                        {<p className="text-red-600 mt-4 text-center">{errorMessage}</p>}
                    </div>
                )}

            </main>
        </div>
    );
}