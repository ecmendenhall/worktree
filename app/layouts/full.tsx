interface Props {
  children: JSX.Element;
}

const Full = ({ children }: Props) => {
  return (
    <div className="max-w-screen-xl m-auto">
      <header className="text-center my-8">
        <h1 className="text-4xl font-extrabold">
          <a href="/">
            <span>🛠 </span>
            Worktree
            <span> 🌳</span>
          </a>
        </h1>
        <div className="italic">ZK airdrops for Github contributors</div>
      </header>
      <main className="px-16">{children}</main>
    </div>
  );
};

export default Full;
