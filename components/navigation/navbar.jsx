import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import Link from 'next/link';
export default function Navbar() {
	return (
		<nav className={`${styles.navbar}`}>
			<Link href="/">
				<img
					className={styles.alchemy_logo}
					src="/alchemy_logo.svg"
				></img>
			</Link>
			<ConnectButton></ConnectButton>
		</nav>
	);
}
