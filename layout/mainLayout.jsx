import Head from "next/head";
import Footer from "../components/navigation/footer";
import Navbar from "../components/navigation/navbar";

export default function MainLayout({ children }) {
	return (
		<div className="min-h-screen bg-indigo-100">
			<Head>
				<title>Road to Web3</title>
				<meta
					name="description"
					content="Meta description for the Road to web3"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Navbar />
			{children}
			<Footer />
		</div>
	);
}
