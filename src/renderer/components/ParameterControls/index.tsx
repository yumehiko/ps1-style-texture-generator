import React, { useCallback } from 'react'
import { ProcessingParams } from '../../types/processing'
import { Tooltip } from '../Tooltip'
import styles from './ParameterControls.module.css'

interface ParameterControlsProps {
  parameters: ProcessingParams
  isDisabled?: boolean
  onParameterChange?: (params: Partial<ProcessingParams>) => void
}

// スライダーの設定
const RESOLUTION_CONFIG = {
  min: 32,
  max: 512,
  step: 32,
  label: 'Resolution (px)'
}

const COLOR_DEPTH_CONFIG = {
  min: 4,
  max: 256,
  step: 4,
  label: 'Color Depth'
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  isDisabled = false,
  onParameterChange
}) => {
  const handleResolutionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (onParameterChange) {
      onParameterChange({ resolution: value })
    }
  }, [onParameterChange])

  const handleColorDepthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (onParameterChange) {
      onParameterChange({ colorDepth: value })
    }
  }, [onParameterChange])

  const handleDitheringChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onParameterChange) {
      onParameterChange({ dithering: e.target.checked })
    }
  }, [onParameterChange])

  // スライダーの位置計算
  const getSliderPercentage = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100
  }

  return (
    <div className={styles.container}>
      {/* 長辺ピクセル数スライダー */}
      <Tooltip content="画像の長辺の最大ピクセル数を設定します。アスペクト比は維持されます。">
        <div className={styles.control}>
          <div className={styles.label}>
            <span>{RESOLUTION_CONFIG.label}</span>
            <span className={styles.value}>{parameters.resolution}</span>
          </div>
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div 
            className={styles.sliderFill}
            style={{ 
              width: `${getSliderPercentage(
                parameters.resolution, 
                RESOLUTION_CONFIG.min, 
                RESOLUTION_CONFIG.max
              )}%` 
            }}
          />
          <input
            type="range"
            className={styles.sliderInput}
            min={RESOLUTION_CONFIG.min}
            max={RESOLUTION_CONFIG.max}
            step={RESOLUTION_CONFIG.step}
            value={parameters.resolution}
            onChange={handleResolutionChange}
            disabled={isDisabled}
            aria-label={RESOLUTION_CONFIG.label}
          />
          <div 
            className={styles.sliderThumb}
            style={{ 
              left: `${getSliderPercentage(
                parameters.resolution, 
                RESOLUTION_CONFIG.min, 
                RESOLUTION_CONFIG.max
              )}%` 
            }}
          />
        </div>
      </div>
      </Tooltip>

      {/* 色数選択スライダー */}
      <Tooltip content="テクスチャで使用する色数を設定します。低い値でよりレトロな見た目になります。">
        <div className={styles.control}>
        <div className={styles.label}>
          <span>{COLOR_DEPTH_CONFIG.label}</span>
          <span className={styles.value}>{parameters.colorDepth}</span>
        </div>
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <div 
            className={styles.sliderFill}
            style={{ 
              width: `${getSliderPercentage(
                parameters.colorDepth, 
                COLOR_DEPTH_CONFIG.min, 
                COLOR_DEPTH_CONFIG.max
              )}%` 
            }}
          />
          <input
            type="range"
            className={styles.sliderInput}
            min={COLOR_DEPTH_CONFIG.min}
            max={COLOR_DEPTH_CONFIG.max}
            step={COLOR_DEPTH_CONFIG.step}
            value={parameters.colorDepth}
            onChange={handleColorDepthChange}
            disabled={isDisabled}
            aria-label={COLOR_DEPTH_CONFIG.label}
          />
          <div 
            className={styles.sliderThumb}
            style={{ 
              left: `${getSliderPercentage(
                parameters.colorDepth, 
                COLOR_DEPTH_CONFIG.min, 
                COLOR_DEPTH_CONFIG.max
              )}%` 
            }}
          />
        </div>
      </div>
      </Tooltip>

      <div className={styles.divider} />

      {/* ディザリングチェックボックス */}
      <Tooltip content="Floyd-Steinbergディザリングを適用します。グラデーションをより滑らかに表現できます。" position="bottom">
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
      </Tooltip>
    </div>
  )
}