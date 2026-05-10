import { tool } from "ai";

import type { Files } from "../index.js";
import { executors } from "../internal/ai-tools/executors.js";
import { TOOL_SCHEMAS } from "../internal/ai-tools/schemas.js";
import type { ToolOptions } from "./types.js";

export const listFiles = (files: Files) =>
  tool({
    description: TOOL_SCHEMAS.listFiles.description,
    execute: (input) => executors.listFiles(files, input),
    inputSchema: TOOL_SCHEMAS.listFiles.input,
  });

export const getFileMetadata = (files: Files) =>
  tool({
    description: TOOL_SCHEMAS.getFileMetadata.description,
    execute: (input) => executors.getFileMetadata(files, input),
    inputSchema: TOOL_SCHEMAS.getFileMetadata.input,
  });

export const downloadFile = (files: Files) =>
  tool({
    description: TOOL_SCHEMAS.downloadFile.description,
    execute: (input) => executors.downloadFile(files, input),
    inputSchema: TOOL_SCHEMAS.downloadFile.input,
  });

export const getFileUrl = (files: Files) =>
  tool({
    description: TOOL_SCHEMAS.getFileUrl.description,
    execute: (input) => executors.getFileUrl(files, input),
    inputSchema: TOOL_SCHEMAS.getFileUrl.input,
  });

export const uploadFile = (
  files: Files,
  { needsApproval = true }: ToolOptions = {}
) =>
  tool({
    description: TOOL_SCHEMAS.uploadFile.description,
    execute: (input) => executors.uploadFile(files, input),
    inputSchema: TOOL_SCHEMAS.uploadFile.input,
    needsApproval,
  });

export const deleteFile = (
  files: Files,
  { needsApproval = true }: ToolOptions = {}
) =>
  tool({
    description: TOOL_SCHEMAS.deleteFile.description,
    execute: (input) => executors.deleteFile(files, input),
    inputSchema: TOOL_SCHEMAS.deleteFile.input,
    needsApproval,
  });

export const copyFile = (
  files: Files,
  { needsApproval = true }: ToolOptions = {}
) =>
  tool({
    description: TOOL_SCHEMAS.copyFile.description,
    execute: (input) => executors.copyFile(files, input),
    inputSchema: TOOL_SCHEMAS.copyFile.input,
    needsApproval,
  });

export const signUploadUrl = (
  files: Files,
  { needsApproval = true }: ToolOptions = {}
) =>
  tool({
    description: TOOL_SCHEMAS.signUploadUrl.description,
    execute: (input) => executors.signUploadUrl(files, input),
    inputSchema: TOOL_SCHEMAS.signUploadUrl.input,
    needsApproval,
  });
