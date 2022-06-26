import type { NextPage } from "next";
import Head from "next/head";

import MenuCard from "../components/menu-card";
import Full from "../layouts/full";

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
      <Full>
        <div className="grid md:px-16 md:grid-cols-2 md:grid-rows-2 gap-6 grid-cols-1">
          <MenuCard
            title="Create"
            description="Create a new contributor distribution"
            url="/distributions/create"
          />
          <MenuCard
            title="Update"
            description="Update tree for an open distribution"
            url="/distributions/update"
          />
          <MenuCard
            title="Register"
            description="Register as a project contributor"
            url="/distributions/register"
          />
          <MenuCard
            title="Claim"
            description="Claim a contributor distribution"
            url="/distributions/claim"
          />
        </div>
      </Full>
    </div>
  );
};

export default Home;
