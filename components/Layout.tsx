import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

type Props = {
    title?: string,
}

const Layout = (props: Props) => {
  return (
      <>
          <Head>
              <title>{`Green's Restaurant${props.title && ` - ${props.title}`}`}</title>
          </Head>
          <nav className='flex bg-green-500 px-12'>
              <Link href='/'>
                  <div className='w-36 h-36 relative transition-faster hover:scale-105 hover:cursor-pointer'>
                      <Image src='https://i.imgur.com/V2taHx1.png' alt='' layout='fill'/>
                  </div>
              </Link>
              <div>

              </div>
          </nav>
      </>
  )
};

export default Layout;