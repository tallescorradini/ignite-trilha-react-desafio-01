import Link from 'next/link';
import Image from 'next/image';

export default function Header(): JSX.Element {
  return (
    <header>
      <Link href="/">
        <a>
          <Image
            alt="logo"
            src="/Logo.svg"
            layout="fixed"
            width="239"
            height="26"
          />
        </a>
      </Link>
    </header>
  );
}
