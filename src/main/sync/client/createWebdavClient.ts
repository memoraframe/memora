import { WebDAVClient, createClient, AuthType } from "webdav";
import MemoraConfig from "@types/MemoraConfig";

export function createWebdavClient(config: MemoraConfig): WebDAVClient {
    return createClient(config.webdavConfig.webdavEndpoint, {
      authType: AuthType.Password,
      username: config.webdavConfig.webdavUsername,
      password: config.webdavConfig.webdavPassword,
    });
  }
  