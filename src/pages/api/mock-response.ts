import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * /api/mock-response
 * 
 * Echos back the request body. For testing purposes. 
 *  
 * @param req 
 * @param res 
 */
const handler = (req: NextApiRequest, res: NextApiResponse):void => {
  
  res.status(200).json(req.body);
    console.log("Hello");

};

export default handler;