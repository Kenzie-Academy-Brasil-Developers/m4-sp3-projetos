import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "../Database";

export const ensureDevExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const devId: number = parseInt(req.params.id);

  const queryString: string = `
    SELECT COUNT(*) FROM
        developers
    WHERE
        id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devId],
  };
  const queryResult = await client.query(queryConfig);

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }
  return res.status(404).json({
    message: "Developer not found.",
  });
};
export const ensureDevUpdateInfo = (
  request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  const keysBody: Array<string> = Object.keys(request.body);
  const requiredData: Array<string> = ["developerSince", "preferredOS"];
  keysBody.map((elem) => {
    if (!requiredData.includes(elem)) {
      delete request.body[elem];
    }
  });

  return next();
};

export const ensureDevUpdate = (
  request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  const keysBody: Array<string> = Object.keys(request.body);
  const requiredData: Array<string> = ["name", "email"];
  keysBody.map((elem) => {
    if (!requiredData.includes(elem)) {
      delete request.body[elem];
    }
  });

  return next();
};
