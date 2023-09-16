import Head from "next/head";
import { useState, useEffect } from "react";
import { useAccount, useSigner, useNetwork, useSwitchNetwork } from "wagmi";
import { Contract } from "ethers";
import Image from "next/image";
import { useQuery, gql } from "@apollo/client";

const Profile = gql`
  query Profile {
  profile(request: { profileId: "0x01" }) {
    id
    name
    bio
    attributes {
      displayType
      traitType
      key
      value
    }
    followNftAddress
    metadata
    isDefault
    picture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          url
          mimeType
        }
      }
      __typename
    }
    handle
    coverPicture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          url
          mimeType
        }
      }
      __typename
    }
    ownedBy
    dispatcher {
      address
      canUseRelay
    }
    stats {
      totalFollowers
      totalFollowing
      totalPosts
      totalComments
      totalMirrors
      totalPublications
      totalCollects
    }
    followModule {
      ... on FeeFollowModuleSettings {
        type
        amount {
          asset {
            symbol
            name
            decimals
            address
          }
          value
        }
        recipient
      }
      ... on ProfileFollowModuleSettings {
        type
      }
      ... on RevertFollowModuleSettings {
        type
      }
    }
  }
}
`;

export default function Week10Component() {

    // Get the signer instance for the connected wallet
    const { data: signer } = useSigner();

    // State hooks to track the transaction hash and whether or not the NFT is being minted
    // Component state
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setisLoading] = useState(false);
    const [isInitialized, setisInitialized] = useState(false);

    const [profile, setprofile] = useState([]);
    const [coverProfile, setcoverProfile] = useState(null);
    const [imageProfile, setimageProfile] = useState(null);
    const [countFollowers, setcountFollowers] = useState(0);
    const [countFollowing, setcountFollowing] = useState(0);

    const { address, isDisconnected } = useAccount({
        onDisconnect() {
            setCurrentAccount(null);
        },
    });

    const { loading, error, data } = useQuery(Profile);

    useEffect(() => {
        checkIfWalletConnected();
    }, [address]);

    useEffect(() => {
        fetchProfile();
    }, [data]);

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

    const fetchProfile = async () => {
        try {
            setisLoading(true);
            if (data) {
                setprofile(data.profile);

                setcoverProfile(data.profile.coverPicture.original.url);
                setimageProfile(data.profile.picture.original.url);
                setcountFollowers(data.profile.stats.totalFollowers);
                setcountFollowing(data.profile.stats.totalFollowing);
            }
            setisLoading(false);
        } catch (error) {
            console.error(error);
        }
    }

    return (

        <div className="min-h-screen">
            <Head>
                <title>Road to Web3 - Week 10</title>
                <meta name="description" content="Tipping site" />
            </Head>

            <main className="max-w-6xl mx-auto px-6 py-12 md:p-10">
                <h1 className="text-5xl font-bold text-center text-sky-600">Road to Web3 - Week 10 [Polygon]</h1>
                <p className="text-center mt-4 text-lg max-w-xl mx-auto text-sky-500">
                    This is a practice project to learn Web3 and ethers.js. The tenth week is to &quot;Create a Decentralized Twitter &quot;
                    with Lens Protocol.
                    <br />
                    <a
                        href="https://docs.alchemy.com/docs/how-to-create-a-decentralized-twitter-with-lens-protocol"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-sky-600 rounded-md text-sky-200 mt-4 p-1 px-2 hover:bg-sky-800"
                    >
                        ➡️ Amazing tutorial here
                    </a>
                </p>

                <div className="p-8">

                    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                        <div className="md:flex">
                            <div className="md:shrink-0">
                                {profile.picture ? (
                                    <img
                                        src={
                                            profile.picture.original
                                                ? profile.picture.original.url
                                                : profile.picture.uri
                                        }
                                        className="h-48 w-full object-cover md:h-full md:w-48"
                                    />
                                ) : (
                                    <div
                                        style={{
                                            backgrondColor: "gray",
                                        }}
                                        className="h-48 w-full object-cover md:h-full md:w-48"
                                    />
                                )}
                            </div>
                            <div className="p-8">
                                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                                    {profile.handle}
                                    {
                                        profile.name &&
                                        " (" + profile.name + ")"}
                                </div>
                                <div className="block mt-1 text-sm leading-tight font-medium text-black hover:underline">
                                    {profile.bio}
                                </div>
                                <div className="mt-2 text-sm text-slate-900">{profile.ownedBy}</div>
                                <p className="mt-2 text-xs text-slate-500">
                                    following: {countFollowing} followers:{" "}
                                    {countFollowers}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}