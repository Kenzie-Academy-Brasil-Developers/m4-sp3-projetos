import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "../Database";

export const ensureProjectsExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const projectId: number = parseInt(req.params.id);

  const queryString: string = `
    SELECT COUNT(*) FROM
        projects
    WHERE
        id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [projectId],
  };
  const queryResult = await client.query(queryConfig);

  if (Number(queryResult.rows[0].count) > 0) {
    return next();
  }
  return res.status(404).json({
    message: "project not found.",
  });
};

export const ensureUpdateProject = (
  request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  const bodyData: Array<string> = Object.keys(request.body);
  const requiredData: Array<string> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];
  bodyData.map((element) => {
    if (!requiredData.includes(element)) {
      delete request.body[element];
    }
  });
  return next();
};
