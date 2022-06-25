import type { NextPage } from "next";
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Worktree</title>
        <meta
          name="description"
          content="ZK airdrops for Github contributors"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Worktree</h1>
      </main>
    </div>
  );
};

export default Home;
