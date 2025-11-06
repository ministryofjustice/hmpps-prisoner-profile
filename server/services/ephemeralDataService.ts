import { randomUUID, UUID } from 'crypto'
import { EphemeralDataStore, EphemeralDataStoreResponse } from '../data/ephemeralDataStore/ephemeralDataStore'

export default class EphemeralDataService {
  constructor(private readonly ephemeralDataStore: EphemeralDataStore) {}

  async cacheData<T>(value: T, key?: UUID, ttlMinutes: number = 360): Promise<UUID> {
    const uuid = key ?? randomUUID()
    return this.ephemeralDataStore.cacheData(uuid, value, ttlMinutes).then(() => uuid)
  }

  async getData<T>(key: UUID): Promise<EphemeralDataStoreResponse<T>> {
    return this.ephemeralDataStore.getData(key)
  }

  async removeData(key: UUID): Promise<void> {
    await this.ephemeralDataStore.removeData(key)
  }
}
