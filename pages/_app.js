import '../styles/globals.css';
import Head from 'next/head';
export default function App({Component,pageProps}){
  return(<>
    <Head>
      <title>GainOS — AI Gym Logger</title>
      <meta name="description" content="AI-powered workout logger with progressive overload tracking and supplement research"/>
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
      <meta name="theme-color" content="#080810"/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
    </Head>
    <Component {...pageProps}/>
  </>);
}
