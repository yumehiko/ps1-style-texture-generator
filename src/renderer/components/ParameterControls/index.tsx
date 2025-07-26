import React, { useCallback, useState, useEffect } from 'react'
import { ProcessingParams } from '../../types/processing'
import styles from './ParameterControls.module.css'

interface ParameterControlsProps {
  parameters: ProcessingParams
  isDisabled?: boolean
  onParameterChange?: (params: Partial<ProcessingParams>) => void
}

// スライダーの設定
const RESOLUTION_CONFIG = {
  steps: [16, 32, 48, 64, 96, 128, 256, 512],
  label: 'Resolution (px)'
}

const COLOR_DEPTH_CONFIG = {
  steps: [4, 8, 16, 24, 32, 64, 128],
  label: 'Color Depth'
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  isDisabled = false,
  onParameterChange
}) => {
  // 数値入力フィールドの状態
  const [resolutionInput, setResolutionInput] = useState(parameters.resolution.toString())
  const [colorDepthInput, setColorDepthInput] = useState(parameters.colorDepth.toString())

  // 現在の値からインデックスを取得
  const resolutionIndex = RESOLUTION_CONFIG.steps.indexOf(parameters.resolution)
  const colorDepthIndex = COLOR_DEPTH_CONFIG.steps.indexOf(parameters.colorDepth)


  // パラメータ変更時に入力フィールドを更新
  useEffect(() => {
    setResolutionInput(parameters.resolution.toString())
  }, [parameters.resolution])

  useEffect(() => {
    setColorDepthInput(parameters.colorDepth.toString())
  }, [parameters.colorDepth])

  const handleResolutionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10)
    const value = RESOLUTION_CONFIG.steps[index]
    if (value !== undefined && onParameterChange) {
      onParameterChange({ resolution: value })
    }
  }, [onParameterChange])

  const handleResolutionInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setResolutionInput(e.target.value)
  }, [])

  const handleResolutionInputBlur = useCallback(() => {
    const value = parseInt(resolutionInput, 10)
    if (!isNaN(value)) {
      const clampedValue = Math.max(RESOLUTION_CONFIG.steps[0], Math.min(RESOLUTION_CONFIG.steps[RESOLUTION_CONFIG.steps.length - 1], value))
      if (onParameterChange) {
        onParameterChange({ resolution: clampedValue })
      }
    } else {
      setResolutionInput(parameters.resolution.toString())
    }
  }, [resolutionInput, parameters.resolution, onParameterChange])

  const handleColorDepthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10)
    const value = COLOR_DEPTH_CONFIG.steps[index]
    if (value !== undefined && onParameterChange) {
      onParameterChange({ colorDepth: value })
    }
  }, [onParameterChange])

  const handleColorDepthInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColorDepthInput(e.target.value)
  }, [])

  const handleColorDepthInputBlur = useCallback(() => {
    const value = parseInt(colorDepthInput, 10)
    if (!isNaN(value)) {
      const clampedValue = Math.max(COLOR_DEPTH_CONFIG.steps[0], Math.min(COLOR_DEPTH_CONFIG.steps[COLOR_DEPTH_CONFIG.steps.length - 1], value))
      if (onParameterChange) {
        onParameterChange({ colorDepth: clampedValue })
      }
    } else {
      setColorDepthInput(parameters.colorDepth.toString())
    }
  }, [colorDepthInput, parameters.colorDepth, onParameterChange])

  const handleDitheringChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onParameterChange) {
      onParameterChange({ dithering: e.target.checked })
    }
  }, [onParameterChange])


  return (
    <div className={styles.container}>
      {/* 長辺ピクセル数スライダー */}
      <div className={styles.control}>
          <div className={styles.label}>
            <span>{RESOLUTION_CONFIG.label}</span>
            <input
              type="number"
              className={styles.numberInput}
              value={resolutionInput}
              onChange={handleResolutionInputChange}
              onBlur={handleResolutionInputBlur}
              min={RESOLUTION_CONFIG.steps[0]}
              max={RESOLUTION_CONFIG.steps[RESOLUTION_CONFIG.steps.length - 1]}
              disabled={isDisabled}
              aria-label={`${RESOLUTION_CONFIG.label} input`}
            />
          </div>
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div 
            className={styles.sliderFill}
            style={{ 
              width: `calc(${resolutionIndex >= 0 ? (resolutionIndex / (RESOLUTION_CONFIG.steps.length - 1)) * 100 : 0}% - 16px)` 
            }}
          />
          <input
            type="range"
            className={styles.sliderInput}
            min={0}
            max={RESOLUTION_CONFIG.steps.length - 1}
            step={1}
            value={resolutionIndex >= 0 ? resolutionIndex : 0}
            onChange={handleResolutionChange}
            disabled={isDisabled}
            aria-label={RESOLUTION_CONFIG.label}
          />
          <div 
            className={styles.sliderThumb}
            style={{ 
              left: `calc(8px + ${resolutionIndex >= 0 ? (resolutionIndex / (RESOLUTION_CONFIG.steps.length - 1)) : 0} * (100% - 16px))` 
            }}
          />
        </div>
      </div>

      {/* 色数選択スライダー */}
      <div className={styles.control}>
        <div className={styles.label}>
          <span>{COLOR_DEPTH_CONFIG.label}</span>
          <input
            type="number"
            className={styles.numberInput}
            value={colorDepthInput}
            onChange={handleColorDepthInputChange}
            onBlur={handleColorDepthInputBlur}
            min={COLOR_DEPTH_CONFIG.steps[0]}
            max={COLOR_DEPTH_CONFIG.steps[COLOR_DEPTH_CONFIG.steps.length - 1]}
            disabled={isDisabled}
            aria-label={`${COLOR_DEPTH_CONFIG.label} input`}
          />
        </div>
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div 
            className={styles.sliderFill}
            style={{ 
              width: `calc(${colorDepthIndex >= 0 ? (colorDepthIndex / (COLOR_DEPTH_CONFIG.steps.length - 1)) * 100 : 0}% - 16px)` 
            }}
          />
          <input
            type="range"
            className={styles.sliderInput}
            min={0}
            max={COLOR_DEPTH_CONFIG.steps.length - 1}
            step={1}
            value={colorDepthIndex >= 0 ? colorDepthIndex : 0}
            onChange={handleColorDepthChange}
            disabled={isDisabled}
            aria-label={COLOR_DEPTH_CONFIG.label}
          />
          <div 
            className={styles.sliderThumb}
            style={{ 
                left: `calc(8px + ${colorDepthIndex >= 0 ? (colorDepthIndex / (COLOR_DEPTH_CONFIG.steps.length - 1)) : 0} * (100% - 16px))` 
            }}
          />
        </div>
      </div>

      {/* ディザリングチェックボックス */}
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          className={styles.checkboxInput}
          checked={parameters.dithering}
          onChange={handleDitheringChange}
          disabled={isDisabled}
        />
        <span className={styles.checkboxVisual} />
        <span className={styles.checkboxLabel}>Dithering</span>
      </label>
    </div>
  )
}