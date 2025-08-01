import { useEffect, useReducer, useRef, useState } from 'react'
import { Accuracy, StopWatch, TypingWidgetText, WordsPerMin } from 'components'
import { fetchTypingString, getReadableErrorMessage, saveStats, useAlert, useUser } from 'api'
import {
  calculateAccuracy,
  calculateTypingSessionStats,
  calculateWpm,
  typingWidgetStateReducer,
} from 'utils/helpers'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
} from 'utils/constants'
import {
  TypingAction,
  AlertType,
  type KeyEvent,
  type FontSettings,
  type OnTypeParams,
  TypedStatus,
} from 'types'

export const TypingWidget = () => {
  const { token } = useUser()
  const { showAlert } = useAlert()

  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)

  const mistypedRef = useRef<Record<string, Record<string, number>>>({})
  const startTimestamp = useRef<number>(0)
  const deletedCharCount = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])

  const [displayTime, setDisplayTime] = useState(0)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  const fetchAndSetText = async () => {
    const newText = await fetchTypingString()
    dispatch({ type: 'SET_TEXT', payload: newText })
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      dispatch({ type: 'SET_TEXT', payload: savedText })
    } else {
      fetchAndSetText()
    }
  }, [])

  const reset = (): void => {
    setShowStats(false)
    dispatch({ type: 'RESET_SESSION' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    deletedCharCount.current = 0
    mistypedRef.current = {}
    keyEventQueue.current = []
  }

  const onStart = (): void => {
    reset()
    dispatch({ type: 'START' })
    startTimestamp.current = Date.now()
  }

  const onType = ({
    key,
    typedStatus,
    cursorIndex,
    timestamp,
    action,
    deleteCount = 0,
  }: OnTypeParams) => {
    deletedCharCount.current += deleteCount
    switch (action) {
      case TypingAction.BackspaceSingle:
        keyEventQueue.current.pop()
        break
      case TypingAction.ClearMissRange:
        for (let i = 0; i < deleteCount; i++) {
          keyEventQueue.current.pop()
        }
        break
      case TypingAction.AddKey:
      default:
        keyEventQueue.current.push({ key, typedStatus, cursorIndex, timestamp })
    }

    // Track mistyped keys
    if (typedStatus === TypedStatus.MISS && cursorIndex < state.text.length) {
      const intendedChar = state.text[cursorIndex]
      if (!mistypedRef.current[intendedChar]) {
        mistypedRef.current[intendedChar] = {}
      }
      mistypedRef.current[intendedChar][key] = (mistypedRef.current[intendedChar][key] || 0) + 1
    }

    // Live stats calculation as before...
    const typedText = keyEventQueue.current.map((e) => e.key).join('')
    const targetText = state.text ?? ''
    const now = Date.now()
    const elapsed = now - startTimestamp.current

    if (elapsed > 0 && typedText.length > 0) {
      const wpm = calculateWpm(targetText, typedText, elapsed)
      const accuracy = calculateAccuracy(targetText, typedText)
      dispatch({ type: 'UPDATE_STATS', payload: { wpm, accuracy } })
    }
  }

  const onComplete = async (correctedCharCount: number): Promise<void> => {
    if (!state.text) return

    const now = Date.now()
    const elapsedTime = now - startTimestamp.current

    dispatch({ type: 'STOP' })
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })
    setDisplayTime(elapsedTime)

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      state.text,
      correctedCharCount,
      deletedCharCount.current,
      startTimestamp.current,
      now,
      mistypedRef.current
    )

    dispatch({
      type: 'UPDATE_STATS',
      payload: { wpm: sessionStats.wpm, accuracy: sessionStats.accuracy },
    })

    try {
      await fetchAndSetText()
      setShowStats(true)
      token &&
        (await saveStats(
          {
            wpm: sessionStats.wpm,
            accuracy: sessionStats.accuracy,
            startTime: startTimestamp.current,
            endTime: now,
            practiceDuration: Math.floor(elapsedTime / 1000),
            correctedCharCount: sessionStats.correctedCharCount,
            deletedCharCount: sessionStats.deletedCharCount,
            correctCharsTyped: sessionStats.correctCharsTyped,
            totalCharsTyped: sessionStats.totalCharsTyped,
            errorCharCount: sessionStats.errorCharCount,
            unigraphs: sessionStats.unigraphs,
            digraphs: sessionStats.digraphs,
          },
          token
        ))

      localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')
    } catch (err) {
      console.error('Failed to save stats:', err)
      showAlert({
        title: 'Failed to save stats',
        message: getReadableErrorMessage(err),
        type: AlertType.ERROR,
      })
    }
  }

  return state.text ? (
    <div id="typing-widget" data-testid="typing-widget">
      <TypingWidgetText
        onStart={onStart}
        onComplete={onComplete}
        onType={onType}
        reset={reset}
        textToType={state.text}
        fontSettings={fontSettings}
      />
      <br />
      {showStats ? (
        <div id="stats" className="space-y-4">
          <WordsPerMin wpm={state.wpm} />
          <Accuracy accuracy={state.accuracy} />
          <StopWatch time={displayTime} />
        </div>
      ) : null}
    </div>
  ) : null
}
