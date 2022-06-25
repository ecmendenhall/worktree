interface Props {
  title: string;
  description: string;
  url: string;
}

const MenuCard = ({ title, description, url }: Props) => {
  return (
    <a href={url}>
      <div className="px-12 py-8 bg-zinc-100 hover:bg-zinc-300 hover:cursor-pointer text-center shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-green-600">{title}</h2>
        <p>{description}</p>
      </div>
    </a>
  );
};

export default MenuCard;
