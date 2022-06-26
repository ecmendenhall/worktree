import type { NextPage } from "next";
import { useSession } from "next-auth/react";

import CreateCommitment from "../../components/create-commitment";
import GithubButton from "../../components/github-button";
import Full from "../../layouts/full";

const Register: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div>
      <Full>
        <div>
          <div className="py-8 px-16 bg-zinc-100 shadow-md rounded-md">
            <h2 className="text-center text-2xl text-green-600 font-bold mb-8">
              Register as a contributor
            </h2>
            <div className="flex flex-row place-content-center">
              {session?.user.name ? (
                <CreateCommitment user={session.user.name} />
              ) : (
                <GithubButton />
              )}
            </div>
          </div>
          {JSON.stringify(session)}
        </div>
      </Full>
    </div>
  );
};

export default Register;
