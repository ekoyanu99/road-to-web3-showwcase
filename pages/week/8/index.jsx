import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useSignMessage, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract, ethers } from "ethers";
const OddGame_ABI = require("../../../utils/OddEvenGame.json");

const GameStatus = {
    NOT_STARTED: 0,
    WAITING_FOR_PLAYER_EVEN_TO_JOIN: 1,
    WAITING_FOR_PLAYER_ODD_TO_REVEAL: 2,
    FINISHED: 3,
};

export default function Week8Component() {

    // Contract Address & ABI Stake
    const contractAddress = "0x6eeaE2ae8C875Ad6963FbB6E6B8e6eD8a845C365";
    const contractABI = OddGame_ABI;

    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [errorMessage, seterrorMessage] = useState(null);

    const [magicWord, setmagicWord] = useState("");
    const [currentGame, setcurrentGame] = useState(null);
    const [pastGames, setpastGames] = useState([]);

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
            fetchGames();
        }
    }, [signer]);

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

    const fetchGames = async () => {
        try {
            if (chain.id === 420) {
                const oddGameContract = new Contract(contractAddress, contractABI, signer);
    
                const games = await oddGameContract.getGames();
    
                if (games.length === 0) {
                } else {
                    // Set current game
                    const lastGameIndex = await oddGameContract.getLastGameIndex();
    
                    const game = await oddGameContract.games(lastGameIndex);
    
                    if (game.status !== GameStatus.FINISHED) {
                        setcurrentGame({
                            cost: game.cost,
                            endTime: game.endTime,
                            hashOdd: game.hashOdd,
                            judge: game.judge,
                            magicWordEven: game.magicWordEven,
                            magicWordOdd: game.magicWordOdd,
                            playerEven: game.playerEven,
                            playerEvenJoinedTime: game.playerEvenJoinedTime,
                            playerOdd: game.playerOdd,
                            startTime: game.startTime,
                            status: game.status,
                            totalLength: game.totalLength,
                        });
                    } else {
                        setcurrentGame(null);
                    }
    
                    // Set past games
                    const records = [];
                    for (let one of games) {
                        if (one.status === GameStatus.FINISHED) {
                            records.push({
                                cost: one.cost,
                                endTime: one.endTime,
                                hashOdd: one.hashOdd,
                                judge: one.judge,
                                magicWordEven: one.magicWordEven,
                                magicWordOdd: one.magicWordOdd,
                                playerEven: one.playerEven,
                                playerEvenJoinedTime: one.playerEvenJoinedTime,
                                playerOdd: one.playerOdd,
                                startTime: one.startTime,
                                status: one.status,
                                totalLength: one.totalLength,
                            });
                        }
                    }
    
                    setpastGames(records.reverse());
                }
            } else {
                console.log("Please change network to optimism goerli");
                switchNetwork(420);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startGame = async () => {
        if (magicWord === "") {
            alert("Please enter your magic word");
            return;
        }

        setisLoading(true);
        seterrorMessage(null);

        try {
            const oddGameContract = new Contract(contractAddress, contractABI, signer);
            
            const gameCost = await oddGameContract.gameCost();
            const wordHash = ethers.utils.id(magicWord);
    
            const tx = await oddGameContract.startGame(wordHash, {
                value: gameCost,
            });
    
            await tx.wait(2);
    
            await fetchGames();
    
            setmagicWord("");
        } catch (err) {
            console.error(err);
            seterrorMessage(err.message);
        } finally {
            setisLoading(false);
        }
    };

    const joinGame = async () => {
        if (magicWord === "") {
            alert("Please enter your magic word");
            return;
        }

        setisLoading(true);
        seterrorMessage(null);

        try {
            const oddGameContract = new Contract(contractAddress, contractABI, signer);

            const gameCost = await oddGameContract.gameCost();

            const tx = await oddGameContract.joinGame(magicWord, {
                value: gameCost,
            });

            await tx.wait(2);

            await fetchGames();

            setmagicWord("");
        } catch (err) {
            console.error(err);
            seterrorMessage(err.message);
        } finally {
            setisLoading(false);
        }
    };

    const reveal = async () => {
        if (magicWord === "") {
            alert("Please enter your magic word");
            return;
        }

        setisLoading(true);
        seterrorMessage(null);

        try {
            const oddGameContract = new Contract(contractAddress, contractABI, signer);

            const gameCost = await oddGameContract.gameCost();

            const tx = await oddGameContract.reveal(magicWord);

            await tx.wait(2);

            await fetchGames();

            setmagicWord("");
        } catch (err) {
            console.error(err);
            seterrorMessage(err.message);
        } finally {
            setisLoading(false);
        }
    };

    const judge = async () => {
        setisLoading(true);
        seterrorMessage(null);

        try {
            const oddGameContract = new Contract(contractAddress, contractABI, signer);

            const tx = await oddGameContract.judge();

            await tx.wait(2);

            await fetchGames();

            setmagicWord("");
        } catch (err) {
            console.error(err);
            seterrorMessage(err.message);
        } finally {
            setisLoading(false);
        }
    };

    const loadingIcon = () => (
        <svg
            className="animate-spin -mt-1 h-6 w-6 text-white inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    );

    const localTime = (timestamp) => {
        return `${new Date(timestamp * 1000).toLocaleDateString()} ${new Date(
            timestamp * 1000
        ).toLocaleTimeString()}`;
    };

    const shortenAddress = (address) => {
        return `${address.substr(0, 4)}...${address.substr(-4)}`;
    };

    return (
        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 8</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="max-w-7xl mx-auto px-6 py-16 md:p-20">
                <h1 className="text-5xl font-bold text-center text-rose-400">
                    Road to Web3 - Week 8 [Optimism Goerli]
                </h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-rose-500">
                    This is a practice project to learn ethers.js and solidity. The eighth
                    week is to build a {" "}
                    <span className="bg-rose-200 font-mono inline-block px-1 rounded ring-1 ring-red-600">
                        better game on Optimism
                    </span> 
                    {" "}
                    smart contract.
                    <br />
                    <a
                        href="https://www.youtube.com/watch?v=TL5NoWky3Uk"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-slate-800 rounded-md text-slate-300 mt-4 p-1 px-2 hover:bg-slate-700"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                {isDisconnected ? (
                    <div className="text-center mt-12">
                        <h3 className="text-rose-800 text-xl">
                            Connect Your Wallet
                        </h3>
                    </div>
                ) : (
                    <div className="flex md:flex-nowrap mt-16 gap-x-4 flex-wrap sm:flex-nowrap">
                        <div className="w-full order-1 sm:order-0 sm:w-auto sm:flex-1 p-4 text-rose-500">
                            <h4 className="text-xl font-bold">How to play</h4>
                            <ul className="mt-2 list-disc">
                                <li>
                                    Two parties per game, one is <strong>Player Odd</strong> (who
                                    started the game) and the other is{" "}
                                    <strong>Player Even</strong> (who joined the game).
                                </li>
                                <li>
                                    The game result is determined by the the sum of length of the
                                    magic words from both players, if that&apos;s odd then{" "}
                                    <strong>Player Odd</strong> wins, otherwise{" "}
                                    <strong>Player Even</strong> wins.
                                </li>
                                <li>
                                    Because of there are no real private variables on blockchain,
                                    everyone can reveal the data of a smart contract. So the word{" "}
                                    <strong>Player Odd</strong> submitted during game creation
                                    will be hashed with keccak256.
                                </li>
                                <li>
                                    After that, <strong>Player Even</strong> can join the game
                                    with word in plaintext.
                                </li>
                                <li>
                                    <strong>Player Odd</strong> takes the responsibility to reveal
                                    the word after <strong>Player Even</strong> submitted the
                                    word, which must be the same as the word in game creation,
                                    verify by the hash on-chain.
                                </li>
                                <li>
                                    If <strong>Player Odd</strong> is not revealing the word
                                    within a certain time, everyone can help to judge the game and
                                    receive a reward of 5% of the game balance, and{" "}
                                    <strong>Player Even</strong> will be the winner.
                                </li>
                                <li>
                                    Cost of starting / joining the game is{" "}
                                    <strong>0.001 ETH</strong>.
                                </li>
                                <li>
                                    This is only a programming practice and just for fun on
                                    testnet.
                                </li>
                            </ul>
                        </div>
                        <div className="w-full order-0 sm:order-1 sm:w-auto sm:flex-1">
                            {!currentGame && (
                                <div className="self-start w-full bg-rose-400 ring-4 ring-rose-500 rounded-xl overflow-hidden">
                                    <h4 className="text-2xl text-center bg-rose-300 p-2 text-rose-800">
                                        Start a New Game
                                    </h4>
                                    <div className="p-4">
                                        <h5 className="text-center p-2 text-xl text-rose-800">
                                            Enter Your Magic Word
                                        </h5>
                                        <input
                                            type="text"
                                            onInput={() => setmagicWord(event.target.value)}
                                            value={magicWord}
                                            className="w-full bg-rose-50 text-center text-2xl ring-2 outline-none p-2 focus:ring-4 ring-red-300 transition rounded-lg mt-2"
                                            placeholder=""
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={startGame}
                                            disabled={isLoading}
                                            className="py-2 px-5 mt-4 pb-3 w-full bg-rose-700 hover:bg-rose-800 transition shadow rounded-lg text-rose-300 text-xl"
                                        >
                                            {isLoading ? loadingIcon() : <>Start with 0.001 ETH</>}
                                        </button>
                                        {errorMessage && (
                                            <p className="px-4 py-2 text-red-600 break-words break-all">
                                                {errorMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentGame &&
                                currentGame.status ===
                                GameStatus.WAITING_FOR_PLAYER_EVEN_TO_JOIN && (
                                    <div className="self-start w-full bg-rose-400 ring-4 ring-rose-500 rounded-xl overflow-hidden">
                                        <h4 className="text-2xl text-center bg-rose-300 p-2 text-rose-800">
                                            Join the Game by {shortenAddress(currentGame.playerOdd)}
                                        </h4>
                                        <div className="p-4">
                                            <h5 className="text-center p-2 text-xl text-rose-800">
                                                Game started at {localTime(currentGame.startTime)}
                                            </h5>
                                            <h5 className="text-center p-2 text-xl text-rose-800">
                                                Enter Your Magic Word
                                            </h5>
                                            <input
                                                type="text"
                                                onInput={() => setmagicWord(event.target.value)}
                                                value={magicWord}
                                                className="w-full bg-rose-50 text-center text-2xl ring-2 outline-none p-2 focus:ring-4 ring-red-300 transition rounded-lg mt-2"
                                                placeholder=""
                                                disabled={isLoading}
                                            />
                                            <button
                                                onClick={joinGame}
                                                disabled={isLoading}
                                                className="py-2 px-5 mt-4 pb-3 w-full bg-rose-700 hover:bg-rose-800 transition shadow rounded-lg text-rose-300 text-xl"
                                            >
                                                {isLoading ? loadingIcon() : <>Join with 0.001 ETH</>}
                                            </button>
                                            {errorMessage && (
                                                <p className="px-4 py-2 text-red-600 break-words break-all">
                                                    {errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {currentGame &&
                                currentGame.status ===
                                GameStatus.WAITING_FOR_PLAYER_ODD_TO_REVEAL && (
                                    <div className="self-start w-full bg-rose-400 ring-4 ring-rose-500 rounded-xl overflow-hidden">
                                        <h4 className="text-2xl text-center bg-rose-300 p-2 text-rose-800">
                                            Waiting for {shortenAddress(currentGame.playerOdd)} to
                                            Reveal
                                        </h4>
                                        <div className="p-4">
                                            <h5 className="text-center p-2 text-xl text-rose-800">
                                                {shortenAddress(currentGame.playerEven)} joined at{" "}
                                                {localTime(currentGame.playerEvenJoinedTime)}
                                            </h5>

                                            <h5 className="text-center p-2 text-xl text-rose-800">
                                                Must be revealed before {localTime(currentGame.endTime)}
                                            </h5>

                                            {currentGame.playerOdd.toLowerCase() ===
                                                currentAccount.toLowerCase() && (
                                                    <>
                                                        <h5 className="text-center p-2 text-xl text-rose-800">
                                                            Enter Your Magic Word
                                                        </h5>
                                                        <input
                                                            type="text"
                                                            onInput={() => setmagicWord(event.target.value)}
                                                            value={magicWord}
                                                            className="w-full bg-rose-50 text-center text-2xl ring-2 outline-none p-2 focus:ring-4 ring-red-300 transition rounded-lg mt-2"
                                                            placeholder=""
                                                            disabled={isLoading}
                                                        />
                                                        <button
                                                            onClick={reveal}
                                                            disabled={isLoading}
                                                            className="py-2 px-5 mt-4 pb-3 w-full bg-rose-700 hover:bg-rose-800 transition shadow rounded-lg text-rose-300 text-xl"
                                                        >
                                                            {isLoading ? loadingIcon() : <>Reveal</>}
                                                        </button>
                                                    </>
                                                )}

                                            {currentGame.playerOdd.toLowerCase() !==
                                                currentAccount.toLowerCase() && (
                                                    <>
                                                        <button
                                                            onClick={judge}
                                                            disabled={
                                                                isLoading ||
                                                                currentGame.endTime * 1000 > +Date.now()
                                                            }
                                                            className="py-2 px-5 mt-4 pb-3 w-full bg-rose-700 hover:bg-rose-800 transition shadow rounded-lg text-rose-300 text-xl"
                                                        >
                                                            {isLoading ? (
                                                                loadingIcon()
                                                            ) : (
                                                                <>
                                                                    {currentGame.endTime * 1000 > +Date.now()
                                                                        ? "Not Yet"
                                                                        : "Judge"}
                                                                </>
                                                            )}
                                                        </button>
                                                        <p className="text-rose-600 mt-3 leading-tight text-center">
                                                            You can receive 5% of the game balance by helping to
                                                            judge the game that exceeded the time to reveal.
                                                        </p>
                                                    </>
                                                )}
                                            {errorMessage && (
                                                <p className="px-4 py-2 break-words break-all text-red-600">
                                                    {errorMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* {pastGames.map((game, index) => (
                                <div
                                    key={index}
                                    className="self-start w-full bg-slate-700 ring-4 ring-slate-800 rounded-xl overflow-hidden my-6"
                                >
                                    <h4 className="text-2xl text-center bg-slate-600 p-2 text-slate-300">
                                        {localTime(game.startTime)}
                                    </h4>
                                    <div className="p-4 text-slate-300 text-lg">
                                        <div className="flex">
                                            <p className="flex-1">
                                                <span className="text-slate-500">Started by </span>
                                                {shortenAddress(game.playerOdd)}
                                            </p>
                                            <p className="flex-1">
                                                <span className="text-slate-500">Joined by</span>{" "}
                                                {shortenAddress(game.playerEven)}
                                            </p>
                                        </div>
                                        <div className="flex">
                                            {game.magicWordOdd && (
                                                <p className="flex-1 break-words break-all">
                                                    <span className="text-slate-500">Started word: </span>
                                                    {game.magicWordOdd || "-"}
                                                </p>
                                            )}
                                            {!game.magicWordOdd && (
                                                <p className="flex-1">
                                                    <span className="text-slate-500">
                                                        Started Word not revealed
                                                    </span>
                                                </p>
                                            )}
                                            <p className="flex-1 break-words break-all">
                                                <span className="text-slate-500">Joined word: </span>
                                                {game.magicWordEven}
                                            </p>
                                        </div>
                                        <div className="flex">
                                            <p className="flex-1">
                                                <span className="text-slate-500">
                                                    Total game cost:{" "}
                                                </span>
                                                {ethers.utils.formatEther(game.cost.mul(2))} ETH
                                            </p>
                                            <p className="flex-1">
                                                <span className="text-slate-500">Total Length: </span>
                                                {Number(game.totalLength)
                                                    ? Number(game.totalLength)
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div className="flex">
                                            <p className="flex-1">
                                                <span className="text-slate-500">Winner: </span>
                                                {Number(game.totalLength) === 0 &&
                                                    `${shortenAddress(game.playerEven)} (Even)`}
                                                {Number(game.totalLength) !== 0 &&
                                                    Number(game.totalLength) % 2 === 0 &&
                                                    `${shortenAddress(game.playerEven)} (Even)`}
                                                {Number(game.totalLength) !== 0 &&
                                                    Number(game.totalLength) % 2 !== 0 &&
                                                    `${shortenAddress(game.playerOdd)} (Odd)`}
                                            </p>
                                            {game.judge !==
                                                "0x0000000000000000000000000000000000000000" && (
                                                    <p className="flex-1">
                                                        <span className="text-slate-500">Judged by </span>
                                                        {shortenAddress(game.judge)}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))} */}
                        </div>
                    </div>
                    
                )}
            </main>
        </div>
    );
}