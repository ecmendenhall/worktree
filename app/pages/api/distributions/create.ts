import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from 'next-auth/jwt';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_KEY || ""
);

const secret = process.env.NEXTAUTH_SECRET;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    const token = await getToken({ req, secret });
    if (token) {
      try {
        console.log(req.body);
        const { chainId, treeAddress, claimAddress } = req.body;
        const dbResponse = await supabase.from("distributions").insert({
          chain_id: chainId,
          created_by: token.sub,
          tree_address: treeAddress,
          claim_address: claimAddress,
        });
        console.log(dbResponse);
        return res.status(201).end();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(e);
        return res.status(500).json({ message });
      }
    } else {
      return res.status(401).end();
    }
  }
  return res.status(404).end();
};
