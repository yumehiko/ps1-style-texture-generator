import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { ProcessingParams } from '../types/processing'
import { ImageData } from '../types/image'

// アプリケーション全体の状態
export interface AppState {
  // 画像データ
  originalImage: ImageData | null
  processedImage: ImageData | null
  
  // 処理パラメータ
  parameters: ProcessingParams
  
  // UI状態
  isProcessing: boolean
  error: string | null
  
  // プレビュー状態
  preview3DEnabled: boolean
  previewRotation: boolean
}

// アクションタイプ
export type AppAction =
  | { type: 'SET_ORIGINAL_IMAGE'; payload: ImageData }
  | { type: 'SET_PROCESSED_IMAGE'; payload: ImageData | null }
  | { type: 'UPDATE_PARAMETERS'; payload: Partial<ProcessingParams> }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_3D_PREVIEW' }
  | { type: 'TOGGLE_ROTATION' }
  | { type: 'RESET' }

// 初期状態
const initialState: AppState = {
  originalImage: null,
  processedImage: null,
  parameters: {
    resolution: 256,
    colorDepth: 16,
    dithering: true
  },
  isProcessing: false,
  error: null,
  preview3DEnabled: false,
  previewRotation: true
}

// リデューサー関数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ORIGINAL_IMAGE':
      return {
        ...state,
        originalImage: action.payload,
        error: null
      }
    
    case 'SET_PROCESSED_IMAGE':
      return {
        ...state,
        processedImage: action.payload,
        isProcessing: false
      }
    
    case 'UPDATE_PARAMETERS':
      return {
        ...state,
        parameters: {
          ...state.parameters,
          ...action.payload
        }
      }
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
        error: null
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false
      }
    
    case 'TOGGLE_3D_PREVIEW':
      return {
        ...state,
        preview3DEnabled: !state.preview3DEnabled
      }
    
    case 'TOGGLE_ROTATION':
      return {
        ...state,
        previewRotation: !state.previewRotation
      }
    
    case 'RESET':
      return initialState
    
    default:
      return state
  }
}

// コンテキストの型定義
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

// コンテキスト作成
const AppContext = createContext<AppContextType | undefined>(undefined)

// プロバイダーコンポーネント
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// カスタムフック
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}