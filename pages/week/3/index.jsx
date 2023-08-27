import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const Battles_ABI = require("../../../utils/ChainBattles.json");
import styles from "../../../styles/Home.module.css";
import {
    goerli,
} from "wagmi/chains";
import Image from "next/image";
import { Network, Alchemy } from "alchemy-sdk";

export default function Week3Component() {

    // Contract Address & ABI
    const contractAddress = "0xCbEDBe95B78e204630F5Dc2CF848F38666A35e1F";
    const contractABI = Battles_ABI;

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

    const [charName, setcharName] = useState("");
    const [ownedChar, setownedChar] = useState(null);
    const [ownedCharSvg, setownedCharSvg] = useState(null);

    const [charInfo, setcharInfo] = useState(null);
    const [isInitialized, setisInitialized] = useState(false);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
        fetchCharNFT();
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

    const fetchCharNFT = async () => {
        try {

            // use ethers
            // const battleContract = new Contract(contractAddress, contractABI, signer);
            // const checkBalance = await battleContract.balanceOf(currentAccount);
            // console.log("Holding", (checkBalance).toNumber());

            // Optional Config object, but defaults to demo api-key and eth-mainnet.
            const settings = {
                apiKey: "pZtMYFAth5mw1UecE_l_TZucPxFMYnzF", // Replace with your Alchemy API Key.
                network: Network.MATIC_MUMBAI, // Replace with your network.
            };

            const alchemy = new Alchemy(settings);

            const nfts = await alchemy.nft.getNftsForOwner(address, { contractAddresses: [contractAddress], });

            console.log("ini dari fetchCharNFT", nfts);

            if (nfts.ownedNfts.length > 0) {
                setownedChar(nfts.ownedNfts[0]);
                console.log("ini nfts value", nfts.ownedNfts[0].tokenId);
                await fetchCharInfo(Number(nfts.ownedNfts[0].tokenId));
            }
            setisInitialized(true);
        } catch (error) {
            console.error(error);
            seterrorMessage(error);
        } finally {
            setisMinting(false);
        }
    }

    const mint = async () => {
        setisMinting(true);

        if (charName === "") {
            console.log("Please enter a character name");
            return;
        }

        try {

            const battleContract = new Contract(contractAddress, contractABI, signer);
            const mintTx = await battleContract.mint(charName);
            console.log(mintTx);
            await mintTx.wait();

            // fetch char nft here
            await fetchCharNFT();

        } catch (error) {
            console.error(error);
            seterrorMessage(error.reason);
        } finally {
            setisMinting(false);
        }
    }

    const train = async () => {
        setisMinting(true);

        try {

            const battleContract = new Contract(contractAddress, contractABI, signer);
            const trainTx = await battleContract.train(charInfo.id);
            console.log(trainTx);
            await trainTx.wait();

            // fetch char nft here
            await fetchCharNFT();

        } catch (error) {
            console.error(error);
            seterrorMessage(error.reason);
        } finally {
            setisMinting(false);
        }
    }

    const fetchCharInfo = async (tokenId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const battleContract = new Contract(contractAddress, contractABI, signer);

                const svg = await battleContract.generateCharacter(tokenId);
                setownedCharSvg(svg);

                const info = await battleContract.getInfo(tokenId);
                const levelInt = info.level.toNumber();
                const speedInt = info.speed.toNumber();
                const strengthInt = info.strength.toNumber();
                const lifeInt = info.life.toNumber();

                setcharInfo({
                    id: tokenId,
                    name: info.name,
                    level: levelInt,
                    speed: speedInt,
                    strength: strengthInt,
                    life: lifeInt,
                });

                console.log("ini dari fetchCharInfo", charInfo);

                resolve();
            } catch (error) {
                console.error(error);
                reject();
            }
        });
    }

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
                <title>Road to Web3 - Week 3</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-yellow-900">Road to Web3 - Week 3 [Mumbai]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-yellow-700">
                    This is a practice project to learn solidity and ethers.js. Third week is to develop a &quot;Battle Chains
                    (NFT metadata on-chain)&quot; smart contract.
                    <br />
                    <a
                        href="https://docs.alchemy.com/alchemy/road-to-web3/weekly-learning-challenges/3.-how-to-make-nfts-with-on-chain-metadata-hardhat-and-javascript"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-yellow-500 rounded-md text-white mt-2 p-1 px-2 hover:bg-yellow-600"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                {isInitialized && currentAccount && !ownedChar && (
                    <div className="flex flex-wrap justify-center items-center md:flex-nowrap mt-16 p-8 py-12 bg-white rounded-xl shadow-lg">
                        <div className="self-start w-full md:w-1/2">
                            <h2 className="text-2xl font-bold text-center text-purple-600">Mint Your Character!</h2>
                            <p className="text-gray-400 text-center text-lg mt-1">Let&apos;s create your character first!</p>

                            <input
                                type="text"
                                placeholder="Character Name"
                                className="rounded-lg border-none ring-2 ring-purple-300 outline-none focus:ring-purple-500 p-2 w-full mt-8 text-lg transition disabled:text-gray-400"
                                value={charName}
                                disabled={isMinting}
                                onChange={(e) => setcharName(e.target.value)}
                            />

                            <button
                                className="text-xl bg-purple-700 text-white w-full mt-8 py-3 shadow-lg rounded-xl hover:bg-purple-600 transition"
                                onClick={mint}
                                disabled={isMinting}
                            >
                                {isMinting ? loadingIcon() : "Mint"}
                            </button>
                        </div>
                    </div>
                )
                }

                {isInitialized && currentAccount && ownedChar && (
                    <div className="flex flex-wrap md:flex-nowrap mt-16 p-4 bg-white rounded-xl shadow-lg">
                        <div className="w-full md:w-1/2 md:m-3">
                            {ownedCharSvg && (
                                <>
                                    <img src={ownedCharSvg} className="w-full" />
                                    <div className="text-center mt-4">
                                        <a
                                            href={`https://testnets.opensea.io/assets/mumbai/${contractAddress}/${charInfo.id}`}
                                            className="text-blue-500 hover:text-blue-700 text-lg"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View on OpenSea
                                        </a>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Remember to click <strong>Refresh metadata</strong> if the info is not updating.
                                        </p>
                                    </div>
                                    <div className="w-full mt-6 md:mt-3 md:w-1/2 md:m-3 rounded-xl overflow-hidden flex flex-col justify-between">
                                        <div className="border-t md:border-t-0 pt-4 md:pt-0">
                                            <h2 className="text-2xl font-bold text-center text-purple-600">
                                                {charInfo && `Welcome, ${charInfo.name}!`}
                                            </h2>
                                            <p className="text-gray-400 text-center text-lg mt-1">This is your character! Let&apos;s train it!</p>
                                        </div>
                                        <ul className="my-8 md:my-0">
                                            <li className="text-3xl text-center my-2 font-bold text-cyan-400">Level = {charInfo.level}</li>
                                            <li className="text-3xl text-center my-2 font-bold text-orange-300">Speed = {charInfo.speed}</li>
                                            <li className="text-3xl text-center my-2 font-bold text-red-400">
                                                Strength = {charInfo.strength}
                                            </li>
                                            <li className="text-3xl text-center my-2 font-bold text-green-400">Life = {charInfo.life}</li>
                                        </ul>
                                        <button
                                            className="text-xl bg-purple-700 text-white w-full py-3 shadow-lg rounded-xl hover:bg-purple-600 transition"
                                            onClick={train}
                                            disabled={isMinting}
                                        >
                                            {isMinting ? loadingIcon() : "Train"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
                }

                {currentAccount && !isInitialized && (
                    <div className="flex flex-wrap md:flex-nowrap mt-24 p-4 justify-center items-center"> {loadingIcon()}</div>
                )}

                {isDisconnected && (
                    <div className="text-center mt-12">
                        <h3 className="text-white text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                )}

            </main>
        </div>
    );
}