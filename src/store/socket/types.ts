export interface SocketState {
    hostname: string
    port: number
    path: string
    protocol: string
    reconnectInterval: number
    isConnected: boolean
    isConnecting: boolean
    connectingFailed: boolean
    loadings: string[]
    initializationList: string[]
    connection_id: number | null
}
