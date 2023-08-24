import Footer from "../components/navigation/footer";
import Navbar from "../components/navigation/navbar";

export default function MainLayout({ children }) {
	return (
		<div className="min-h-screen bg-gray-300">
            <Navbar />
            {children}
			<Footer />
		</div>
	);
}
