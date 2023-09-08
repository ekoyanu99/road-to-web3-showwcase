import Footer from "../components/navigation/footer";
import Navbar from "../components/navigation/navbar";

export default function MainLayout({ children }) {
	return (
		<div className="min-h-screen bg-indigo-100">
            <Navbar />
            {children}
			<Footer />
		</div>
	);
}
