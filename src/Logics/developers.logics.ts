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
    const devData: IDevelope = req.body;

    if (!devData.name) {
    }
    const queryString: string = format(
      `
        INSERT INTO
                developers(%I)
        VALUES (%L)
        RETURNING *;
        `,
      Object.keys(devData),

      Object.values(devData)
    );
    const queryResult: devResult = await client.query(queryString);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("developers_email_key")) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    if (error.message.includes("does not exist")) {
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
    const devInfoData: IDevInfoRequest = req.body;

    let queryString: string = format(
      `
    INSERT INTO 
          developer_infos(%I)
        VALUES  (%L)
        RETURNING*;
    `,
      Object.keys(devInfoData),
      Object.values(devInfoData)
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

    queryResult = await client.query(queryConfig);

    return res.status(201).json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("invalid input")) {
      return res.status(400).json({
        message: "invalid data",
      });
    }
    if (error.message.includes("does not exist")) {
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
  request: Request,
  response: Response
): Promise<Response> => {
  if (request.body.id) {
    return response.status(400).json({
      message: "Erro updating id!",
    });
  }
  try {
    const id: number = parseInt(request.params.id);
    const projectData = Object.values(request.body);
    const listKeys = Object.keys(request.body);

    const queryString: string = format(
      `
        UPDATE
        developer_infos
        SET(%I) = ROW(%L)  
        WHERE 
            id = $1
        RETURNING *;      
    `,
      listKeys,
      projectData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };

    const queryResult: devAndInformationResult = await client.query(
      queryConfig
    );
    return response.json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("invalid input")) {
      return response.status(400).json({
        message: "invalid data",
      });
    }
    if (error.message.includes("does not exist")) {
      return response.status(400).json({
        message: "The correct keys are: developerSince and preferredOS",
      });
    }
    console.log(error.message);
    return response.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateDev = async (
  request: Request,
  response: Response
): Promise<Response> => {
  if (request.body.id) {
    return response.status(400).json({
      message: "Erro updating id!",
    });
  }
  try {
    const id: number = parseInt(request.params.id);
    const projectData = Object.values(request.body);
    const listKeys = Object.keys(request.body);

    const queryString: string = format(
      `
        UPDATE
            developers
        SET(%I) = ROW(%L)  
        WHERE 
            id = $1
        RETURNING *;      
    `,
      listKeys,
      projectData
    );

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };

    const queryResult: devAndInformationResult = await client.query(
      queryConfig
    );
    return response.json(queryResult.rows[0]);
  } catch (error: any) {
    if (error.message.includes("developers_email_key")) {
      return response.status(400).json({
        message: "Email already exists",
      });
    }
    if (error.message.includes("does not exist")) {
      return response.status(400).json({
        message: "The correct keys are: name and email",
      });
    }
    if (error instanceof Error) {
      return response.status(409).json({
        message: error.message,
      });
    }
    console.log(error.message);
    return response.status(500).json({
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
