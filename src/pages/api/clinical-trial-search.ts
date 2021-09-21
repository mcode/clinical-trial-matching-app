import type { NextApiRequest, NextApiResponse } from 'next';
import mockSearchResults from '@/__mocks__/results.json';

const handler = (req: NextApiRequest, res: NextApiResponse<typeof mockSearchResults>): void => {
  res.status(200).json(mockSearchResults);
};

export default handler;
