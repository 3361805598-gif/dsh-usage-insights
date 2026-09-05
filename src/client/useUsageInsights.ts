import { useCallback, useEffect, useRef, useState } from 'react'
import { getSummary, rebuildIndex } from './api.js'
import type { UsageRange, UsageSummaryV1 } from '../types.js'

/** Own request lifetimes here; presentation components never fetch. */
export function useUsageInsights(range: UsageRange) {
  const [stored, setStored] = useState<UsageSummaryV1>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [rebuilding, setRebuilding] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const rebuildRequest = useRef<AbortController>()
  const data = stored?.range === range ? stored : undefined

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      setLoading(true)
      try {
        const value = await getSummary(range, controller.signal)
        if (!controller.signal.aborted) { setStored(value); setError(undefined) }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '无法读取分析数据')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          timer = setTimeout(() => void poll(), 10_000)
        }
      }
    }
    setError(undefined)
    void poll()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [range, refresh])

  useEffect(() => () => rebuildRequest.current?.abort(), [])
  const reload = useCallback(() => setRefresh((value) => value + 1), [])
  const rebuild = useCallback(async () => {
    if (rebuildRequest.current) return
    const controller = new AbortController()
    rebuildRequest.current = controller
    setRebuilding(true)
    try {
      await rebuildIndex(controller.signal)
      if (!controller.signal.aborted) reload()
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '无法启动重建')
    } finally {
      if (!controller.signal.aborted) setRebuilding(false)
      rebuildRequest.current = undefined
    }
  }, [reload])
  return { data, error, loading, rebuilding, reload, rebuild }
}
