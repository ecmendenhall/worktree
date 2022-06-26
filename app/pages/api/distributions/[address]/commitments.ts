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
        const { address } = req.query;
        const { username, publicId } = req.body;
        if (token.name !== username) return res.status(403).end();
        const distroResponse = await supabase
          .from("distributions")
          .select()
          .eq("tree_address", address);
        const distroBody = distroResponse.body || [];
        const { id } = distroBody[0];
        const commitmentResponse = await supabase.from("commitments").insert({
          distribution_id: id,
          username: username,
          public_id: publicId,
        });
        return res.status(201).end();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.log(e);
        return res.status(500).json({ message });
      }
    } else {
      return res.status(401).end();
    }
  } else if (req.method == "GET") {
    try {
      const { address } = req.query;
      const distroResponse = await supabase
        .from("distributions")
        .select()
        .eq("tree_address", address);
      const distroBody = distroResponse.body || [];
      const { id } = distroBody[0];
      const commitmentsResponse = await supabase
        .from("commitments")
        .select()
        .eq("distribution_id", id);
      return res.status(200).json({ commitments: commitmentsResponse.body });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log(e);
      return res.status(500).json({ message });
    }
  }
  return res.status(404).end();
};
