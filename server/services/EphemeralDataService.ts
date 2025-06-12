import { UUID } from 'node:crypto'
import { EphemeralDataStore, EphemeralDataStoreResponse } from '../data/ephemeralDataStore/ephemeralDataStore'

export default class EphemeralDataService {
  constructor(private readonly ephemeralDataStore: EphemeralDataStore) {}

  async cacheData<T>(value: T, ttlMinutes: number = 360): Promise<UUID> {
    return this.ephemeralDataStore.cacheData(value, ttlMinutes)
  }

  async getData<T>(key: UUID): Promise<EphemeralDataStoreResponse<T>> {
    return this.ephemeralDataStore.getData(key)
  }
}
