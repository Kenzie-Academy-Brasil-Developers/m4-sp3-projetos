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
  listProjectsAndDev,
  retrieveAllDevs,
  retrieveDevs,
  updateDev,
  updateDevInfo,
} from "./Logics/developers.logics";
import {
  ensureDevExists,
  ensureDevUpdate,
  ensureDevUpdateInfo,
} from "./Middlewares/developers.middlewares";
import {
  ensureProjectsExists,
  ensureUpdateProject,
} from "./Middlewares/projects.middleware";
const app: Application = express();
app.use(express.json());

app.post("/developers", createDev);
app.post("/developers/:id/infos", ensureDevExists, createDevInfo);
app.patch(
  "/developers/:id/infos",
  ensureDevUpdateInfo,
  ensureDevExists,
  updateDevInfo
);
app.patch("/developers/:id", ensureDevUpdate, ensureDevExists, updateDev);
app.get("/developers/:id", ensureDevExists, retrieveDevs);
app.get("/developers", retrieveAllDevs);
app.get("/developers/:id/projects", ensureDevExists, listProjectsAndDev);
app.delete("/developers/:id", ensureDevExists, deleteDevById);

app.post("/projects", createProjects);
app.get("/projects", listProjects);
app.get("/projects/:id", ensureProjectsExists, retrieveProjectsId);
app.patch(
  "/projects/:id",
  ensureUpdateProject,
  ensureProjectsExists,
  updatePartial
);
app.delete("/projects/:id", ensureProjectsExists, deleteProjectById);
app.post(
  "/projects/:id/technologies",
  ensureProjectsExists,
  createProjectsTech
);
app.delete(
  "/projects/:id/technologies/:name",
  ensureProjectsExists,
  deleteTech
);

app.listen(3000, async () => {
  console.log("server is running");
  await startDatabase();
});
