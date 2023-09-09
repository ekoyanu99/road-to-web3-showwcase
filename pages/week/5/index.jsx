import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const BullnBear_ABI = require("../../../utils/BullnBear.json");
import styles from "../../../styles/Home.module.css";
import {
    goerli,
} from "wagmi/chains";
import Image from "next/image";

export default function Week5Component() {

    // Contract Address & ABI
    const contractAddress = "0x04C8666F5C009AE56115CD851f08782F3710Dc54";
    const contractABI = BullnBear_ABI;

    const [isMounted, setIsMounted] = useState(false);
    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const network = useSwitchNetwork({
        chainId: 5,
    })
    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [currentChain, setcurrentChain] = useState(null);
    const [isMinting, setisMinting] = useState(false);
    const [errorMessage, seterrorMessage] = useState(null);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    const checkIfWalletConnected = async () => {
        try {
            if (!isDisconnected) {
                setCurrentAccount(address);
            } else {
                setCurrentAccount(null);
            }
            console.log(currentAccount);
        } catch (error) {
            console.error(error);
        }
    }

    const mint = async () => {
        setisMinting(true);

        const bullnbearContract = new Contract(contractAddress, contractABI, signer);

        try {

            const mintTx = await bullnbearContract.safeMint(currentAccount, "https://ipfs.io/ipfs/QmRJVFeMrtYS2CUVUM2cHJpBV5aX2xurpnsfZxLTTQbiD3?filename=party_bull.json");
            console.log(mintTx);
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
                <title>Road to Web3 - Week 5</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-purple-800">Road to Web3 - Week 5 [Sepolia]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-gray-700">
                    This is a practice project to learn ethers.js and solidity. The fifth week is to develop a dynamic NFT smart
                    contract which will change based on the price of ETH/USD, using{" "}
                    <span className="bg-gray-200 font-mono inline-block px-1 rounded ring-1 ring-purple-600">
                        Chainlink VRF and Keeper
                    </span>
                    .
                    <br />
                    <a
                        href="https://docs.alchemy.com/docs/connect-apis-to-your-smart-contracts-using-chainlink#mocking-live-net-smart-contracts"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-purple-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-purple-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                <Image
                    src="/BullnBear.gif"
                    alt="Road to Web3"
                    className="mt-12 w-full max-w-md block mx-auto rounded-lg ring-4 shadow-lg ring-purple-200"
                    width={500} height={500}
                />

                {isDisconnected ? (
                    <div className="text-center mt-12">
                        <h3 className="text-purple-800 text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center mt-12">
                        <button
                            className="py-2 px-5 mt-6 mb-2 pb-3 bg-purple-800 hover:bg-purple-700 shadow rounded text-white text-2xl"
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