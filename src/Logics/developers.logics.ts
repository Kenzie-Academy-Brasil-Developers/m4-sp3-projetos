import { Request, Response } from "express";
import format from "pg-format";
import {
  devAndInformationResult,
  devInfoResult,
  devResult,
  IDevelope,
  IDevInfoRequest,
} from "../Interfaces/developers.interfaces";
import { client } from "../Database";

import { QueryConfig } from "pg";

export const createDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, email }: IDevelope = req.body;

    const queryString: string = format(
      `
        INSERT INTO
                developers(%I)
        VALUES (%L)
        RETURNING *;
        `,
      Object.keys({ name, email }),

      Object.values({ name, email })
    );
    const queryResult: devResult = await client.query(queryString);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("developers_email_key")) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    if (error.message.includes("null value in column")) {
      return res.status(400).json({
        message: "The correct keys are: name and email",
      });
    }
    if (error instanceof Error) {
      return res.status(409).json({
        message: error.message,
      });
    }
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createDevInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const devId: number = parseInt(req.params.id);
    const { developerSince, preferredOS }: IDevInfoRequest = req.body;

    let queryString: string = format(
      `
    INSERT INTO 
          developer_infos(%I)
        VALUES  (%L)
        RETURNING*;
    `,
      Object.keys({ developerSince, preferredOS }),
      Object.values({ developerSince, preferredOS })
    );
    let queryResult: devInfoResult = await client.query(queryString);

    queryString = `
    UPDATE
     developers
    SET
    "devInfoId" = $1
    WHERE
      id= $2
    RETURNING *;
  
  `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [queryResult.rows[0].id, devId],
    };

    await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("violates not-null constraint")) {
      return res.status(400).json({
        message: error.message,
        options: ["developerSince", "preferredOS"],
      });
    }

    if (error.message.includes("invalid input value for enum")) {
      return res.status(400).json({
        message: error.message,
        options: ["Windows", "Linux", "MacOS"],
      });
    }
    if (error instanceof Error) {
      return res.status(409).json({
        message: error.message,
      });
    }
    if (error.message.includes("null value in column ")) {
      return res.status(400).json({
        message: "The correct keys are: developerSince and preferredOS",
      });
    }
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const retrieveDevs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const devId: number = parseInt(req.params.id);
  const queryString = `
      SELECT
          dev.*,
          inf."developerSince",
          inf."preferredOS"
            FROM
        developers dev
      LEFT JOIN
        developer_infos inf ON dev."devInfoId" = inf.id
      WHERE 
        dev.id=$1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [devId],
  };
  const queryResult: devAndInformationResult = await client.query(queryConfig);

  return res.json(queryResult.rows[0]);
};

export const retrieveAllDevs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const queryString = `
      SELECT
          dev.*,
          inf."developerSince",
          inf."preferredOS"
            FROM
        developers dev
      LEFT JOIN
        developer_infos inf ON dev."devInfoId" = inf.id;
  `;

  const queryResult = await client.query(queryString);

  return res.json(queryResult.rows);
};

export const updateDevInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const bobyData = req.body;
    const id: number = +req.params.id;
    const queryString: string = format(
      `
    UPDATE
      developer_infos
    SET(%I) = ROW(%L)
    WHERE
      id = $1
    RETURNING *;
    `,
      Object.keys(bobyData),
      Object.values(bobyData)
    );
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult: devAndInformationResult = await client.query(
      queryConfig
    );
    return res.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("invalid input value for enum")) {
      return res.status(400).json({
        message: error.message,
        options: ["Windows", "Linux", "MacOS"],
      });
    }
    if (error instanceof Error) {
      return res.status(409).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const bodyData = req.body;
    const id: number = +req.params.id;
    const queryString: string = format(
      `
    UPDATE
      developers
    SET(%I) = ROW(%L)
    WHERE
      id = $1
    RETURNING *;
    `,
      Object.keys(bodyData),
      Object.values(bodyData)
    );
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult: devAndInformationResult = await client.query(
      queryConfig
    );
    return res.status(200).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("developers_email_key")) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    if (error.message.includes("error at or near ")) {
      return res.status(400).json({
        message: error.message,
        options: ["name", "email"],
      });
    }

    if (error instanceof Error) {
      return res.status(409).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteDevById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  try {
    const id: number = parseInt(request.params.id);

    const queryString: string = `
      DELETE FROM
          developers
      WHERE
        id = $1; 
    `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };

    await client.query(queryConfig);

    return response.status(204).send();
  } catch (error) {
    console.log(error);
    return response.json(error);
  }
};

export const listProjectsAndDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id: number = parseInt(request.params.id);

  const queryString = `
        SELECT
        developers.*,
            developer_infos ."developerSince",
            developer_infos ."preferredOS",
            projects.*
        FROM
        developers
        LEFT JOIN 
            developer_infos ON developers."devInfoId" = developer_infos.id
        RIGHT JOIN
          projects  ON projects."idDeveloper" = developers.id
        WHERE 
            developers.id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: devResult = await client.query(queryConfig);

  if (!queryResult.rows[0]) {
    return response.status(404).json({
      message: "Developer not found!",
    });
  }

  return response.json(queryResult.rows[0]);
};
