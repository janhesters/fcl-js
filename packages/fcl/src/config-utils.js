import {config} from "@onflow/sdk"
import {constructApiQueryParams} from "./discovery/services"
import {VERSION} from "./VERSION"

const isServerSide = () => typeof window === "undefined"

const SESSION_STORAGE = {
  can: !isServerSide(),
  get: async key => JSON.parse(sessionStorage.getItem(key)),
  put: async (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
}

const LOCAL_STORAGE = {
  can: !isServerSide(),
  get: async key => JSON.parse(localStorage.getItem(key)),
  put: async (key, value) => localStorage.setItem(key, JSON.stringify(value)),
}

const NO_STORAGE = {
  can: false,
}

export const STORAGE_DEFAULT = SESSION_STORAGE
export const DISCOVERY_METHOD = "IFRAME/RPC"

export async function configLens(regex) {
  return Object.fromEntries(
    Object.entries(await config().where(regex)).map(([key, value]) => [
      key.replace(regex, ""),
      value,
    ])
  )
}

export async function getDiscoveryService() {
  const discoveryWalletUrl = await config.first([
    "discovery.wallet",
    "challenge.handshake",
  ])

  const include = await config.get("discovery.authn.include", [])
  const queryParams = constructApiQueryParams({version: VERSION, include})
  const discoveryWallet = `${discoveryWalletUrl}${queryParams}`

  const discoveryWalletMethod = await config.first([
    "discovery.wallet.method",
    "discovery.wallet.method.default",
  ])

  return {
    type: "authn",
    endpoint: discoveryWallet,
    method: discoveryWalletMethod,
  }
}
