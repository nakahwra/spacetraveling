import styles from "./header.module.scss";
import Link from "next/link";

export default function Header() {
  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <img src="/logo.png" alt="logo" />
        </Link>
      </div>
    </header>
  )
}
