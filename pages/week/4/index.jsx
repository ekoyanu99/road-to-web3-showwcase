import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract } from "ethers";
import Image from "next/image";

const populars = [
    {
        name: "MAYC",
        address: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
    },
    {
        name: "Bored Ape",
        address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    },
    {
        name: "DeGods",
        address: "0x8821BeE2ba0dF28761AffF119D66390D594CD280",
    },
    {
        name: "Milady Maker",
        address: "0x5Af0D9827E0c53E4799BB226655A1de152A425a5",
    },
    {
        name: "Nouns",
        address: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03",
    },
];

let copiedTimeoutHandler;

export default function Week4Component() {

    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();

    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [isInitialized, setisInitialized] = useState(false);

    const [paginationNext, setpaginationNext] = useState(null);

    const [collection, setcollection] = useState("");
    const [wallet, setwallet] = useState("");
    const [nfts, setnfts] = useState([]);

    const [copied, setcopied] = useState([]);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            reset();
            setCurrentAccount(null);
        },
    });

    useEffect(() => {
        checkIfWalletConnected();
        fetchNfts();
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

    const fetchNfts = async (isNext) => {
        if (collection.length === 0 && wallet.length === 0) {
            return;
        }

        setisLoading(true);

        try {
            const method = collection.length > 0 && wallet.length === 0 ? "getNFTsForCollection" : "getNFTs";
            const baseURL = `https://eth-mainnet.alchemyapi.io/v2/pZtMYFAth5mw1UecE_l_TZucPxFMYnzF/${method}/`;
            let requestOptions = {
                method: "GET",
            }

            let fetchURL;

            if (collection.length > 0 && wallet.length === 0) {
                fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=true`;
            } else if (!collection.length) {
                fetchURL = `${baseURL}?owner=${wallet}`;
            } else {
                fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
            }

            if (isNext && paginationNext) {
                if (method === "getNFTsForCollection") {
                    fetchURL = `${fetchURL}&startToken=${paginationNext}`;
                } else if (method === "getNFTs") {
                    fetchURL = `${fetchURL}&pageKey=${paginationNext}`;
                }
            } else {
                setpaginationNext(null);
            }

            const results = await fetch(fetchURL, requestOptions).then((data) => data.json());

            if (results) {
                console.log("nfts:", nfts);
                if (results.nfts) {
                    if (isNext) {
                        // Append
                        setnfts([...nfts, ...results.nfts]);
                    } else {
                        setnfts(results.nfts);
                    }
                    setpaginationNext(results.nextToken);
                } else if (results.ownedNfts) {
                    if (isNext) {
                        // Append
                        setnfts([...nfts, ...results.ownedNfts]);
                    } else {
                        setnfts(results.ownedNfts);
                    }
                    setpaginationNext(results.pageKey);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setisLoading(false);
            setisInitialized(true);
        }

    }

    const getThumbnail = (item) => {
        if (item.media.length > 0 && item.media[0].thumbnail) {
            return item.media[0].thumbnail;
        } else if (item.media.length > 0 && item.media[0].raw.includes("svg+xml")) {
            let source = item.media[0].raw;

            if (source.includes("svg+xml;utf8,")) {
                let raw = source.split("utf8,")[1];
                source = `data:image/svg+xml;base64,${btoa(raw)}`;
            }

            return source;
        } else if (item.metadata.image) {
            let image = item.metadata.image;

            if (image.includes("ipfs://")) {
                image = image.replace("ipfs://", "https://ipfs.infura.io/ipfs/");
            }

            return image;
        } else {
            return "/images/NFT.png";
        }
    };

    const getTitle = (item) => {
        let tokenId = Number(item.id.tokenId);

        if (item.title && !item.title.includes("#")) {
            return `${item.title} #${tokenId}`;
        } else if (item.title) {
            return item.title;
        } else if (!item.title) {
            return `#${tokenId}`;
        } else {
            // unlikely
            return "Untitled NFT";
        }
    };

    const shortenAddress = (address) => {
        if (address.length === 0) {
            return "";
        }

        return `${address.substr(0, 6)}...${address.substr(address.length - 6, 6)}`;
    };

    const getFilterTitle = () => {
        if (collection.length > 0 && wallet.length > 0) {
            return "Filter Collection by Address";
        } else if (collection.length > 0 && wallet.length === 0) {
            return "Search Collection";
        } else if (collection.length === 0 && wallet.length > 0) {
            return "NFTs owned by Wallet";
        } else {
            return "Search";
        }
    };

    const setMyAddress = async () => {
        if (!currentAccount) {
            console.log("Connect wallet terlebih dahulu")
        } else {
            setwallet(currentAccount);
        }
    };

    const copy = (address, index) => {
        if (copiedTimeoutHandler) {
            clearTimeout(copiedTimeoutHandler);
            setcopied([]);
        }

        navigator.clipboard.writeText(address);

        let copied = [];
        copied[index] = true;

        setcopied(copied);

        copiedTimeoutHandler = setTimeout(() => {
            setcopied([]);
        }, 1500);
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
                <title>Road to Web3 - Week 4</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-sky-600">Road to Web3 - Week 4 [Ethereum]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-sky-500">
                    This is a practice project to learn Web3 and ethers.js. The fourth week is to &quot;Create an NFT Gallery&quot;
                    using Alchemy API.
                    <br />
                    <a
                        href="https://docs.alchemy.com/alchemy/road-to-web3/weekly-learning-challenges/4.-how-to-create-an-nft-gallery"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-sky-600 rounded-md text-sky-200 mt-4 p-1 px-2 hover:bg-sky-800"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                <div className="bg-sky-50 p-8 mt-8 rounded-xl shadow-xl shadow-sky-900 flex gap-x-8 flex-wrap lg:flex-nowrap">
                    <div className="w-full lg:flex-1 flex flex-col text-lg text-sky-600">
                        Collection Contract Address
                        <input
                            type="text"
                            value={collection}
                            disabled={isLoading}
                            onChange={(e) => setcollection(e.target.value)}
                            className="ring-2 ring-sky-200 focus:ring-sky-300 rounded-lg p-2 my-2 text-xl outline-none disabled:bg-sky-100 disabled:text-sky-400"
                        />
                        <div className="text-sm flex">
                            <span className="mr-2">Popular:</span>
                            <ul className="flex gap-x-2 flex-wrap gap-y-1">
                                {populars.map((popular) => (
                                    <li
                                        key={popular.name}
                                        onClick={() => setcollection(popular.address)}
                                        className="cursor-pointer bg-sky-200 px-1 rounded hover:bg-sky-300 self-start"
                                    >
                                        {popular.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="w-full mt-6 lg:mt-0 lg:flex-1 flex flex-col text-lg text-sky-600">
                        Wallet Address
                        <input
                            type="text"
                            value={wallet}
                            disabled={isLoading}
                            onChange={(e) => setwallet(e.target.value)}
                            className="ring-2 ring-sky-200 focus:ring-sky-300 rounded-lg p-2 my-2 text-xl outline-none disabled:bg-sky-100 disabled:text-sky-400"
                        />
                        <div className="text-sm flex">
                            <ul className="flex gap-x-2">
                                <li onClick={setMyAddress} className="cursor-pointer bg-sky-200 px-1 rounded hover:bg-sky-300">
                                    Get my address with MetaMask
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-full lg:w-72">
                        <button
                            onClick={() => fetchNfts(false)}
                            disabled={isLoading || (collection.length === 0 && wallet.length === 0)}
                            className="bg-sky-800 disabled:text-sky-400 text-white w-full px-4 py-2 text-xl rounded-md shadow-lg mt-8 relative top-1"
                        >
                            {isLoading ? loadingIcon() : getFilterTitle()}
                        </button>
                    </div>
                </div>

                {isInitialized && (
                    <div className="p-4 md:p-6 lg:p-8 xl:p-12 bg-sky-100 rounded-xl mt-8">
                        <div className="flex gap-y-8 flex-wrap">
                            {nfts.length === 0 && (
                                <div className="text-center text-xl flex-1 text-sky-600">
                                    {isLoading ? loadingIcon("text-sky-600") : "No results"}
                                </div>
                            )}

                            {nfts.map((item, index) => (
                                <div key={index} className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-2">
                                    <a
                                        // href={`/${item.contract.address}/${Number(item.id.tokenId)}/`}
                                        href={`https://opensea.io/assets/ethereum/${item.contract.address}/${Number(item.id.tokenId)}/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group"
                                    >
                                        <div className="block transition overflow-hidden rounded-md bg-white">
                                            <img src={getThumbnail(item)} className="w-full group-hover:scale-125 transition duration-400" />
                                        </div>
                                        <h4 className="mt-2 text-lg text-sky-700 font-bold group-hover:text-sky-900">
                                            {getTitle(item)}
                                        </h4>
                                    </a>
                                    <h5 className="text-md text-sky-500 group-hover:text-sky-600">
                                        {shortenAddress(item.contract.address)}

                                        {!copied[index] && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="inline-block ml-2 relative cursor-pointer text-sky-500"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                width="18"
                                                onClick={() => copy(item.contract.address, index)}
                                            >
                                                <path d="M0 0h24v24H0V0z" fill="none"></path>
                                                <path
                                                    fill="currentColor"
                                                    d="M15 1H4c-1.1 0-2 .9-2 2v13c0 .55.45 1 1 1s1-.45 1-1V4c0-.55.45-1 1-1h10c.55 0 1-.45 1-1s-.45-1-1-1zm4 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h9c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1z"
                                                ></path>
                                            </svg>
                                        )}

                                        {copied[index] && (
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="inline-block ml-2 relative cursor-pointer text-sky-500"
                                            >
                                                <path fill="none" d="M0 0h24v24H0V0Z" />
                                                <path
                                                    fill="currentColor"
                                                    d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0 -.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41 -.39-.39-1.02-.39-1.41 0L9 16.17Z"
                                                />
                                            </svg>
                                        )}
                                    </h5>
                                </div>
                            ))}
                        </div>

                        {paginationNext && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={() => fetchNfts(true)}
                                    disabled={isLoading || (collection.length === 0 && wallet.length === 0)}
                                    className="bg-sky-600 disabled:text-sky-400 text-white w-full px-4 py-2 text-xl rounded-md shadow-lg mt-8 relative top-1"
                                >
                                    {isLoading ? loadingIcon() : "Next Page"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}