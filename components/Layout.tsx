import Head from "next/head";
import React from "react";
import {useSelector} from "react-redux";

interface Props extends React.PropsWithChildren {
    title?: string,
}

const Layout = (props: Props) => {
    // @ts-ignore
    const darkMode = useSelector(state => state.darkMode.value);

  return (
      <>
          <Head>
              <title>{`Green's Restaurant${props.title ? ` - ${props.title}` : ''}`}</title>
          </Head>
          <div>
              {props.children}
          </div>
      </>
  )
};

export default Layout;