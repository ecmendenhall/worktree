import type { NextApiRequest, NextApiResponse } from "next";
import { fetchPaginate } from 'fetch-paginate';
import { getToken } from 'next-auth/jwt';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const secret = process.env.NEXTAUTH_SECRET;

interface ContributorData {
  login: string;
  id: number;
}

const fetchContributors = async (repo: string) => {
  const { items } = await fetchPaginate<ContributorData[], ContributorData>(
    `https://api.github.com/repos/${repo}/contributors?per_page=100`
  );
  console.log(items);
  return items.map(({ id, login }) => ({ id, login }));
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    const token = await getToken({ req, secret });
    try {
      const { address } = req.query;
      const dbResponse = await supabase
        .from("distributions")
        .select()
        .eq("tree_address", address);
      const body = dbResponse.body || [];
      const { repo, tree_address, claim_address } = body[0];
      const contributors = await fetchContributors(repo);
      const isContributor = !!contributors.find(
        ({ id }) => id.toString() === token?.sub
      );
      return res.status(200).json({
        repo,
        isContributor,
        treeAddress: tree_address,
        claimAddress: claim_address,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log(e);
      return res.status(500).json({ message });
    }
  }
  return res.status(404).end();
};
