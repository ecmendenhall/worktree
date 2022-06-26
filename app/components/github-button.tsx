import { signIn, useSession } from "next-auth/react";

const GithubButton = () => {
  return (
    <button
      className="py-4 px-8 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600"
      onClick={() => signIn("github")}
    >
      Sign in to Github
    </button>
  );
};

export default GithubButton;
