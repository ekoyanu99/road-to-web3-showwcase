import styles from "../styles/Home.module.css";
import HomesComponent from "../components/HomesComponent";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <HomesComponent />
      </main>
    </div>
  );
}
