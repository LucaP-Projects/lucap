import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);
export const { GET, POST, PUT, PATCH, DELETE } = handlers;
