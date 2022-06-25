import type { NextPage } from "next";
import { signIn, useSession } from 'next-auth/react';

const Register: NextPage = () => {
  const { data: session } = useSession();

  return (
    <div>
      <main>
        <h1>Register to claim a distribution</h1>
        <div>
          <button
            onClick={() => {
              signIn();
            }}
          >
            Sign in with Github
          </button>
          <div>{JSON.stringify(session)}</div>
        </div>
      </main>
    </div>
  );
};

export default Register;
