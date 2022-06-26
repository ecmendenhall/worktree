import type { NextPage } from "next";
import { useSession } from 'next-auth/react';

import Connect from '../../components/connect';
import SiweButton from '../../components/siwe-button';
import UpdateDistribution from '../../components/update-distribution';
import Full from '../../layouts/full';

const Update: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div>
      <Full>
        <div>
          <Connect />
          <div className="py-8 px-16 bg-zinc-100 shadow-md rounded-md">
            <h2 className="text-center text-2xl text-green-600 font-bold mb-8">
              Update a distribution
            </h2>
            <div className="flex flex-row place-content-center">
              {session?.user.address ? <UpdateDistribution /> : <SiweButton />}
            </div>
          </div>
        </div>
      </Full>
    </div>
  );
};

export default Update;
