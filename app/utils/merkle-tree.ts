import { randomBytes } from 'crypto';
import { BigNumber } from 'ethers';
import { MerkleTree } from 'zkp-merkle-airdrop-lib';

interface Commitment {
  public_id: string;
}

let randomBigInts: BigInt[] = [];
for (let i = 0; i < 8192; i++) {
  randomBigInts.push(randomBigInt(31));
}

export function randomBigInt(nBytes: number): BigInt {
  return toBigIntLE(randomBytes(nBytes));
}

export function toBigIntLE(buff: Buffer) {
  const reversed = Buffer.from(buff);
  reversed.reverse();
  const hex = reversed.toString("hex");
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
}

export const generateTree = (commitments: Commitment[]) => {
  const length = commitments.length;
  let commitmentsBigInts: BigInt[] = commitments.map((commitment) =>
    BigNumber.from(commitment.public_id).toBigInt()
  );
  if (length < 8192) {
    for (let i = length; i < 8192; i++) {
      commitmentsBigInts.push(randomBigInts[i]);
    }
  }
  return MerkleTree.createFromLeaves(commitmentsBigInts);
};
