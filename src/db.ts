import { DataSource } from "typeorm"

import { config } from "@/config"

export const connectToDatabase = async () => {
  const source = new DataSource(config.db)

  return await source.initialize()
}
