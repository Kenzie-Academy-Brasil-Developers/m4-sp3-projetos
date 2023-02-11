import express, { Application } from "express";
import { startDatabase } from "./Database";
import {
  createProjects,
  createProjectsTech,
  deleteProjectById,
  deleteTech,
  listProjects,
  retrieveProjectsId,
  updatePartial,
} from "./Logics/projects";
import {
  createDev,
  createDevInfo,
  deleteDevById,
  retrieveAllDevs,
  retrieveDevs,
  updateDev,
  updateDevInfo,
} from "./Logics/developers.logics";
import { ensureDevExists } from "./Middlewares/developers.middlewares";
import { ensureProjectsExists } from "./Middlewares/projects.middleware";
const app: Application = express();
app.use(express.json());

app.post("/developers", createDev);

app.post("/developers/:id/infos", ensureDevExists, createDevInfo);

app.patch("/developers/:id/infos", updateDevInfo);

app.patch("/developers/:id", ensureDevExists, updateDev);

app.get("/developers/:id", ensureDevExists, retrieveDevs);

app.get("/developers", retrieveAllDevs);

app.delete("/developers/:id", deleteDevById);

app.post("/projects", createProjects);

app.get("/projects", listProjects);

app.get("/projects/:id", ensureProjectsExists, retrieveProjectsId);

app.patch("/projects/:id", ensureProjectsExists, updatePartial);

app.delete("/projects/:id", ensureProjectsExists, deleteProjectById);

app.post("/projects/:id/technologies", createProjectsTech);

app.delete("/projects/:id/technologies/:name", deleteTech);

app.listen(3000, async () => {
  console.log("server is running");
  await startDatabase();
});
