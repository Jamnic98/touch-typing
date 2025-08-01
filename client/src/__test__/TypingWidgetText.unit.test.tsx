import { vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TypingWidgetText, type TypingWidgetTextProps } from 'components'
import { CursorStyles, SpaceSymbols, spaceSymbolMap } from 'types'
import { STYLE_HIT, STYLE_MISS, STYLE_NONE } from 'utils'

const textToType = 'hi me'

const defaultOnStartFunc = vi.fn().mockResolvedValue(null)

// Updated onComplete mock to simulate fetching new text by resetting textToType
const defaultOnCompleteFunc = vi.fn().mockImplementation(async () => {
  // simulate fetch / reset
  renderTypingWidgetText({ textToType: textToType } as TypingWidgetTextProps)
})

const defaultOnTypeFunc = vi.fn().mockResolvedValue(null)

let currentProps: TypingWidgetTextProps

const renderTypingWidgetText = (props?: TypingWidgetTextProps) => {
  currentProps = {
    textToType: textToType,
    onStart: defaultOnStartFunc,
    onComplete: defaultOnCompleteFunc,
    onType: defaultOnTypeFunc,
    reset: props && typeof props.reset === 'function' ? props.reset : () => {},
    ...props,
  }
  const typingWidget = <TypingWidgetText {...currentProps} />
  render(typingWidget)
}

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('Test Rendering', () => {
  test('Renders with defaultProps', () => {
    renderTypingWidgetText()
    const typingWidget = screen.getByTestId('typing-widget-text')
    expect(typingWidget).toBeInTheDocument()
  })

  test("Doesn't render with no text to type", async () => {
    renderTypingWidgetText({
      textToType: '',
      fontSettings: { spaceSymbol: SpaceSymbols.UNDERSCORE },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: function (): void {},
    })
    const typingWidget = screen.queryByTestId('typing-widget-text')
    expect(typingWidget).not.toBeInTheDocument()
  })

  test('Renders characters with spaces', () => {
    renderTypingWidgetText({
      textToType: textToType,
      fontSettings: { spaceSymbol: SpaceSymbols.UNDERSCORE },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: function (): void {},
    })

    // test background text
    const backgroundText = screen.getAllByTestId('background-character')
    expect(backgroundText).toHaveLength(textToType.length)
    expect(backgroundText[0]).toHaveTextContent(textToType[0])
    expect(backgroundText[1]).toHaveTextContent(textToType[1])
    expect(backgroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(backgroundText[3]).toHaveTextContent(textToType[3])
    expect(backgroundText[4]).toHaveTextContent(textToType[4])

    // test foreground text
    const foregroundText = screen.getAllByTestId('foreground-character')
    expect(foregroundText).toHaveLength(textToType.length)
    expect(foregroundText[0]).toHaveTextContent(textToType[0])
    expect(foregroundText[1]).toHaveTextContent(textToType[1])
    expect(foregroundText[2]).toHaveTextContent(spaceSymbolMap[SpaceSymbols.UNDERSCORE])
    expect(foregroundText[3]).toHaveTextContent(textToType[3])
    expect(foregroundText[4]).toHaveTextContent(textToType[4])
  })
})

describe('Test functionality', () => {
  test('Updates text style on key press', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: textToType,
      fontSettings: { textColor: 'black', cursorStyle: CursorStyles.BLOCK },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: function (): void {},
    })

    const characters = screen.getAllByTestId('background-character')
    const typingWidgetText = screen.getByTestId('typing-widget-text')

    // focus on the typing widget
    await user.click(typingWidgetText)
    expect(typingWidgetText).toHaveFocus()

    // check initial state
    expect(characters[0]).toHaveClass(STYLE_NONE)

    // 1st hit
    await user.keyboard(textToType[0])
    expect(characters[0]).toHaveClass(STYLE_HIT)

    // 2nd hit
    await user.keyboard(textToType[1])
    expect(characters[1]).toHaveClass(STYLE_HIT)

    // 1st miss
    await user.keyboard('z')
    const character = screen.getAllByText('z')[1]
    expect(character).toHaveClass(STYLE_MISS)
    expect(characters[3]).toHaveClass(STYLE_NONE)

    // subsequent hit after miss
    await user.keyboard(textToType[3])
    expect(characters[3]).toHaveClass(STYLE_HIT)
  })

  test('Updates cursor position correctly', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText({
      textToType: textToType,
      fontSettings: { textColor: 'black', cursorStyle: CursorStyles.BLOCK },
      onStart: async () => {},
      onComplete: async () => {},
      onType: async () => {},
      reset: function (): void {},
    })

    const characterCursors = screen.getAllByTestId('character-cursor')
    const typingWidgetText = screen.getByTestId('typing-widget-text')

    // not focused, no cursor
    // await waitFor(() => expect(characterCursors[0]).not.toHaveClass('animate-flash-block'))

    // cursor appears when focused
    await user.click(typingWidgetText)
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // keystroke hit
    await user.keyboard(textToType[0])
    await waitFor(() => expect(characterCursors[1]).toHaveClass('animate-flash-block'))

    // keystroke miss
    await user.keyboard('z')
    await waitFor(() => expect(characterCursors[2]).toHaveClass('animate-flash-block'))

    // click off resets hides cursor and sets index to 0
    await user.click(document.body)
    await waitFor(() => {
      expect(characterCursors[2]).not.toHaveClass('animate-flash-block')
      expect(characterCursors[0]).not.toHaveClass('animate-flash-block')
    })

    // click back displays cursor at index 0
    await user.click(typingWidgetText)
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // backspace has no effect when cursor at index 0
    await user.keyboard('{backspace}')
    await waitFor(() => expect(characterCursors[0]).toHaveClass('animate-flash-block'))

    // move cursor forward to index 2 with 1 correct typed char and 1 incorrect typed char
    await user.keyboard(textToType[0])
    await user.keyboard('z')
    await waitFor(() => {
      expect(characterCursors[0]).not.toHaveClass('animate-flash-block')
      expect(characterCursors[2]).toHaveClass('animate-flash-block')
    })

    // backspace moves cursor back
    await user.keyboard('{backspace}')
    await waitFor(() => {
      expect(characterCursors[2]).not.toHaveClass('animate-flash-block')
      expect(characterCursors[1]).toHaveClass('animate-flash-block')
    })

    // cursor doesnt overwrite correctly typed text
    await user.keyboard('{backspace}')
    await waitFor(() => {
      expect(characterCursors[1]).toHaveClass('animate-flash-block')
      expect(characterCursors[0]).not.toHaveClass('animate-flash-block')
    })
  })

  // TODO: unskip
  test.skip('Calls onType function for valid keystrokes ', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText()
    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(0)

    await user.keyboard(textToType[0])
    await user.keyboard(textToType[1])
    await user.keyboard(textToType[2])
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(3)

    await user.keyboard(' ')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(4)

    await user.keyboard('{backspace}')
    expect(defaultOnTypeFunc).toHaveBeenCalledTimes(4)
  })

  test('Calls onComplete upon text completion on correct final char and refreshes text correctly', async () => {
    const user = userEvent.setup()
    renderTypingWidgetText()

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string (textToType)
    for (const char of textToType) {
      await user.keyboard(char)
    }

    // expect onComplete function to have been called once
    expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1)

    // type each character in the string (textToType)
    for (const char of textToType) {
      await user.keyboard(char)
    }
  })

  test('Calls onComplete upon text completion on incorrect final char and refreshes text correctly', async () => {
    const user = userEvent.setup()

    renderTypingWidgetText()

    const typingWidgetText = screen.getByTestId('typing-widget-text')
    await user.click(typingWidgetText)

    // type each character in the string correct except for last key
    for (const char of textToType.slice(0, textToType.length - 1)) {
      await user.keyboard(char)
    }
    await user.keyboard('z')

    // Wait for onComplete to be called
    await waitFor(() => expect(defaultOnCompleteFunc).toHaveBeenCalledTimes(1))
  })
})
