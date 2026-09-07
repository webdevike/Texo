// The entity registry. Shared by server (texo.config) and client. One line per entity.
import { issue } from "./issue";
import { project } from "./project";

export const entities = [issue, project];
